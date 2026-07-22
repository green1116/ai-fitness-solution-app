/**
 * Evolution P8 — Final Verification
 * Runs freeze lock / gate / immutable manifest / rollback checks
 */

import { buildPlatformV1Manifest } from "../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../launch/signoff/governance.freeze.lock";
import { OPERATIONS_GOVERNANCE_COMPLETE_ID } from "../../operations/signoff/governance.freeze.lock";
import {
  EVOLUTION_P8_COMPONENT_LOCK,
  isEvolutionP8FreezeLockIntact,
  evolutionP8FreezeLockMatchesExpected,
  validateEvolutionP8DependencyChain,
} from "./governance.freeze.lock";
import {
  assertEvolutionP8ReleaseGatePass,
  checkEvolutionP8ReleaseGate,
  type ReleaseGateResult,
} from "./governance.release.gate";
import {
  assertEvolutionImmutableManifestFrozen,
  buildEvolutionImmutableManifest,
  type EvolutionImmutableManifest,
} from "./immutable.manifest";
import { buildEvolutionRollbackSnapshotIndex } from "./rollback.snapshot.index";

export type EvolutionP8FinalVerificationResult = {
  ok: boolean;
  lockIntact: boolean;
  lockMatches: boolean;
  chainOk: boolean;
  operationsOk: boolean;
  launchOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  gate: ReleaseGateResult;
  manifest: EvolutionImmutableManifest;
  summary: string;
};

export function runEvolutionP8FinalVerification(input?: {
  deploymentId?: string;
  pathExists?: (relativePath: string) => boolean;
}): EvolutionP8FinalVerificationResult {
  const lockIntact = isEvolutionP8FreezeLockIntact();
  const lockMatches = evolutionP8FreezeLockMatchesExpected();
  const chain = validateEvolutionP8DependencyChain();
  const platform = buildPlatformV1Manifest();
  const operationsOk =
    OPERATIONS_GOVERNANCE_COMPLETE_ID ===
    "enterprise-post-launch-operations-complete-v1";
  const launchOk =
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1";
  const e12Ok =
    E12_PRODUCTIZATION_COMPLETE_ID ===
    "enterprise-e12-productization-complete-v1";
  const platformOk = platform.aligned === true;

  if (input?.pathExists) {
    for (const component of EVOLUTION_P8_COMPONENT_LOCK) {
      if (!input.pathExists(component.path)) {
        return {
          ok: false,
          lockIntact,
          lockMatches,
          chainOk: chain.ok,
          operationsOk,
          launchOk,
          e12Ok,
          platformOk,
          gate: checkEvolutionP8ReleaseGate(),
          manifest: buildEvolutionImmutableManifest({
            deploymentId: input?.deploymentId,
          }),
          summary: `missing component path: ${component.path}`,
        };
      }
    }
  }

  const gate = checkEvolutionP8ReleaseGate();
  const manifest = buildEvolutionImmutableManifest({
    deploymentId: input?.deploymentId,
  });
  const rollback = buildEvolutionRollbackSnapshotIndex();

  const ok =
    lockIntact &&
    lockMatches &&
    chain.ok &&
    operationsOk &&
    launchOk &&
    e12Ok &&
    platformOk &&
    gate.result === "PASS" &&
    manifest.freezeState.frozen &&
    rollback.indexComplete;

  return {
    ok,
    lockIntact,
    lockMatches,
    chainOk: chain.ok,
    operationsOk,
    launchOk,
    e12Ok,
    platformOk,
    gate,
    manifest,
    summary: [
      `evolution-p8-final ok=${ok}`,
      `lock=${lockIntact && lockMatches}`,
      `chain=${chain.ok}`,
      `operations=${operationsOk}`,
      `launch=${launchOk}`,
      `e12=${e12Ok}`,
      `platform=${platformOk}`,
      `gate=${gate.result}`,
      `frozen=${manifest.freezeState.frozen}`,
    ].join(" "),
  };
}

export function assertEvolutionP8FinalVerificationPass(
  result: EvolutionP8FinalVerificationResult = runEvolutionP8FinalVerification(),
): asserts result is EvolutionP8FinalVerificationResult & { ok: true } {
  if (!result.ok) {
    throw new Error(
      `Evolution P8 final verification failed: ${result.summary}`,
    );
  }
  assertEvolutionP8ReleaseGatePass(result.gate);
  assertEvolutionImmutableManifestFrozen(result.manifest);
}

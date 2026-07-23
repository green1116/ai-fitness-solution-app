/**
 * Commercialization P8 — Final release verification
 * Runs freeze lock / gate / immutable manifest / rollback checks
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { validateCommercializationP8DependencyChain } from "../freeze/freeze.dependency";
import {
  COMMERCIALIZATION_P8_COMPONENT_LOCK,
  commercializationP8FreezeLockMatchesExpected,
  isCommercializationP8FreezeLockIntact,
} from "../freeze/freeze.lock";
import {
  assertCommercializationImmutableManifestFrozen,
  buildCommercializationImmutableManifest,
  type CommercializationImmutableManifest,
} from "../freeze/freeze.manifest";
import { buildCommercializationRollbackSnapshotIndex } from "../rollback/rollback.index";
import {
  assertCommercializationP8ReleaseGatePass,
  checkCommercializationP8ReleaseGate,
  type ReleaseGateResult,
} from "./release.gate";

export type CommercializationP8FinalVerificationResult = {
  ok: boolean;
  lockIntact: boolean;
  lockMatches: boolean;
  chainOk: boolean;
  evolutionOk: boolean;
  launchOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  gate: ReleaseGateResult;
  manifest: CommercializationImmutableManifest;
  summary: string;
};

export function runCommercializationP8FinalVerification(input?: {
  deploymentId?: string;
  pathExists?: (relativePath: string) => boolean;
}): CommercializationP8FinalVerificationResult {
  const lockIntact = isCommercializationP8FreezeLockIntact();
  const lockMatches = commercializationP8FreezeLockMatchesExpected();
  const chain = validateCommercializationP8DependencyChain();
  const platform = buildPlatformV1Manifest();
  const evolutionOk =
    ENTERPRISE_EVOLUTION_COMPLETE_ID === "enterprise-evolution-complete-v1";
  const launchOk =
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1";
  const e12Ok =
    E12_PRODUCTIZATION_COMPLETE_ID ===
    "enterprise-e12-productization-complete-v1";
  const platformOk = platform.aligned === true;

  if (input?.pathExists) {
    for (const component of COMMERCIALIZATION_P8_COMPONENT_LOCK) {
      if (!input.pathExists(component.path)) {
        return {
          ok: false,
          lockIntact,
          lockMatches,
          chainOk: chain.ok,
          evolutionOk,
          launchOk,
          e12Ok,
          platformOk,
          gate: checkCommercializationP8ReleaseGate(),
          manifest: buildCommercializationImmutableManifest({
            deploymentId: input?.deploymentId,
          }),
          summary: `missing component path: ${component.path}`,
        };
      }
    }
  }

  const gate = checkCommercializationP8ReleaseGate();
  const manifest = buildCommercializationImmutableManifest({
    deploymentId: input?.deploymentId,
  });
  const rollback = buildCommercializationRollbackSnapshotIndex();

  const ok =
    lockIntact &&
    lockMatches &&
    chain.ok &&
    evolutionOk &&
    launchOk &&
    e12Ok &&
    platformOk &&
    gate.result === "PASS" &&
    manifest.freezeState.frozen &&
    manifest.readOnly === true &&
    rollback.indexComplete;

  return {
    ok,
    lockIntact,
    lockMatches,
    chainOk: chain.ok,
    evolutionOk,
    launchOk,
    e12Ok,
    platformOk,
    gate,
    manifest,
    summary: [
      `commercialization-p8-final ok=${ok}`,
      `gate=${gate.result}`,
      `frozen=${manifest.freezeState.frozen}`,
      `rollback=${rollback.indexComplete}`,
    ].join(" "),
  };
}

export function assertCommercializationP8FinalVerificationPass(
  result: CommercializationP8FinalVerificationResult = runCommercializationP8FinalVerification(),
): asserts result is CommercializationP8FinalVerificationResult & {
  ok: true;
} {
  assertCommercializationP8ReleaseGatePass(result.gate);
  assertCommercializationImmutableManifestFrozen(result.manifest);
  if (!result.ok) {
    throw new Error(
      `Commercialization P8 final verification failed: ${result.summary}`,
    );
  }
}

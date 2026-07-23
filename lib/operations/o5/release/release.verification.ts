/**
 * Operations O5 — Final release verification
 * Runs freeze lock / gate / immutable manifest / rollback checks
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { validateOperationsO5DependencyChain } from "../freeze/freeze.dependency";
import {
  OPERATIONS_O5_COMPONENT_LOCK,
  isOperationsO5FreezeLockIntact,
  operationsO5FreezeLockMatchesExpected,
} from "../freeze/freeze.lock";
import {
  assertOperationsImmutableManifestFrozen,
  buildOperationsImmutableManifest,
  type OperationsImmutableManifest,
} from "../freeze/freeze.manifest";
import { buildOperationsRollbackSnapshotIndex } from "../rollback/rollback.index";
import {
  assertOperationsO5ReleaseGatePass,
  checkOperationsO5ReleaseGate,
  type ReleaseGateResult,
} from "./release.gate";

export type OperationsO5FinalVerificationResult = {
  ok: boolean;
  lockIntact: boolean;
  lockMatches: boolean;
  chainOk: boolean;
  launchReadinessOk: boolean;
  commercializationOk: boolean;
  evolutionOk: boolean;
  launchOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  gate: ReleaseGateResult;
  manifest: OperationsImmutableManifest;
  summary: string;
};

export function runOperationsO5FinalVerification(input?: {
  deploymentId?: string;
  pathExists?: (relativePath: string) => boolean;
}): OperationsO5FinalVerificationResult {
  const lockIntact = isOperationsO5FreezeLockIntact();
  const lockMatches = operationsO5FreezeLockMatchesExpected();
  const chain = validateOperationsO5DependencyChain();
  const platform = buildPlatformV1Manifest();
  const launchReadinessOk =
    ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
    "enterprise-launch-readiness-complete-v1";
  const commercializationOk =
    ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
    "enterprise-commercialization-complete-v1";
  const evolutionOk =
    ENTERPRISE_EVOLUTION_COMPLETE_ID === "enterprise-evolution-complete-v1";
  const launchOk =
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1";
  const e12Ok =
    E12_PRODUCTIZATION_COMPLETE_ID ===
    "enterprise-e12-productization-complete-v1";
  const platformOk = platform.aligned === true;

  if (input?.pathExists) {
    for (const component of OPERATIONS_O5_COMPONENT_LOCK) {
      if (!input.pathExists(component.path)) {
        return {
          ok: false,
          lockIntact,
          lockMatches,
          chainOk: chain.ok,
          launchReadinessOk,
          commercializationOk,
          evolutionOk,
          launchOk,
          e12Ok,
          platformOk,
          gate: checkOperationsO5ReleaseGate(),
          manifest: buildOperationsImmutableManifest({
            deploymentId: input?.deploymentId,
          }),
          summary: `missing component path: ${component.path}`,
        };
      }
    }
  }

  const gate = checkOperationsO5ReleaseGate();
  const manifest = buildOperationsImmutableManifest({
    deploymentId: input?.deploymentId,
  });
  const rollback = buildOperationsRollbackSnapshotIndex();

  const ok =
    lockIntact &&
    lockMatches &&
    chain.ok &&
    launchReadinessOk &&
    commercializationOk &&
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
    launchReadinessOk,
    commercializationOk,
    evolutionOk,
    launchOk,
    e12Ok,
    platformOk,
    gate,
    manifest,
    summary: [
      `operations-o5-final ok=${ok}`,
      `gate=${gate.result}`,
      `frozen=${manifest.freezeState.frozen}`,
      `rollback=${rollback.indexComplete}`,
    ].join(" "),
  };
}

export function assertOperationsO5FinalVerificationPass(
  result: OperationsO5FinalVerificationResult = runOperationsO5FinalVerification(),
): asserts result is OperationsO5FinalVerificationResult & {
  ok: true;
} {
  assertOperationsO5ReleaseGatePass(result.gate);
  assertOperationsImmutableManifestFrozen(result.manifest);
  if (!result.ok) {
    throw new Error(
      `Operations O5 final verification failed: ${result.summary}`,
    );
  }
}

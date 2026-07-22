/**
 * Post-Launch P8 — Final Verification
 * Runs freeze lock / gate / immutable manifest / rollback checks
 */

import { buildPlatformV1Manifest } from "../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../launch/signoff/governance.freeze.lock";
import {
  OPERATIONS_P8_COMPONENT_LOCK,
  isOperationsP8FreezeLockIntact,
  operationsP8FreezeLockMatchesExpected,
  validateOperationsP8DependencyChain,
} from "./governance.freeze.lock";
import {
  assertOperationsP8ReleaseGatePass,
  checkOperationsP8ReleaseGate,
  type ReleaseGateResult,
} from "./governance.release.gate";
import {
  assertOperationsImmutableManifestFrozen,
  buildOperationsImmutableManifest,
  type OperationsImmutableManifest,
} from "./immutable.manifest";
import { buildOperationsRollbackSnapshotIndex } from "./rollback.snapshot.index";

export type OperationsP8FinalVerificationResult = {
  ok: boolean;
  lockIntact: boolean;
  lockMatches: boolean;
  chainOk: boolean;
  launchOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  gate: ReleaseGateResult;
  manifest: OperationsImmutableManifest;
  summary: string;
};

export function runOperationsP8FinalVerification(input?: {
  deploymentId?: string;
  pathExists?: (relativePath: string) => boolean;
}): OperationsP8FinalVerificationResult {
  const lockIntact = isOperationsP8FreezeLockIntact();
  const lockMatches = operationsP8FreezeLockMatchesExpected();
  const chain = validateOperationsP8DependencyChain();
  const platform = buildPlatformV1Manifest();
  const launchOk =
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1";
  const e12Ok =
    E12_PRODUCTIZATION_COMPLETE_ID ===
    "enterprise-e12-productization-complete-v1";
  const platformOk = platform.aligned === true;

  if (input?.pathExists) {
    for (const component of OPERATIONS_P8_COMPONENT_LOCK) {
      if (!input.pathExists(component.path)) {
        return {
          ok: false,
          lockIntact,
          lockMatches,
          chainOk: chain.ok,
          launchOk,
          e12Ok,
          platformOk,
          gate: checkOperationsP8ReleaseGate(),
          manifest: buildOperationsImmutableManifest({
            deploymentId: input?.deploymentId,
          }),
          summary: `missing component path: ${component.path}`,
        };
      }
    }
  }

  const gate = checkOperationsP8ReleaseGate();
  const manifest = buildOperationsImmutableManifest({
    deploymentId: input?.deploymentId,
  });
  const rollback = buildOperationsRollbackSnapshotIndex();

  const ok =
    lockIntact &&
    lockMatches &&
    chain.ok &&
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
    launchOk,
    e12Ok,
    platformOk,
    gate,
    manifest,
    summary: [
      `operations-p8-final ok=${ok}`,
      `lock=${lockIntact && lockMatches}`,
      `chain=${chain.ok}`,
      `launch=${launchOk}`,
      `e12=${e12Ok}`,
      `platform=${platformOk}`,
      `gate=${gate.result}`,
      `frozen=${manifest.freezeState.frozen}`,
    ].join(" "),
  };
}

export function assertOperationsP8FinalVerificationPass(
  result: OperationsP8FinalVerificationResult = runOperationsP8FinalVerification(),
): asserts result is OperationsP8FinalVerificationResult & { ok: true } {
  if (!result.ok) {
    throw new Error(
      `Operations P8 final verification failed: ${result.summary}`,
    );
  }
  assertOperationsP8ReleaseGatePass(result.gate);
  assertOperationsImmutableManifestFrozen(result.manifest);
}

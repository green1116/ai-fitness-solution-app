/**
 * Launch P8 — Final Verification
 * Runs freeze lock / gate / immutable manifest / rollback checks
 */

import { buildPlatformV1Manifest } from "../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../product/e12/signoff/governance.freeze.lock";
import {
  LAUNCH_P8_COMPONENT_LOCK,
  isLaunchP8FreezeLockIntact,
  launchP8FreezeLockMatchesExpected,
  validateLaunchP8DependencyChain,
} from "./governance.freeze.lock";
import {
  assertLaunchP8ReleaseGatePass,
  checkLaunchP8ReleaseGate,
  type ReleaseGateResult,
} from "./governance.release.gate";
import {
  assertLaunchImmutableManifestFrozen,
  buildLaunchImmutableManifest,
  type LaunchImmutableManifest,
} from "./immutable.manifest";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";

export type LaunchP8FinalVerificationResult = {
  ok: boolean;
  lockIntact: boolean;
  lockMatches: boolean;
  chainOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  gate: ReleaseGateResult;
  manifest: LaunchImmutableManifest;
  summary: string;
};

export function runLaunchP8FinalVerification(input?: {
  deploymentId?: string;
  pathExists?: (relativePath: string) => boolean;
}): LaunchP8FinalVerificationResult {
  const lockIntact = isLaunchP8FreezeLockIntact();
  const lockMatches = launchP8FreezeLockMatchesExpected();
  const chain = validateLaunchP8DependencyChain();
  const platform = buildPlatformV1Manifest();
  const e12Ok =
    E12_PRODUCTIZATION_COMPLETE_ID ===
    "enterprise-e12-productization-complete-v1";
  const platformOk = platform.aligned === true;

  if (input?.pathExists) {
    for (const component of LAUNCH_P8_COMPONENT_LOCK) {
      if (!input.pathExists(component.path)) {
        return {
          ok: false,
          lockIntact,
          lockMatches,
          chainOk: chain.ok,
          e12Ok,
          platformOk,
          gate: checkLaunchP8ReleaseGate(),
          manifest: buildLaunchImmutableManifest({
            deploymentId: input?.deploymentId,
          }),
          summary: `missing component path: ${component.path}`,
        };
      }
    }
  }

  const gate = checkLaunchP8ReleaseGate();
  const manifest = buildLaunchImmutableManifest({
    deploymentId: input?.deploymentId,
  });
  const rollback = buildRollbackSnapshotIndex();

  const ok =
    lockIntact &&
    lockMatches &&
    chain.ok &&
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
    e12Ok,
    platformOk,
    gate,
    manifest,
    summary: [
      `launch-p8-final ok=${ok}`,
      `lock=${lockIntact && lockMatches}`,
      `chain=${chain.ok}`,
      `e12=${e12Ok}`,
      `platform=${platformOk}`,
      `gate=${gate.result}`,
      `frozen=${manifest.freezeState.frozen}`,
    ].join(" "),
  };
}

export function assertLaunchP8FinalVerificationPass(
  result: LaunchP8FinalVerificationResult = runLaunchP8FinalVerification(),
): asserts result is LaunchP8FinalVerificationResult & { ok: true } {
  if (!result.ok) {
    throw new Error(`Launch P8 final verification failed: ${result.summary}`);
  }
  assertLaunchP8ReleaseGatePass(result.gate);
  assertLaunchImmutableManifestFrozen(result.manifest);
}

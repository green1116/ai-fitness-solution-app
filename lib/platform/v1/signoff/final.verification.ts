/**
 * Platform v1 — Final Verification
 * Runs freeze lock / gate / immutable manifest / rollback checks
 */

import { isEnterpriseDependencyMapAligned } from "../dependency.map";
import { buildPlatformV1Manifest } from "../platform.manifest";
import {
  PLATFORM_V1_P8_COMPONENT_LOCK,
  platformV1P8FreezeLockMatchesExpected,
  isPlatformV1P8FreezeLockIntact,
  validatePlatformV1P8CompleteChain,
} from "./governance.freeze.lock";
import {
  assertPlatformV1GovernanceReleaseGatePass,
  checkPlatformV1GovernanceReleaseGate,
  type ReleaseGateResult,
} from "./governance.release.gate";
import {
  assertPlatformV1ImmutableManifestFrozen,
  buildPlatformV1ImmutableManifest,
  type PlatformV1ImmutableManifest,
} from "./immutable.manifest";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";

export type PlatformV1FinalVerificationResult = {
  ok: boolean;
  lockIntact: boolean;
  lockMatches: boolean;
  chainOk: boolean;
  alignmentOk: boolean;
  gate: ReleaseGateResult;
  manifest: PlatformV1ImmutableManifest;
  summary: string;
};

export function runPlatformV1FinalVerification(input?: {
  deploymentId?: string;
  pathExists?: (relativePath: string) => boolean;
}): PlatformV1FinalVerificationResult {
  const lockIntact = isPlatformV1P8FreezeLockIntact();
  const lockMatches = platformV1P8FreezeLockMatchesExpected();
  const chain = validatePlatformV1P8CompleteChain();
  const alignmentManifest = buildPlatformV1Manifest();
  const alignmentOk =
    alignmentManifest.aligned && isEnterpriseDependencyMapAligned();

  if (input?.pathExists) {
    for (const component of PLATFORM_V1_P8_COMPONENT_LOCK) {
      if (!input.pathExists(component.path)) {
        return {
          ok: false,
          lockIntact,
          lockMatches,
          chainOk: chain.ok,
          alignmentOk,
          gate: checkPlatformV1GovernanceReleaseGate(),
          manifest: buildPlatformV1ImmutableManifest({
            deploymentId: input?.deploymentId,
          }),
          summary: `missing component path: ${component.path}`,
        };
      }
    }
  }

  const gate = checkPlatformV1GovernanceReleaseGate();
  const manifest = buildPlatformV1ImmutableManifest({
    deploymentId: input?.deploymentId,
  });
  const rollback = buildRollbackSnapshotIndex();

  const ok =
    lockIntact &&
    lockMatches &&
    chain.ok &&
    alignmentOk &&
    gate.result === "PASS" &&
    manifest.freezeState.frozen &&
    rollback.indexComplete;

  return {
    ok,
    lockIntact,
    lockMatches,
    chainOk: chain.ok,
    alignmentOk,
    gate,
    manifest,
    summary: [
      `platform-v1-final ok=${ok}`,
      `lock=${lockIntact && lockMatches}`,
      `chain=${chain.ok}`,
      `alignment=${alignmentOk}`,
      `gate=${gate.result}`,
      `frozen=${manifest.freezeState.frozen}`,
    ].join(" "),
  };
}

export function assertPlatformV1FinalVerificationPass(
  result: PlatformV1FinalVerificationResult = runPlatformV1FinalVerification(),
): asserts result is PlatformV1FinalVerificationResult & { ok: true } {
  if (!result.ok) {
    throw new Error(
      `Platform v1 final verification failed: ${result.summary}`,
    );
  }
  assertPlatformV1GovernanceReleaseGatePass(result.gate);
  assertPlatformV1ImmutableManifestFrozen(result.manifest);
}

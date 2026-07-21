/**
 * E12-P8 — Final Verification
 * Runs freeze lock / gate / immutable manifest / rollback checks
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  E12_P8_COMPONENT_LOCK,
  e12P8FreezeLockMatchesExpected,
  isE12P8FreezeLockIntact,
  validateE12P8DependencyChain,
} from "./governance.freeze.lock";
import {
  assertE12P8ReleaseGatePass,
  checkE12P8ReleaseGate,
  type ReleaseGateResult,
} from "./governance.release.gate";
import {
  assertE12ImmutableManifestFrozen,
  buildE12ImmutableManifest,
  type E12ImmutableManifest,
} from "./immutable.manifest";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";

export type E12P8FinalVerificationResult = {
  ok: boolean;
  lockIntact: boolean;
  lockMatches: boolean;
  chainOk: boolean;
  platformOk: boolean;
  gate: ReleaseGateResult;
  manifest: E12ImmutableManifest;
  summary: string;
};

export function runE12P8FinalVerification(input?: {
  deploymentId?: string;
  pathExists?: (relativePath: string) => boolean;
}): E12P8FinalVerificationResult {
  const lockIntact = isE12P8FreezeLockIntact();
  const lockMatches = e12P8FreezeLockMatchesExpected();
  const chain = validateE12P8DependencyChain();
  const platform = buildPlatformV1Manifest();
  const platformOk = platform.aligned === true;

  if (input?.pathExists) {
    for (const component of E12_P8_COMPONENT_LOCK) {
      if (!input.pathExists(component.path)) {
        return {
          ok: false,
          lockIntact,
          lockMatches,
          chainOk: chain.ok,
          platformOk,
          gate: checkE12P8ReleaseGate(),
          manifest: buildE12ImmutableManifest({
            deploymentId: input?.deploymentId,
          }),
          summary: `missing component path: ${component.path}`,
        };
      }
    }
  }

  const gate = checkE12P8ReleaseGate();
  const manifest = buildE12ImmutableManifest({
    deploymentId: input?.deploymentId,
  });
  const rollback = buildRollbackSnapshotIndex();

  const ok =
    lockIntact &&
    lockMatches &&
    chain.ok &&
    platformOk &&
    gate.result === "PASS" &&
    manifest.freezeState.frozen &&
    rollback.indexComplete;

  return {
    ok,
    lockIntact,
    lockMatches,
    chainOk: chain.ok,
    platformOk,
    gate,
    manifest,
    summary: [
      `e12-p8-final ok=${ok}`,
      `lock=${lockIntact && lockMatches}`,
      `chain=${chain.ok}`,
      `platform=${platformOk}`,
      `gate=${gate.result}`,
      `frozen=${manifest.freezeState.frozen}`,
    ].join(" "),
  };
}

export function assertE12P8FinalVerificationPass(
  result: E12P8FinalVerificationResult = runE12P8FinalVerification(),
): asserts result is E12P8FinalVerificationResult & { ok: true } {
  if (!result.ok) {
    throw new Error(`E12-P8 final verification failed: ${result.summary}`);
  }
  assertE12P8ReleaseGatePass(result.gate);
  assertE12ImmutableManifestFrozen(result.manifest);
}

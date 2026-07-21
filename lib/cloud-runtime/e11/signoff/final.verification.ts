/**
 * E11-P8 — Final Verification
 * Runs freeze lock / integrity / gate / manifest checks
 */

import {
  checkE11P8ComponentIntegrity,
  validateE11P8ComponentLockStructure,
} from "./component.integrity";
import {
  e11P8FreezeLockMatchesExpected,
  isE11P8FreezeLockIntact,
  validateE11P8DependencyChain,
} from "./governance.freeze.lock";
import {
  assertE11P8ReleaseGatePass,
  checkE11P8ReleaseGate,
  type ReleaseGateResult,
} from "./governance.release.gate";
import {
  assertE11P8FreezePass,
  buildE11P8FreezeManifest,
  type E11P8FreezeManifest,
} from "./governance.signoff.manifest";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";

export type E11P8FinalVerificationResult = {
  ok: boolean;
  lockIntact: boolean;
  lockMatches: boolean;
  chainOk: boolean;
  componentStructureOk: boolean;
  componentIntegrityOk: boolean;
  gate: ReleaseGateResult;
  manifest: E11P8FreezeManifest;
  summary: string;
};

export function runE11P8FinalVerification(input?: {
  deploymentId?: string;
  pathExists?: (relativePath: string) => boolean;
}): E11P8FinalVerificationResult {
  const lockIntact = isE11P8FreezeLockIntact();
  const lockMatches = e11P8FreezeLockMatchesExpected();
  const chain = validateE11P8DependencyChain();
  const componentStructure = validateE11P8ComponentLockStructure();
  const integrity = input?.pathExists
    ? checkE11P8ComponentIntegrity(input.pathExists)
    : { ok: componentStructure.ok, missing: [], failures: componentStructure.failures, checked: 0, summary: "skipped" };

  const gate = checkE11P8ReleaseGate();
  const manifest = buildE11P8FreezeManifest({
    deploymentId: input?.deploymentId,
  });
  const rollback = buildRollbackSnapshotIndex();

  const ok =
    lockIntact &&
    lockMatches &&
    chain.ok &&
    componentStructure.ok &&
    integrity.ok &&
    gate.result === "PASS" &&
    manifest.freezeState.frozen &&
    rollback.indexComplete;

  return {
    ok,
    lockIntact,
    lockMatches,
    chainOk: chain.ok,
    componentStructureOk: componentStructure.ok,
    componentIntegrityOk: integrity.ok,
    gate,
    manifest,
    summary: [
      `e11-p8-final ok=${ok}`,
      `lock=${lockIntact && lockMatches}`,
      `chain=${chain.ok}`,
      `integrity=${integrity.ok}`,
      `gate=${gate.result}`,
      `frozen=${manifest.freezeState.frozen}`,
    ].join(" "),
  };
}

export function assertE11P8FinalVerificationPass(
  result: E11P8FinalVerificationResult = runE11P8FinalVerification(),
): asserts result is E11P8FinalVerificationResult & { ok: true } {
  if (!result.ok) {
    throw new Error(`E11-P8 final verification failed: ${result.summary}`);
  }
  assertE11P8ReleaseGatePass(result.gate);
  assertE11P8FreezePass(result.manifest);
}

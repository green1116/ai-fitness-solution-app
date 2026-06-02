/**
 * V3.7 FINAL Production Release Baseline —unified foundation
 */

export * from "./shared";
export * from "./release-context";
export * from "./freeze";
export * from "./baseline";
export * from "./integrity";
export * from "./snapshot";
export * from "./governance";
export * from "./final";

import { buildProductionFreezeManifest } from "./freeze/freeze-manifest";
import { buildReleaseBaselineSummary } from "./baseline/release-baseline-summary";
import { buildIntegrityVerification } from "./integrity/integrity-verification";
import { buildSnapshotManifest } from "./snapshot/snapshot-manifest";
import { buildFinalReleaseGovernanceBundle } from "./final/final-release-governance";
import { buildFinalReleaseSummary } from "./final/final-release-summary";
import { buildFreezeLockState } from "./freeze/freeze-lock";

export const V37_PRODUCTION_RELEASE_VERSION = "3.7-final-foundation-1" as const;

export type V37ProductionReleaseFoundation = {
  version: typeof V37_PRODUCTION_RELEASE_VERSION;
  foundationId: string;
  freeze: ReturnType<typeof buildProductionFreezeManifest>;
  baseline: ReturnType<typeof buildReleaseBaselineSummary>;
  integrity: ReturnType<typeof buildIntegrityVerification>;
  snapshots: ReturnType<typeof buildSnapshotManifest>;
  governance: ReturnType<typeof buildFinalReleaseGovernanceBundle>;
  final: ReturnType<typeof buildFinalReleaseSummary>;
  lock: ReturnType<typeof buildFreezeLockState>;
  foundationSummary: string;
};

export function buildV37ProductionReleaseFoundation(input?: {
  deploymentId?: string;
}): V37ProductionReleaseFoundation {
  const deploymentId = input?.deploymentId ?? "v37-production-release";
  const foundationId = `V37PRF-${deploymentId.slice(0, 8)}`;
  const freeze = buildProductionFreezeManifest({ deploymentId });
  const baseline = buildReleaseBaselineSummary({ deploymentId });
  const integrity = buildIntegrityVerification({ deploymentId });
  const snapshots = buildSnapshotManifest({ deploymentId });
  const governance = buildFinalReleaseGovernanceBundle({ deploymentId });
  const final = buildFinalReleaseSummary({ deploymentId });
  const lock = buildFreezeLockState({ deploymentId });

  return {
    version: V37_PRODUCTION_RELEASE_VERSION,
    foundationId,
    freeze,
    baseline,
    integrity,
    snapshots,
    governance,
    final,
    lock,
    foundationSummary: `v37-production-release id=${foundationId} freeze=${freeze.freezeId} productionReady=${final.productionReady} locked=${lock.locked} confidence=${final.readiness.confidenceScore}`,
  };
}

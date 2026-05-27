/**
 * V3.7 FINAL —final release readiness
 */

import { getEnterpriseStackSnapshot } from "../release-context";
import { buildFreezeLockState } from "../freeze/freeze-lock";
import { buildIntegrityVerification } from "../integrity/integrity-verification";
import { buildSnapshotRestorePlan } from "../snapshot/snapshot-restore";
import { buildReleaseBaseline } from "../baseline/release-baseline";
import { isBuildFreezeIntact } from "../shared";

export const FINAL_RELEASE_READINESS_VERSION = "3.7-final-readiness-1" as const;

export type FinalReleaseReadiness = {
  version: typeof FINAL_RELEASE_READINESS_VERSION;
  readinessId: string;
  freezeReadiness: boolean;
  baselineReadiness: boolean;
  integrityReadiness: boolean;
  snapshotReadiness: boolean;
  restorationReadiness: boolean;
  archivalReadiness: boolean;
  lifecycleReadiness: boolean;
  preservationReadiness: boolean;
  governanceReadiness: boolean;
  confidenceScore: number;
  summary: string;
};

function score(flags: boolean[]): number {
  return Math.round((flags.filter(Boolean).length / flags.length) * 100);
}

export function buildFinalReleaseReadiness(input?: { deploymentId?: string }): FinalReleaseReadiness {
  const deploymentId = input?.deploymentId ?? "final-readiness";
  const readinessId = `FRR-V37FINAL-${deploymentId.slice(0, 8)}`;
  const stack = getEnterpriseStackSnapshot(deploymentId);
  const lock = buildFreezeLockState({ deploymentId });
  const integrity = buildIntegrityVerification({ deploymentId });
  const snapshot = buildSnapshotRestorePlan({ deploymentId });
  const baseline = buildReleaseBaseline({ deploymentId });

  const freezeReadiness = lock.locked && isBuildFreezeIntact();
  const baselineReadiness = baseline.readyForProduction;
  const integrityReadiness = integrity.baselineVerified && integrity.preservationVerified;
  const snapshotReadiness = snapshot.restorePlanId.length > 0 && !snapshot.restoreGraph.includes("");
  const restorationReadiness = snapshot.restoreReady;
  const archivalReadiness = stack.summary.archivalClosureReady;
  const lifecycleReadiness = stack.summary.lifecycleClosureReady;
  const preservationReadiness = stack.summary.preservationReady;
  const governanceReadiness = stack.summary.governanceClosureReady;

  const flags = [
    freezeReadiness,
    baselineReadiness,
    integrityReadiness,
    snapshotReadiness,
    restorationReadiness,
    archivalReadiness,
    lifecycleReadiness,
    preservationReadiness,
    governanceReadiness,
  ];

  return {
    version: FINAL_RELEASE_READINESS_VERSION,
    readinessId,
    freezeReadiness,
    baselineReadiness,
    integrityReadiness,
    snapshotReadiness,
    restorationReadiness,
    archivalReadiness,
    lifecycleReadiness,
    preservationReadiness,
    governanceReadiness,
    confidenceScore: score(flags),
    summary: `final-readiness id=${readinessId} freeze=${freezeReadiness} baseline=${baselineReadiness} preservation=${preservationReadiness} confidence=${score(flags)}`,
  };
}

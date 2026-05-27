/**
 * V3.7 FINAL —snapshot restore graph
 */

import { buildSnapshotRuntime } from "./snapshot-runtime";
import { buildIntegrityRestoreVerification } from "../integrity/integrity-restore";

export const SNAPSHOT_RESTORE_VERSION = "3.7-final-snapshot-restore-1" as const;

export type SnapshotRestorePlan = {
  version: typeof SNAPSHOT_RESTORE_VERSION;
  restorePlanId: string;
  restoreGraph: string;
  rollbackLineage: string[];
  restoreReady: boolean;
  summary: string;
};

export function buildSnapshotRestorePlan(input?: { deploymentId?: string }): SnapshotRestorePlan {
  const deploymentId = input?.deploymentId ?? "snapshot-restore";
  const restorePlanId = `SNP-V37FINAL-${deploymentId.slice(0, 8)}`;
  const runtime = buildSnapshotRuntime({ deploymentId });
  const restore = buildIntegrityRestoreVerification({ deploymentId });

  const rollbackLineage = runtime.chain.filter((n) => n.type !== "release").map((n) => n.id);

  return {
    version: SNAPSHOT_RESTORE_VERSION,
    restorePlanId,
    restoreGraph: runtime.restoreGraph,
    rollbackLineage,
    restoreReady: restore.restoreReady,
    summary: `snapshot-restore id=${restorePlanId} restore=${restore.restoreReady} lineage=${rollbackLineage.length}`,
  };
}

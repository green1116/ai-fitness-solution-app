/**
 * V3.7 FINAL —integrity snapshot
 */

import { buildFreezeSnapshotMeta } from "../freeze/freeze-snapshot";
import { buildIntegritySeal } from "./integrity-seal";

export const INTEGRITY_SNAPSHOT_VERSION = "3.7-final-integrity-snapshot-1" as const;

export type IntegritySnapshotRecord = {
  version: typeof INTEGRITY_SNAPSHOT_VERSION;
  snapshotId: string;
  freezeSnapshotId: string;
  sealId: string;
  baselineHash: string;
  capturedAt: string;
  summary: string;
};

export function buildIntegritySnapshotRecord(input?: { deploymentId?: string }): IntegritySnapshotRecord {
  const deploymentId = input?.deploymentId ?? "integrity-snapshot";
  const snapshotId = `ISN-V37FINAL-${deploymentId.slice(0, 8)}`;
  const freezeSnap = buildFreezeSnapshotMeta({ deploymentId });
  const seal = buildIntegritySeal({ deploymentId });

  return {
    version: INTEGRITY_SNAPSHOT_VERSION,
    snapshotId,
    freezeSnapshotId: freezeSnap.snapshotId,
    sealId: seal.sealId,
    baselineHash: seal.baselineHash,
    capturedAt: freezeSnap.capturedAt,
    summary: `integrity-snapshot id=${snapshotId} freeze=${freezeSnap.snapshotId} seal=${seal.sealId}`,
  };
}

/**
 * V3.7 FINAL —snapshot archive
 */

import { buildSnapshotRuntime } from "./snapshot-runtime";
import { baselineHashFromLayers } from "../shared";

export const SNAPSHOT_ARCHIVE_VERSION = "3.7-final-snapshot-archive-1" as const;

export type SnapshotArchiveEntry = {
  snapshotId: string;
  type: string;
  hash: string;
  archivedAt: string;
};

export type SnapshotArchive = {
  version: typeof SNAPSHOT_ARCHIVE_VERSION;
  archiveId: string;
  entries: SnapshotArchiveEntry[];
  summary: string;
};

export function buildSnapshotArchive(input?: { deploymentId?: string }): SnapshotArchive {
  const deploymentId = input?.deploymentId ?? "snapshot-archive";
  const archiveId = `SNA-V37FINAL-${deploymentId.slice(0, 8)}`;
  const runtime = buildSnapshotRuntime({ deploymentId });
  const archivedAt = "2026-05-26T00:00:00.000Z";
  const hash = baselineHashFromLayers();

  const entries: SnapshotArchiveEntry[] = runtime.chain.map((node) => ({
    snapshotId: node.id,
    type: node.type,
    hash,
    archivedAt,
  }));

  return {
    version: SNAPSHOT_ARCHIVE_VERSION,
    archiveId,
    entries,
    summary: `snapshot-archive id=${archiveId} entries=${entries.length}`,
  };
}

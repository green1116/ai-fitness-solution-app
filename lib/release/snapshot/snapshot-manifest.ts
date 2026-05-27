/**
 * V3.7 FINAL —snapshot manifest
 */

import { buildSnapshotRuntime } from "./snapshot-runtime";

export const SNAPSHOT_MANIFEST_VERSION = "3.7-final-snapshot-manifest-1" as const;

export type SnapshotManifest = {
  version: typeof SNAPSHOT_MANIFEST_VERSION;
  manifestId: string;
  snapshotCount: number;
  rollbackLineage: string[];
  releaseSnapshotMap: Record<string, string>;
  summary: string;
};

export function buildSnapshotManifest(input?: { deploymentId?: string }): SnapshotManifest {
  const deploymentId = input?.deploymentId ?? "snapshot-manifest";
  const manifestId = `SNM-V37FINAL-${deploymentId.slice(0, 8)}`;
  const runtime = buildSnapshotRuntime({ deploymentId });

  const rollbackLineage = runtime.chain
    .filter((n) => n.type === "rollback" || n.type === "freeze")
    .map((n) => n.id);

  return {
    version: SNAPSHOT_MANIFEST_VERSION,
    manifestId,
    snapshotCount: runtime.chain.length,
    rollbackLineage,
    releaseSnapshotMap: runtime.releaseSnapshotMap,
    summary: `snapshot-manifest id=${manifestId} count=${runtime.chain.length} rollback=${rollbackLineage.length}`,
  };
}

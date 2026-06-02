/**
 * V3.7 FINAL —release baseline archive
 */

import { buildReleaseBaselineRegistry } from "./release-baseline-registry";
import { baselineHashFromLayers } from "../shared";

export const RELEASE_BASELINE_ARCHIVE_VERSION = "3.7-final-baseline-archive-1" as const;

export type BaselineArchiveRecord = {
  id: string;
  label: string;
  version: string;
  archivedAt: string;
  hash: string;
};

export type ReleaseBaselineArchive = {
  version: typeof RELEASE_BASELINE_ARCHIVE_VERSION;
  archiveId: string;
  records: BaselineArchiveRecord[];
  recordCount: number;
  summary: string;
};

export function buildReleaseBaselineArchive(input?: { deploymentId?: string }): ReleaseBaselineArchive {
  const deploymentId = input?.deploymentId ?? "baseline-archive";
  const archiveId = `RBA-V37FINAL-${deploymentId.slice(0, 8)}`;
  const registry = buildReleaseBaselineRegistry({ deploymentId });
  const hash = baselineHashFromLayers();
  const archivedAt = "2026-05-26T00:00:00.000Z";

  const records: BaselineArchiveRecord[] = registry.entries.map((entry) => ({
    id: entry.id,
    label: entry.label,
    version: entry.version,
    archivedAt,
    hash,
  }));

  return {
    version: RELEASE_BASELINE_ARCHIVE_VERSION,
    archiveId,
    records,
    recordCount: records.length,
    summary: `baseline-archive id=${archiveId} records=${records.length} hash=${hash}`,
  };
}

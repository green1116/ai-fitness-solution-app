/**
 * WP-69 — Report Engine
 * Deterministic report items from ArchiveItems (read-only).
 */
import { getArchive, type ArchiveItem, type ArchiveStatus } from "./archive";

export const FEAT_70_ID = "FEAT-70" as const;
export const REPORT_ENGINE_CAPABILITY = "ReportEngine" as const;

export type ReportItem = Readonly<{
  id: string;
  archiveId: string;
  summary: string;
  position: number;
}>;

export type BuildReportInput = Readonly<{
  archives?: readonly ArchiveItem[];
}>;

const STATUS_RANK: Record<ArchiveStatus, number> = {
  ARCHIVED: 0,
  PENDING: 1,
  SKIPPED: 2,
};

let cachedReport: ReportItem[] | null = null;

function cloneItem(row: ReportItem): ReportItem {
  return { ...row };
}

function formatSummary(archive: ArchiveItem): string {
  return `archive=${archive.id}; execution=${archive.executionId}; status=${archive.status}; archivePosition=${archive.position}`;
}

/**
 * Build deterministic report items from ArchiveItems.
 * Sorted ARCHIVED → PENDING → SKIPPED, then stable archiveId.
 */
export function buildReport(input: BuildReportInput = {}): ReportItem[] {
  const archives = input.archives ? [...input.archives] : getArchive();

  const ranked = archives.slice().sort((a, b) => {
    const byStatus = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (byStatus !== 0) return byStatus;
    return a.id.localeCompare(b.id);
  });

  const out: ReportItem[] = ranked.map((archive, index) => ({
    id: `report-${archive.id}`,
    archiveId: archive.id,
    summary: formatSummary(archive),
    position: index + 1,
  }));

  cachedReport = out.map(cloneItem);
  return cachedReport.map(cloneItem);
}

/**
 * Get the last built reports, or build if none cached.
 */
export function getReport(): ReportItem[] {
  if (!cachedReport) {
    return buildReport();
  }
  return cachedReport.map(cloneItem);
}

/** Test helper — clears cached reports. */
export function clearReport(): void {
  cachedReport = null;
}

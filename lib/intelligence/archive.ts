/**
 * WP-68 — Archive Engine
 * Deterministic archive items from ExecutionItems (read-only).
 */
import { getExecution, type ExecutionItem } from "./execution";

export const FEAT_69_ID = "FEAT-69" as const;
export const ARCHIVE_ENGINE_CAPABILITY = "ArchiveEngine" as const;

export const ARCHIVE_STATUSES = ["ARCHIVED", "PENDING", "SKIPPED"] as const;

export type ArchiveStatus = (typeof ARCHIVE_STATUSES)[number];

export type ArchiveItem = Readonly<{
  id: string;
  executionId: string;
  status: ArchiveStatus;
  position: number;
}>;

export type BuildArchiveInput = Readonly<{
  executions?: readonly ExecutionItem[];
}>;

const STATUS_RANK: Record<ArchiveStatus, number> = {
  ARCHIVED: 0,
  PENDING: 1,
  SKIPPED: 2,
};

let cachedArchive: ArchiveItem[] | null = null;

function cloneItem(row: ArchiveItem): ArchiveItem {
  return { ...row };
}

function actionToStatus(
  action: ExecutionItem["action"],
): ArchiveStatus {
  if (action === "RUN") return "ARCHIVED";
  if (action === "DEFER") return "PENDING";
  return "SKIPPED";
}

/**
 * Build deterministic archive items from ExecutionItems.
 * Sorted ARCHIVED → PENDING → SKIPPED, then stable executionId.
 */
export function buildArchive(input: BuildArchiveInput = {}): ArchiveItem[] {
  const executions = input.executions ? [...input.executions] : getExecution();

  const ranked = executions.map((e) => ({
    executionId: e.id,
    status: actionToStatus(e.action),
  }));

  ranked.sort((a, b) => {
    const byStatus = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (byStatus !== 0) return byStatus;
    return a.executionId.localeCompare(b.executionId);
  });

  const out: ArchiveItem[] = ranked.map((row, index) => ({
    id: `archive-${row.executionId}`,
    executionId: row.executionId,
    status: row.status,
    position: index + 1,
  }));

  cachedArchive = out.map(cloneItem);
  return cachedArchive.map(cloneItem);
}

/**
 * Get the last built archives, or build if none cached.
 */
export function getArchive(): ArchiveItem[] {
  if (!cachedArchive) {
    return buildArchive();
  }
  return cachedArchive.map(cloneItem);
}

/** Test helper — clears cached archives. */
export function clearArchive(): void {
  cachedArchive = null;
}

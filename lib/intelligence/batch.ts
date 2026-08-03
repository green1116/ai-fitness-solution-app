/**
 * WP-58 — Batch Engine
 * Deterministic fixed-size batches from QueueItems (read-only).
 */
import { getQueue, type QueueItem } from "./queue";

export const FEAT_59_ID = "FEAT-59" as const;
export const BATCH_ENGINE_CAPABILITY = "BatchEngine" as const;

/** Fixed batch size for deterministic chunking. */
export const BATCH_SIZE = 5 as const;

export type BatchItem = Readonly<{
  id: string;
  queueIds: readonly string[];
  position: number;
}>;

export type BuildBatchInput = Readonly<{
  queue?: readonly QueueItem[];
  batchSize?: number;
}>;

let cachedBatch: BatchItem[] | null = null;

function cloneItem(row: BatchItem): BatchItem {
  return {
    id: row.id,
    queueIds: [...row.queueIds],
    position: row.position,
  };
}

/**
 * Build deterministic batches from QueueItems.
 * Queue is ordered by position; each batch holds up to BATCH_SIZE ids.
 */
export function buildBatch(input: BuildBatchInput = {}): BatchItem[] {
  const queue = input.queue ? [...input.queue] : getQueue();
  const batchSize =
    typeof input.batchSize === "number" &&
    Number.isInteger(input.batchSize) &&
    input.batchSize > 0
      ? input.batchSize
      : BATCH_SIZE;

  const sorted = queue.slice().sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    return a.id.localeCompare(b.id);
  });

  const out: BatchItem[] = [];
  for (let i = 0; i < sorted.length; i += batchSize) {
    const chunk = sorted.slice(i, i + batchSize);
    const batchPosition = out.length + 1;
    out.push({
      id: `batch-${batchPosition}`,
      queueIds: chunk.map((q) => q.id),
      position: batchPosition,
    });
  }

  cachedBatch = out.map(cloneItem);
  return cachedBatch.map(cloneItem);
}

/**
 * Get the last built batches, or build if none cached.
 */
export function getBatch(): BatchItem[] {
  if (!cachedBatch) {
    return buildBatch();
  }
  return cachedBatch.map(cloneItem);
}

/** Test helper — clears cached batches. */
export function clearBatch(): void {
  cachedBatch = null;
}

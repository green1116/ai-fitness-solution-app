/**
 * WP-59 — Dispatch Engine
 * Deterministic dispatch items from Batches (read-only).
 * Priority is the highest Attention level among queue items in the batch.
 */
import { getBatch, type BatchItem } from "./batch";
import { getQueue } from "./queue";
import { getAttention, type AttentionLevel } from "./attention";

export const FEAT_60_ID = "FEAT-60" as const;
export const DISPATCH_ENGINE_CAPABILITY = "DispatchEngine" as const;

export const DISPATCH_PRIORITIES = ["CRITICAL", "HIGH", "NORMAL"] as const;

export type DispatchPriority = (typeof DISPATCH_PRIORITIES)[number];

export type DispatchItem = Readonly<{
  id: string;
  batchId: string;
  priority: DispatchPriority;
  position: number;
}>;

export type BuildDispatchInput = Readonly<{
  batches?: readonly BatchItem[];
}>;

const PRIORITY_RANK: Record<DispatchPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
};

let cachedDispatch: DispatchItem[] | null = null;

function cloneItem(row: DispatchItem): DispatchItem {
  return { ...row };
}

function resolveBatchPriority(batch: BatchItem): DispatchPriority {
  const queue = getQueue();
  const attention = getAttention();
  const queueById = new Map(queue.map((q) => [q.id, q]));
  const attentionById = new Map(attention.map((a) => [a.id, a]));

  let best: DispatchPriority = "NORMAL";
  for (const queueId of batch.queueIds) {
    const q = queueById.get(queueId);
    if (!q) continue;
    const att = attentionById.get(q.attentionId);
    if (!att) continue;
    const level = att.level as AttentionLevel;
    if (PRIORITY_RANK[level] < PRIORITY_RANK[best]) {
      best = level;
    }
  }
  return best;
}

/**
 * Build deterministic dispatch items from Batches.
 * Sorted CRITICAL → HIGH → NORMAL, then stable batch id; position is 1-based.
 */
export function buildDispatch(
  input: BuildDispatchInput = {},
): DispatchItem[] {
  const batches = input.batches ? [...input.batches] : getBatch();

  const ranked = batches.map((batch) => ({
    batchId: batch.id,
    priority: resolveBatchPriority(batch),
  }));

  ranked.sort((a, b) => {
    const byPriority =
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (byPriority !== 0) return byPriority;
    return a.batchId.localeCompare(b.batchId);
  });

  const out: DispatchItem[] = ranked.map((row, index) => ({
    id: `dispatch-${row.batchId}`,
    batchId: row.batchId,
    priority: row.priority,
    position: index + 1,
  }));

  cachedDispatch = out.map(cloneItem);
  return cachedDispatch.map(cloneItem);
}

/**
 * Get the last built dispatch items, or build if none cached.
 */
export function getDispatch(): DispatchItem[] {
  if (!cachedDispatch) {
    return buildDispatch();
  }
  return cachedDispatch.map(cloneItem);
}

/** Test helper — clears cached dispatch items. */
export function clearDispatch(): void {
  cachedDispatch = null;
}

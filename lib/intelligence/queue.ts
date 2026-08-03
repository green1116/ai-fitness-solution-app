/**
 * WP-57 — Queue Engine
 * Deterministic queue positions derived from AttentionItems (read-only).
 */
import {
  getAttention,
  type AttentionItem,
  type AttentionLevel,
} from "./attention";

export const FEAT_58_ID = "FEAT-58" as const;
export const QUEUE_ENGINE_CAPABILITY = "QueueEngine" as const;

export type QueueItem = Readonly<{
  id: string;
  attentionId: string;
  position: number;
}>;

export type BuildQueueInput = Readonly<{
  attention?: readonly AttentionItem[];
}>;

const LEVEL_RANK: Record<AttentionLevel, number> = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
};

let cachedQueue: QueueItem[] | null = null;

function cloneItem(row: QueueItem): QueueItem {
  return { ...row };
}

/**
 * Build deterministic queue items from AttentionItems.
 * Sorted CRITICAL → HIGH → NORMAL, then stable attention id; position is 1-based.
 */
export function buildQueue(input: BuildQueueInput = {}): QueueItem[] {
  const attention = input.attention ? [...input.attention] : getAttention();

  const sorted = attention.slice().sort((a, b) => {
    const byLevel = LEVEL_RANK[a.level] - LEVEL_RANK[b.level];
    if (byLevel !== 0) return byLevel;
    return a.id.localeCompare(b.id);
  });

  const out: QueueItem[] = sorted.map((item, index) => ({
    id: `queue-${item.id}`,
    attentionId: item.id,
    position: index + 1,
  }));

  cachedQueue = out.map(cloneItem);
  return cachedQueue.map(cloneItem);
}

/**
 * Get the last built queue, or build if none cached.
 */
export function getQueue(): QueueItem[] {
  if (!cachedQueue) {
    return buildQueue();
  }
  return cachedQueue.map(cloneItem);
}

/** Test helper — clears cached queue. */
export function clearQueue(): void {
  cachedQueue = null;
}

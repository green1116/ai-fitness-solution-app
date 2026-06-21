/**
 * V58 P6 — Quote History Selector
 */

import type { QuoteHistoryEventCategory, QuoteHistoryRecord } from "./quote-history.types";
import { categorizeQuoteEvent } from "./quote-history.event";
import { sortHistoryRecords } from "./quote-history.record";

export interface QuoteHistorySelectorFilter {
  quoteId?: string;
  workspaceId?: string;
  jobId?: string;
  executionId?: string;
  eventType?: string;
  category?: QuoteHistoryEventCategory;
  fromTimestamp?: string;
  toTimestamp?: string;
}

export function selectHistoryRecords(
  records: QuoteHistoryRecord[],
  filter: QuoteHistorySelectorFilter = {},
): QuoteHistoryRecord[] {
  let result = [...records];

  if (filter.quoteId) {
    result = result.filter((r) => r.quoteId === filter.quoteId);
  }
  if (filter.workspaceId) {
    result = result.filter((r) => r.workspaceId === filter.workspaceId);
  }
  if (filter.jobId) {
    result = result.filter((r) => r.jobId === filter.jobId);
  }
  if (filter.executionId) {
    result = result.filter((r) => r.executionId === filter.executionId);
  }
  if (filter.eventType) {
    result = result.filter((r) => r.eventType === filter.eventType);
  }
  if (filter.category) {
    result = result.filter(
      (r) => categorizeQuoteEvent(r.eventType) === filter.category,
    );
  }
  if (filter.fromTimestamp) {
    result = result.filter((r) => r.timestamp >= filter.fromTimestamp!);
  }
  if (filter.toTimestamp) {
    result = result.filter((r) => r.timestamp <= filter.toTimestamp!);
  }

  return sortHistoryRecords(result);
}

export function selectLifecycleRecords(
  records: QuoteHistoryRecord[],
): QuoteHistoryRecord[] {
  return selectHistoryRecords(records, { category: "lifecycle" });
}

export function selectJobRecords(
  records: QuoteHistoryRecord[],
  jobId?: string,
): QuoteHistoryRecord[] {
  return selectHistoryRecords(records, { category: "job", jobId });
}

export function selectExecutionRecords(
  records: QuoteHistoryRecord[],
  executionId?: string,
): QuoteHistoryRecord[] {
  return selectHistoryRecords(records, { category: "execution", executionId });
}

export function selectRecordsByCausation(
  records: QuoteHistoryRecord[],
  causationId: string,
): QuoteHistoryRecord[] {
  return sortHistoryRecords(
    records.filter((r) => r.causationId === causationId),
  );
}

export function buildCausationChain(
  records: QuoteHistoryRecord[],
  terminalEventId: string,
): string[] {
  const byId = new Map(records.map((r) => [r.eventId, r]));
  const chain: string[] = [];
  let currentId: string | undefined = terminalEventId;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    chain.unshift(currentId);
    const record = byId.get(currentId);
    currentId = record?.causationId;
  }

  return chain;
}

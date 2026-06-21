/**
 * V58 P6 — Quote History Record Factory
 */

import type { QuoteHistoryRecord } from "./quote-history.types";
import type { QuoteDomainEvent } from "./quote-history.event";

export function createQuoteHistoryRecord(
  input: QuoteDomainEvent,
): QuoteHistoryRecord {
  return {
    eventId: input.eventId,
    quoteId: input.quoteId,
    workspaceId: input.workspaceId,
    jobId: input.jobId,
    executionId: input.executionId,
    eventType: input.eventType,
    timestamp: input.timestamp,
    payload: input.payload,
    causationId: input.causationId,
    correlationId: input.correlationId,
  };
}

export function sortHistoryRecords(records: QuoteHistoryRecord[]): QuoteHistoryRecord[] {
  return [...records].sort((a, b) => {
    const timeDiff = a.timestamp.localeCompare(b.timestamp);
    if (timeDiff !== 0) return timeDiff;
    return a.eventId.localeCompare(b.eventId);
  });
}

export function isDuplicateHistoryRecord(
  existing: QuoteHistoryRecord[],
  record: QuoteHistoryRecord,
): boolean {
  return existing.some((r) => r.eventId === record.eventId);
}

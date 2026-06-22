/**
 * V58 P6 — Quote History Timeline Builder
 */

import type {
  QuoteHistoryRecord,
  QuoteHistoryTimeline,
  QuoteHistoryTimelineEntry,
} from "./quote-history.types";
import { categorizeQuoteEvent } from "./quote-history.event";
import { sortHistoryRecords } from "./quote-history.record";

function toTimelineEntry(record: QuoteHistoryRecord): QuoteHistoryTimelineEntry {
  return {
    eventId: record.eventId,
    category: categorizeQuoteEvent(record.eventType),
    eventType: record.eventType,
    timestamp: record.timestamp,
    record,
  };
}

export function buildQuoteTimeline(
  records: QuoteHistoryRecord[],
): QuoteHistoryTimeline | null {
  if (records.length === 0) return null;

  const sorted = sortHistoryRecords(records);
  const quoteId = sorted[0].quoteId;
  const workspaceId = sorted[0].workspaceId;

  const lifecycleEvents: QuoteHistoryTimelineEntry[] = [];
  const jobEvents: QuoteHistoryTimelineEntry[] = [];
  const executionEvents: QuoteHistoryTimelineEntry[] = [];

  for (const record of sorted) {
    const entry = toTimelineEntry(record);
    switch (entry.category) {
      case "lifecycle":
        lifecycleEvents.push(entry);
        break;
      case "job":
        jobEvents.push(entry);
        break;
      case "execution":
        executionEvents.push(entry);
        break;
    }
  }

  return {
    quoteId,
    workspaceId,
    lifecycleEvents,
    jobEvents,
    executionEvents,
    totalEvents: sorted.length,
    firstEventAt: sorted[0].timestamp,
    lastEventAt: sorted[sorted.length - 1].timestamp,
  };
}

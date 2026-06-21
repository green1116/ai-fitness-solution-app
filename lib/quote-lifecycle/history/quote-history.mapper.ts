/**
 * V58 P6 — Quote History Event Mapper
 */

import type { QuoteHistoryRecord } from "./quote-history.types";
import type { QuoteDomainEvent } from "./quote-history.event";
import { createQuoteHistoryRecord } from "./quote-history.record";

export function mapEventToHistoryRecord(
  event: QuoteDomainEvent,
): QuoteHistoryRecord {
  return createQuoteHistoryRecord(event);
}

export function mapEventsToHistoryRecords(
  events: QuoteDomainEvent[],
): QuoteHistoryRecord[] {
  return events.map(mapEventToHistoryRecord);
}

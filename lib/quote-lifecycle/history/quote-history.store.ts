/**
 * V58 P6 — Quote History In-Memory Store
 */

import {
  QUOTE_HISTORY_VERSION,
  type QuoteHistoryRecord,
  type QuoteHistoryStore,
} from "./quote-history.types";
import { isDuplicateHistoryRecord, sortHistoryRecords } from "./quote-history.record";
import { validateHistoryRecord } from "./quote-history.validation";

export function createQuoteHistoryStore(): QuoteHistoryStore {
  return {
    version: QUOTE_HISTORY_VERSION,
    records: new Map<string, QuoteHistoryRecord[]>(),
  };
}

export function appendHistoryRecord(
  store: QuoteHistoryStore,
  record: QuoteHistoryRecord,
): QuoteHistoryRecord[] {
  const validation = validateHistoryRecord(record);
  if (!validation.valid) {
    throw new Error(`Invalid history record: ${validation.errors.join(", ")}`);
  }

  const key = record.quoteId;
  const existing = store.records.get(key) ?? [];

  if (isDuplicateHistoryRecord(existing, record)) {
    return existing;
  }

  const updated = sortHistoryRecords([...existing, record]);
  store.records.set(key, updated);
  return updated;
}

export function getQuoteHistory(
  store: QuoteHistoryStore,
  quoteId: string,
): QuoteHistoryRecord[] {
  return [...(store.records.get(quoteId) ?? [])];
}

export function clearQuoteHistory(
  store: QuoteHistoryStore,
  quoteId: string,
): void {
  store.records.delete(quoteId);
}

export function getQuoteHistoryCount(
  store: QuoteHistoryStore,
  quoteId: string,
): number {
  return store.records.get(quoteId)?.length ?? 0;
}

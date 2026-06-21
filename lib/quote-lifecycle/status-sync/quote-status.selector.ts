import type { QuoteEventEnvelope } from "../events/quote-event.types";
import { createQuoteStatusSnapshot } from "./quote-status.snapshot";
import { projectEventToStatus } from "./quote-status.projector";
import type { QuoteStatusSnapshot, QuoteStatusStore } from "./quote-status.types";

export function createQuoteStatusStore(): QuoteStatusStore {
  return new Map<string, QuoteStatusSnapshot>();
}

export function selectQuoteStatus(
  store: QuoteStatusStore,
  quoteId: string,
): QuoteStatusSnapshot | undefined {
  return store.get(quoteId.trim());
}

export function upsertQuoteStatus(
  store: QuoteStatusStore,
  snapshot: QuoteStatusSnapshot,
): QuoteStatusSnapshot {
  store.set(snapshot.quoteId, snapshot);
  return snapshot;
}

export function ensureQuoteStatus(
  store: QuoteStatusStore,
  quoteId: string,
  workspaceId: string,
): QuoteStatusSnapshot {
  const existing = selectQuoteStatus(store, quoteId);
  if (existing) {
    return existing;
  }

  const snapshot = createQuoteStatusSnapshot({ quoteId, workspaceId });
  upsertQuoteStatus(store, snapshot);
  return snapshot;
}

export function projectEventIntoStore(
  store: QuoteStatusStore,
  event: QuoteEventEnvelope,
): QuoteStatusSnapshot {
  const snapshot = ensureQuoteStatus(store, event.quoteId, event.workspaceId);
  const projection = projectEventToStatus(snapshot, event);

  if (projection.accepted) {
    upsertQuoteStatus(store, projection.snapshot);
    return projection.snapshot;
  }

  return snapshot;
}

export function getQuoteStatus(
  store: QuoteStatusStore,
  quoteId: string,
): QuoteStatusSnapshot | undefined {
  return selectQuoteStatus(store, quoteId);
}

import type { QuoteEventEnvelope } from "../events/quote-event.types";
import { createQuoteStatusSnapshot } from "./quote-status.snapshot";
import { reduceQuoteStatus } from "./quote-status.reducer";
import type { QuoteStatusProjectionResult, QuoteStatusSnapshot } from "./quote-status.types";

export function projectEventToStatus(
  snapshot: QuoteStatusSnapshot,
  event: QuoteEventEnvelope,
): QuoteStatusProjectionResult {
  const previousSnapshot = { ...snapshot };
  const result = reduceQuoteStatus(snapshot, event);

  return {
    accepted: result.accepted,
    snapshot: result.snapshot,
    previousSnapshot,
    reason: result.reason,
  };
}

export function projectEventsToStatus(
  quoteId: string,
  workspaceId: string,
  events: QuoteEventEnvelope[],
): QuoteStatusSnapshot {
  let snapshot = createQuoteStatusSnapshot({ quoteId, workspaceId });

  for (const event of events) {
    const result = reduceQuoteStatus(snapshot, event);
    if (result.accepted) {
      snapshot = result.snapshot;
    }
  }

  return snapshot;
}

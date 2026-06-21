import { QUOTE_EVENT_CONTRACT_VERSION } from "./quote-event.constants";
import { isKnownQuoteEventType } from "./quote-event.mapper";
import type { QuoteEventEnvelope, QuoteNormalizedEvent } from "./quote-event.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateQuoteEventEnvelope(event: QuoteEventEnvelope): boolean {
  if (!event.eventId.trim()) {
    return false;
  }

  if (!isKnownQuoteEventType(event.eventType)) {
    return false;
  }

  if (!event.timestamp.trim()) {
    return false;
  }

  if (!event.quoteId.trim() || !event.workspaceId.trim()) {
    return false;
  }

  if (!isRecord(event.payload)) {
    return false;
  }

  if (event.payload.schemaVersion !== QUOTE_EVENT_CONTRACT_VERSION) {
    return false;
  }

  if (event.payload.source !== "quote-lifecycle") {
    return false;
  }

  return true;
}

export function assertQuoteEventEnvelope(event: QuoteEventEnvelope): void {
  if (!validateQuoteEventEnvelope(event)) {
    throw new Error("invalid quote event envelope");
  }
}

export function normalizeQuoteEvent(event: QuoteEventEnvelope): QuoteNormalizedEvent {
  const payload = isRecord(event.payload) ? event.payload : {};

  return {
    eventId: event.eventId.trim(),
    eventType: event.eventType,
    timestamp: event.timestamp.trim(),
    quoteId: event.quoteId.trim(),
    workspaceId: event.workspaceId.trim(),
    jobId: event.jobId?.trim(),
    executionId: event.executionId?.trim(),
    correlationId: event.correlationId?.trim(),
    causationId: event.causationId?.trim(),
    payload: {
      schemaVersion: QUOTE_EVENT_CONTRACT_VERSION,
      source: "quote-lifecycle",
      ...payload,
    },
  };
}

export function describeQuoteEventEnvelope(event: QuoteEventEnvelope): string {
  return `quoteEvent.${event.eventType}.quoteId=${event.quoteId};eventId=${event.eventId}`;
}

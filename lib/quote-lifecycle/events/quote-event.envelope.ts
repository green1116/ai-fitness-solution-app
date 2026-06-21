import { QUOTE_EVENT_CONTRACT_VERSION } from "./quote-event.constants";
import type { QuoteEventEnvelope } from "./quote-event.types";
import type { QuoteEventType } from "./quote-event.constants";

function nowIso(): string {
  return new Date().toISOString();
}

function createEventId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface CreateQuoteEventEnvelopeInput {
  eventType: QuoteEventType;
  quoteId: string;
  workspaceId: string;
  payload: unknown;
  eventId?: string;
  timestamp?: string;
  jobId?: string;
  executionId?: string;
  correlationId?: string;
  causationId?: string;
}

export function createQuoteEventEnvelope(input: CreateQuoteEventEnvelopeInput): QuoteEventEnvelope {
  return {
    eventId: input.eventId?.trim() || createEventId("evt"),
    eventType: input.eventType,
    timestamp: input.timestamp ?? nowIso(),
    quoteId: input.quoteId.trim(),
    workspaceId: input.workspaceId.trim(),
    jobId: input.jobId?.trim(),
    executionId: input.executionId?.trim(),
    correlationId: input.correlationId?.trim(),
    causationId: input.causationId?.trim(),
    payload: input.payload,
  };
}

export function withQuoteEventPayloadBase(payload: Record<string, unknown>): Record<string, unknown> {
  return {
    schemaVersion: QUOTE_EVENT_CONTRACT_VERSION,
    source: "quote-lifecycle",
    ...payload,
  };
}

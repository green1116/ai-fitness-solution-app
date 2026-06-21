import type { QuoteEventType } from "./quote-event.constants";

export interface QuoteEventEnvelope {
  eventId: string;
  eventType: QuoteEventType;
  timestamp: string;
  quoteId: string;
  workspaceId: string;
  jobId?: string;
  executionId?: string;
  correlationId?: string;
  causationId?: string;
  payload: unknown;
}

export interface QuoteEventPayloadBase {
  schemaVersion: string;
  source: "quote-lifecycle";
}

export interface QuoteNormalizedEvent extends QuoteEventEnvelope {
  payload: QuoteEventPayloadBase & Record<string, unknown>;
}

export type { QuoteEventType } from "./quote-event.constants";

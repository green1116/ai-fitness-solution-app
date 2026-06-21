import type { QuoteLifecycleStatus } from "../lifecycle/quote-lifecycle.types";
import type { QuoteEventEnvelope } from "./quote-event.types";
import { QUOTE_EVENT_TYPE_LIFECYCLE_CHANGED } from "./quote-event.constants";

export interface QuoteLifecycleEventPayload {
  schemaVersion: string;
  source: "quote-lifecycle";
  previousStatus?: QuoteLifecycleStatus;
  nextStatus: QuoteLifecycleStatus;
  retryCount?: number;
  lastError?: string;
}

export interface QuoteLifecycleEvent extends QuoteEventEnvelope {
  eventType: typeof QUOTE_EVENT_TYPE_LIFECYCLE_CHANGED;
  payload: QuoteLifecycleEventPayload;
}

import type { QuoteJobStatus } from "../job/quote-job.types";
import type { QuoteEventEnvelope } from "./quote-event.types";
import {
  QUOTE_EVENT_TYPE_JOB_COMPLETED,
  QUOTE_EVENT_TYPE_JOB_DISPATCHED,
  QUOTE_EVENT_TYPE_JOB_FAILED,
  QUOTE_EVENT_TYPE_JOB_REGISTERED,
  QUOTE_EVENT_TYPE_JOB_STARTED,
  type QuoteEventType,
} from "./quote-event.constants";

export type QuoteJobEventType =
  | typeof QUOTE_EVENT_TYPE_JOB_REGISTERED
  | typeof QUOTE_EVENT_TYPE_JOB_DISPATCHED
  | typeof QUOTE_EVENT_TYPE_JOB_STARTED
  | typeof QUOTE_EVENT_TYPE_JOB_COMPLETED
  | typeof QUOTE_EVENT_TYPE_JOB_FAILED;

export interface QuoteJobEventPayload {
  schemaVersion: string;
  source: "quote-lifecycle";
  jobStatus: QuoteJobStatus;
  retryCount?: number;
  lastError?: string;
}

export interface QuoteJobEvent extends QuoteEventEnvelope {
  eventType: QuoteJobEventType;
  jobId: string;
  payload: QuoteJobEventPayload;
}

export function isQuoteJobEventType(eventType: QuoteEventType): eventType is QuoteJobEventType {
  return (
    eventType === QUOTE_EVENT_TYPE_JOB_REGISTERED ||
    eventType === QUOTE_EVENT_TYPE_JOB_DISPATCHED ||
    eventType === QUOTE_EVENT_TYPE_JOB_STARTED ||
    eventType === QUOTE_EVENT_TYPE_JOB_COMPLETED ||
    eventType === QUOTE_EVENT_TYPE_JOB_FAILED
  );
}

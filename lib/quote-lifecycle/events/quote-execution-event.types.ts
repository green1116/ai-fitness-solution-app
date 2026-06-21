import type { QuoteExecutionStatus } from "../execution/quote-execution.types";
import type { QuoteEventEnvelope } from "./quote-event.types";
import {
  QUOTE_EVENT_TYPE_EXECUTION_ACCEPTED,
  QUOTE_EVENT_TYPE_EXECUTION_DONE,
  QUOTE_EVENT_TYPE_EXECUTION_ERROR,
  QUOTE_EVENT_TYPE_EXECUTION_RUNNING,
  type QuoteEventType,
} from "./quote-event.constants";

export type QuoteExecutionEventType =
  | typeof QUOTE_EVENT_TYPE_EXECUTION_ACCEPTED
  | typeof QUOTE_EVENT_TYPE_EXECUTION_RUNNING
  | typeof QUOTE_EVENT_TYPE_EXECUTION_DONE
  | typeof QUOTE_EVENT_TYPE_EXECUTION_ERROR;

export interface QuoteExecutionEventPayload {
  schemaVersion: string;
  source: "quote-lifecycle";
  executionStatus: QuoteExecutionStatus;
  lastError?: string;
}

export interface QuoteExecutionEvent extends QuoteEventEnvelope {
  eventType: QuoteExecutionEventType;
  executionId: string;
  payload: QuoteExecutionEventPayload;
}

export function isQuoteExecutionEventType(
  eventType: QuoteEventType,
): eventType is QuoteExecutionEventType {
  return (
    eventType === QUOTE_EVENT_TYPE_EXECUTION_ACCEPTED ||
    eventType === QUOTE_EVENT_TYPE_EXECUTION_RUNNING ||
    eventType === QUOTE_EVENT_TYPE_EXECUTION_DONE ||
    eventType === QUOTE_EVENT_TYPE_EXECUTION_ERROR
  );
}

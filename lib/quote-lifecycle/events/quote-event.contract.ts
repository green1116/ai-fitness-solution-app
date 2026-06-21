import type { QuoteLifecycleStatus } from "../lifecycle/quote-lifecycle.types";
import type { QuoteJobStatus } from "../job/quote-job.types";
import type { QuoteExecutionStatus } from "../execution/quote-execution.types";
import {
  QUOTE_EVENT_CONTRACT_VERSION,
  QUOTE_EVENT_TYPE_EXECUTION_ACCEPTED,
  QUOTE_EVENT_TYPE_JOB_DISPATCHED,
  QUOTE_EVENT_TYPE_JOB_REGISTERED,
  QUOTE_EVENT_TYPE_LIFECYCLE_CHANGED,
  QUOTE_EVENT_TYPES,
} from "./quote-event.constants";
import { createQuoteEventEnvelope, withQuoteEventPayloadBase } from "./quote-event.envelope";
import type { QuoteEventEnvelope } from "./quote-event.types";
import type { QuoteLifecycleEvent } from "./quote-lifecycle-event.types";
import type { QuoteJobEvent } from "./quote-job-event.types";
import type { QuoteExecutionEvent } from "./quote-execution-event.types";

export interface QuoteEventContract {
  version: typeof QUOTE_EVENT_CONTRACT_VERSION;
  eventTypes: typeof QUOTE_EVENT_TYPES;
  requiredEnvelopeFields: Array<keyof QuoteEventEnvelope>;
  traceableFields: Array<keyof QuoteEventEnvelope>;
  payloadRules: {
    schemaVersion: typeof QUOTE_EVENT_CONTRACT_VERSION;
    source: "quote-lifecycle";
  };
}

export function buildQuoteEventContract(): QuoteEventContract {
  return {
    version: QUOTE_EVENT_CONTRACT_VERSION,
    eventTypes: QUOTE_EVENT_TYPES,
    requiredEnvelopeFields: ["eventId", "eventType", "timestamp", "quoteId", "workspaceId", "payload"],
    traceableFields: [
      "eventId",
      "correlationId",
      "causationId",
      "quoteId",
      "workspaceId",
      "jobId",
      "executionId",
    ],
    payloadRules: {
      schemaVersion: QUOTE_EVENT_CONTRACT_VERSION,
      source: "quote-lifecycle",
    },
  };
}

export interface CreateLifecycleChangedEventInput {
  quoteId: string;
  workspaceId: string;
  nextStatus: QuoteLifecycleStatus;
  previousStatus?: QuoteLifecycleStatus;
  jobId?: string;
  executionId?: string;
  correlationId?: string;
  causationId?: string;
  retryCount?: number;
  lastError?: string;
}

export function createLifecycleChangedEvent(
  input: CreateLifecycleChangedEventInput,
): QuoteLifecycleEvent {
  return createQuoteEventEnvelope({
    eventType: QUOTE_EVENT_TYPE_LIFECYCLE_CHANGED,
    quoteId: input.quoteId,
    workspaceId: input.workspaceId,
    jobId: input.jobId,
    executionId: input.executionId,
    correlationId: input.correlationId,
    causationId: input.causationId,
    payload: withQuoteEventPayloadBase({
      previousStatus: input.previousStatus,
      nextStatus: input.nextStatus,
      retryCount: input.retryCount,
      lastError: input.lastError,
    }),
  }) as QuoteLifecycleEvent;
}

export interface CreateJobEventInput {
  quoteId: string;
  workspaceId: string;
  jobId: string;
  jobStatus: QuoteJobStatus;
  correlationId?: string;
  causationId?: string;
  retryCount?: number;
  lastError?: string;
}

export function createJobRegisteredEvent(input: CreateJobEventInput): QuoteJobEvent {
  return createQuoteEventEnvelope({
    eventType: QUOTE_EVENT_TYPE_JOB_REGISTERED,
    quoteId: input.quoteId,
    workspaceId: input.workspaceId,
    jobId: input.jobId,
    correlationId: input.correlationId,
    causationId: input.causationId,
    payload: withQuoteEventPayloadBase({
      jobStatus: input.jobStatus,
      retryCount: input.retryCount,
      lastError: input.lastError,
    }),
  }) as QuoteJobEvent;
}

export function createJobDispatchedEvent(input: CreateJobEventInput): QuoteJobEvent {
  return createQuoteEventEnvelope({
    eventType: QUOTE_EVENT_TYPE_JOB_DISPATCHED,
    quoteId: input.quoteId,
    workspaceId: input.workspaceId,
    jobId: input.jobId,
    correlationId: input.correlationId,
    causationId: input.causationId,
    payload: withQuoteEventPayloadBase({
      jobStatus: input.jobStatus,
      retryCount: input.retryCount,
      lastError: input.lastError,
    }),
  }) as QuoteJobEvent;
}

export interface CreateExecutionEventInput {
  quoteId: string;
  workspaceId: string;
  executionId: string;
  executionStatus: QuoteExecutionStatus;
  jobId?: string;
  correlationId?: string;
  causationId?: string;
  lastError?: string;
}

export function createExecutionAcceptedEvent(
  input: CreateExecutionEventInput,
): QuoteExecutionEvent {
  return createQuoteEventEnvelope({
    eventType: QUOTE_EVENT_TYPE_EXECUTION_ACCEPTED,
    quoteId: input.quoteId,
    workspaceId: input.workspaceId,
    jobId: input.jobId,
    executionId: input.executionId,
    correlationId: input.correlationId,
    causationId: input.causationId,
    payload: withQuoteEventPayloadBase({
      executionStatus: input.executionStatus,
      lastError: input.lastError,
    }),
  }) as QuoteExecutionEvent;
}

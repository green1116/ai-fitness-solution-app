import type { QuoteEventEnvelope } from "../events/quote-event.types";
import type { QuoteLifecycleStatus } from "../lifecycle/quote-lifecycle.types";
import {
  QUOTE_EVENT_TYPE_EXECUTION_ACCEPTED,
  QUOTE_EVENT_TYPE_EXECUTION_DONE,
  QUOTE_EVENT_TYPE_EXECUTION_ERROR,
  QUOTE_EVENT_TYPE_EXECUTION_RUNNING,
  QUOTE_EVENT_TYPE_JOB_COMPLETED,
  QUOTE_EVENT_TYPE_JOB_DISPATCHED,
  QUOTE_EVENT_TYPE_JOB_FAILED,
  QUOTE_EVENT_TYPE_JOB_REGISTERED,
  QUOTE_EVENT_TYPE_JOB_STARTED,
  QUOTE_EVENT_TYPE_LIFECYCLE_CHANGED,
  type QuoteEventType,
} from "../events/quote-event.constants";
import type {
  QuoteStatusExecutionStatus,
  QuoteStatusJobStatus,
  QuoteStatusLifecycleStatus,
} from "./quote-status.types";

const LIFECYCLE_PAYLOAD_TO_SNAPSHOT: Partial<Record<QuoteLifecycleStatus, QuoteStatusLifecycleStatus>> =
  {
    IDLE: "IDLE",
    QUEUED: "QUEUED",
    SCHEDULED: "QUEUED",
    RUNNING: "RUNNING",
    PROCESSING: "PROCESSING",
    SUCCEEDED: "SUCCEEDED",
    FAILED: "FAILED",
    CANCELED: "FAILED",
    RETRYING: "RETRYING",
  };

const EVENT_TYPE_TO_LIFECYCLE: Partial<Record<QuoteEventType, QuoteStatusLifecycleStatus>> = {
  [QUOTE_EVENT_TYPE_JOB_REGISTERED]: "QUEUED",
  [QUOTE_EVENT_TYPE_JOB_STARTED]: "RUNNING",
  [QUOTE_EVENT_TYPE_JOB_COMPLETED]: "SUCCEEDED",
  [QUOTE_EVENT_TYPE_JOB_FAILED]: "FAILED",
  [QUOTE_EVENT_TYPE_EXECUTION_RUNNING]: "PROCESSING",
  [QUOTE_EVENT_TYPE_EXECUTION_DONE]: "SUCCEEDED",
  [QUOTE_EVENT_TYPE_EXECUTION_ERROR]: "FAILED",
};

const EVENT_TYPE_TO_JOB: Partial<Record<QuoteEventType, QuoteStatusJobStatus>> = {
  [QUOTE_EVENT_TYPE_JOB_REGISTERED]: "PENDING",
  [QUOTE_EVENT_TYPE_JOB_DISPATCHED]: "DISPATCHED",
  [QUOTE_EVENT_TYPE_JOB_STARTED]: "DISPATCHED",
  [QUOTE_EVENT_TYPE_JOB_COMPLETED]: "COMPLETED",
  [QUOTE_EVENT_TYPE_JOB_FAILED]: "FAILED",
};

const EVENT_TYPE_TO_EXECUTION: Partial<Record<QuoteEventType, QuoteStatusExecutionStatus>> = {
  [QUOTE_EVENT_TYPE_EXECUTION_ACCEPTED]: "NOT_STARTED",
  [QUOTE_EVENT_TYPE_EXECUTION_RUNNING]: "RUNNING",
  [QUOTE_EVENT_TYPE_EXECUTION_DONE]: "DONE",
  [QUOTE_EVENT_TYPE_EXECUTION_ERROR]: "ERROR",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mapEventToLifecycleState(
  event: QuoteEventEnvelope,
): QuoteStatusLifecycleStatus | undefined {
  if (event.eventType === QUOTE_EVENT_TYPE_LIFECYCLE_CHANGED && isRecord(event.payload)) {
    const nextStatus = event.payload.nextStatus;
    if (typeof nextStatus === "string") {
      return LIFECYCLE_PAYLOAD_TO_SNAPSHOT[nextStatus as QuoteLifecycleStatus];
    }
  }

  return EVENT_TYPE_TO_LIFECYCLE[event.eventType];
}

export function mapEventToJobStatus(event: QuoteEventEnvelope): QuoteStatusJobStatus | undefined {
  if (isRecord(event.payload) && typeof event.payload.jobStatus === "string") {
    const jobStatus = event.payload.jobStatus;
    if (jobStatus === "PENDING" || jobStatus === "DISPATCHED" || jobStatus === "COMPLETED") {
      return jobStatus;
    }
    if (jobStatus === "ERRORED" || jobStatus === "ABORTED") {
      return "FAILED";
    }
  }

  return EVENT_TYPE_TO_JOB[event.eventType];
}

export function mapEventToExecutionStatus(
  event: QuoteEventEnvelope,
): QuoteStatusExecutionStatus | undefined {
  if (isRecord(event.payload) && typeof event.payload.executionStatus === "string") {
    const executionStatus = event.payload.executionStatus;
    if (executionStatus === "NOT_STARTED" || executionStatus === "STARTED") {
      return "NOT_STARTED";
    }
    if (executionStatus === "IN_PROGRESS") {
      return "RUNNING";
    }
    if (executionStatus === "DONE") {
      return "DONE";
    }
    if (executionStatus === "ERROR") {
      return "ERROR";
    }
  }

  return EVENT_TYPE_TO_EXECUTION[event.eventType];
}

export function mapEventToStatusFields(event: QuoteEventEnvelope): {
  lifecycleStatus?: QuoteStatusLifecycleStatus;
  jobStatus?: QuoteStatusJobStatus;
  executionStatus?: QuoteStatusExecutionStatus;
} {
  return {
    lifecycleStatus: mapEventToLifecycleState(event),
    jobStatus: mapEventToJobStatus(event),
    executionStatus: mapEventToExecutionStatus(event),
  };
}

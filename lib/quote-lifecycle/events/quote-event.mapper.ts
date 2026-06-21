import type { QuoteLifecycleStatus } from "../lifecycle/quote-lifecycle.types";
import type { QuoteJobStatus } from "../job/quote-job.types";
import type { QuoteExecutionStatus } from "../execution/quote-execution.types";
import type { QuoteJobState } from "../job/quote-job.types";
import type { QuoteExecutionState } from "../execution/quote-execution.types";
import type { QuoteJobResultStatus } from "../job-engine/quote-job-engine.types";
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
  QUOTE_EVENT_TYPES,
  type QuoteEventType,
} from "./quote-event.constants";

const JOB_STATUS_TO_EVENT_TYPE: Partial<Record<QuoteJobStatus, QuoteEventType>> = {
  PENDING: QUOTE_EVENT_TYPE_JOB_REGISTERED,
  DISPATCHED: QUOTE_EVENT_TYPE_JOB_DISPATCHED,
  ACTIVE: QUOTE_EVENT_TYPE_JOB_STARTED,
  COMPLETED: QUOTE_EVENT_TYPE_JOB_COMPLETED,
  ERRORED: QUOTE_EVENT_TYPE_JOB_FAILED,
};

const JOB_RESULT_STATUS_TO_EVENT_TYPE: Partial<Record<QuoteJobResultStatus, QuoteEventType>> = {
  QUEUED: QUOTE_EVENT_TYPE_JOB_REGISTERED,
  DISPATCHED: QUOTE_EVENT_TYPE_JOB_DISPATCHED,
  COMPLETED: QUOTE_EVENT_TYPE_JOB_COMPLETED,
  FAILED: QUOTE_EVENT_TYPE_JOB_FAILED,
};

const EXECUTION_STATUS_TO_EVENT_TYPE: Partial<Record<QuoteExecutionStatus, QuoteEventType>> = {
  NOT_STARTED: QUOTE_EVENT_TYPE_EXECUTION_ACCEPTED,
  STARTED: QUOTE_EVENT_TYPE_EXECUTION_RUNNING,
  IN_PROGRESS: QUOTE_EVENT_TYPE_EXECUTION_RUNNING,
  DONE: QUOTE_EVENT_TYPE_EXECUTION_DONE,
  ERROR: QUOTE_EVENT_TYPE_EXECUTION_ERROR,
};

export function mapJobStateToEventType(
  status: QuoteJobStatus | QuoteJobResultStatus,
): QuoteEventType | undefined {
  if (status in JOB_STATUS_TO_EVENT_TYPE) {
    return JOB_STATUS_TO_EVENT_TYPE[status as QuoteJobStatus];
  }
  return JOB_RESULT_STATUS_TO_EVENT_TYPE[status as QuoteJobResultStatus];
}

export function mapExecutionStateToEventType(
  status: QuoteExecutionStatus,
): QuoteEventType | undefined {
  return EXECUTION_STATUS_TO_EVENT_TYPE[status];
}

export function mapLifecycleStatusToEventType(
  _status: QuoteLifecycleStatus,
): typeof QUOTE_EVENT_TYPE_LIFECYCLE_CHANGED {
  return QUOTE_EVENT_TYPE_LIFECYCLE_CHANGED;
}

export function mapJobStateToEventTypeFromState(state: QuoteJobState): QuoteEventType | undefined {
  return mapJobStateToEventType(state.status);
}

export function mapExecutionStateToEventTypeFromState(
  state: QuoteExecutionState,
): QuoteEventType | undefined {
  return mapExecutionStateToEventType(state.status);
}

export function isKnownQuoteEventType(eventType: string): eventType is QuoteEventType {
  return (QUOTE_EVENT_TYPES as readonly string[]).includes(eventType);
}

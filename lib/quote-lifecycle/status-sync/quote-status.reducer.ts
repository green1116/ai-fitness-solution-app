import type { QuoteEventEnvelope } from "../events/quote-event.types";
import { cloneQuoteStatusSnapshot } from "./quote-status.snapshot";
import { mapEventToStatusFields } from "./quote-status.mapper";
import type {
  QuoteStatusLifecycleStatus,
  QuoteStatusReduceResult,
  QuoteStatusSnapshot,
} from "./quote-status.types";

const PROJECTION_LIFECYCLE_TRANSITIONS: Record<
  QuoteStatusLifecycleStatus,
  QuoteStatusLifecycleStatus[]
> = {
  IDLE: ["QUEUED"],
  QUEUED: ["RUNNING"],
  RUNNING: ["PROCESSING"],
  PROCESSING: ["SUCCEEDED", "FAILED", "RETRYING"],
  SUCCEEDED: [],
  FAILED: ["RETRYING"],
  RETRYING: ["QUEUED", "RUNNING"],
};

function canApplyLifecycleTransition(
  current: QuoteStatusLifecycleStatus,
  next: QuoteStatusLifecycleStatus,
): boolean {
  if (current === next) {
    return true;
  }

  return PROJECTION_LIFECYCLE_TRANSITIONS[current].includes(next);
}

export function reduceQuoteStatus(
  snapshot: QuoteStatusSnapshot,
  event: QuoteEventEnvelope,
): QuoteStatusReduceResult {
  const previous = cloneQuoteStatusSnapshot(snapshot);
  const mapped = mapEventToStatusFields(event);
  const next: QuoteStatusSnapshot = {
    ...previous,
    lastEventType: event.eventType,
    lastEventId: event.eventId,
    updatedAt: event.timestamp,
  };

  if (mapped.lifecycleStatus !== undefined) {
    if (!canApplyLifecycleTransition(previous.lifecycleStatus, mapped.lifecycleStatus)) {
      return {
        accepted: false,
        snapshot: previous,
        reason: `illegal lifecycle projection: ${previous.lifecycleStatus} -> ${mapped.lifecycleStatus}`,
      };
    }
    next.lifecycleStatus = mapped.lifecycleStatus;
  }

  if (mapped.jobStatus !== undefined) {
    next.jobStatus = mapped.jobStatus;
  }

  if (mapped.executionStatus !== undefined) {
    next.executionStatus = mapped.executionStatus;
  }

  return {
    accepted: true,
    snapshot: next,
  };
}

export function updateStatusFromEvent(
  snapshot: QuoteStatusSnapshot,
  event: QuoteEventEnvelope,
): QuoteStatusReduceResult {
  return reduceQuoteStatus(snapshot, event);
}

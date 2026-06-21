import type { QuoteLifecycleStatus } from "./quote-lifecycle.types";

const QUOTE_LIFECYCLE_TRANSITIONS: Record<QuoteLifecycleStatus, QuoteLifecycleStatus[]> = {
  IDLE: ["QUEUED"],
  QUEUED: ["SCHEDULED"],
  SCHEDULED: ["RUNNING"],
  RUNNING: ["PROCESSING"],
  PROCESSING: ["SUCCEEDED", "FAILED", "RETRYING"],
  SUCCEEDED: [],
  FAILED: ["RETRYING", "CANCELED"],
  CANCELED: [],
  RETRYING: ["QUEUED", "RUNNING"],
};

export function getAllowedQuoteLifecycleTransitions(
  status: QuoteLifecycleStatus,
): QuoteLifecycleStatus[] {
  return [...QUOTE_LIFECYCLE_TRANSITIONS[status]];
}

export function canTransitionQuoteLifecycleStatus(
  from: QuoteLifecycleStatus,
  to: QuoteLifecycleStatus,
): boolean {
  return QUOTE_LIFECYCLE_TRANSITIONS[from].includes(to);
}

export function assertQuoteLifecycleTransitionAllowed(
  from: QuoteLifecycleStatus,
  to: QuoteLifecycleStatus,
): void {
  if (!canTransitionQuoteLifecycleStatus(from, to)) {
    throw new Error(`illegal quote lifecycle transition: ${from} -> ${to}`);
  }
}

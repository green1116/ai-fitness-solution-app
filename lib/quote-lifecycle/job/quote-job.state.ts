import { QUOTE_JOB_STATUS_PENDING } from "../shared/quote-lifecycle-constants";
import type { QuoteJobState, QuoteJobStatus } from "./quote-job.types";

const QUOTE_JOB_TRANSITIONS: Record<QuoteJobStatus, QuoteJobStatus[]> = {
  PENDING: ["DISPATCHED", "ABORTED"],
  DISPATCHED: ["ACTIVE", "ABORTED"],
  ACTIVE: ["COMPLETED", "ERRORED", "ABORTED"],
  COMPLETED: [],
  ERRORED: ["PENDING", "ABORTED"],
  ABORTED: [],
};

function nowIso(): string {
  return new Date().toISOString();
}

export function createQuoteJobState(input: {
  jobId: string;
  quoteId: string;
  status?: QuoteJobStatus;
  retryCount?: number;
  lastError?: string;
  updatedAt?: string;
}): QuoteJobState {
  return {
    jobId: input.jobId.trim(),
    quoteId: input.quoteId.trim(),
    status: input.status ?? QUOTE_JOB_STATUS_PENDING,
    retryCount: input.retryCount ?? 0,
    lastError: input.lastError?.trim(),
    updatedAt: input.updatedAt ?? nowIso(),
  };
}

export function canTransitionQuoteJobStatus(from: QuoteJobStatus, to: QuoteJobStatus): boolean {
  return QUOTE_JOB_TRANSITIONS[from].includes(to);
}

export function transitionQuoteJobStatus(
  state: QuoteJobState,
  nextStatus: QuoteJobStatus,
  options?: { lastError?: string; incrementRetry?: boolean },
): import("./quote-job.types").QuoteJobTransitionResult {
  const previousStatus = state.status;

  if (!canTransitionQuoteJobStatus(previousStatus, nextStatus)) {
    return {
      accepted: false,
      previousStatus,
      nextStatus,
      state,
      reason: `illegal quote job transition: ${previousStatus} -> ${nextStatus}`,
    };
  }

  return {
    accepted: true,
    previousStatus,
    nextStatus,
    state: {
      ...state,
      status: nextStatus,
      retryCount:
        options?.incrementRetry === true ? (state.retryCount ?? 0) + 1 : state.retryCount,
      lastError: options?.lastError?.trim(),
      updatedAt: nowIso(),
    },
  };
}

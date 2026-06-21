import { QUOTE_EXECUTION_STATUS_NOT_STARTED } from "../shared/quote-lifecycle-constants";
import type { QuoteExecutionState, QuoteExecutionStatus } from "./quote-execution.types";

const QUOTE_EXECUTION_TRANSITIONS: Record<QuoteExecutionStatus, QuoteExecutionStatus[]> = {
  NOT_STARTED: ["STARTED", "UNKNOWN"],
  STARTED: ["IN_PROGRESS", "ERROR", "UNKNOWN"],
  IN_PROGRESS: ["DONE", "ERROR", "UNKNOWN"],
  DONE: [],
  ERROR: ["NOT_STARTED", "UNKNOWN"],
  UNKNOWN: [],
};

function nowIso(): string {
  return new Date().toISOString();
}

export function createQuoteExecutionState(input: {
  executionId: string;
  quoteId: string;
  status?: QuoteExecutionStatus;
  jobId?: string;
  lastError?: string;
  updatedAt?: string;
}): QuoteExecutionState {
  return {
    executionId: input.executionId.trim(),
    quoteId: input.quoteId.trim(),
    status: input.status ?? QUOTE_EXECUTION_STATUS_NOT_STARTED,
    jobId: input.jobId?.trim(),
    lastError: input.lastError?.trim(),
    updatedAt: input.updatedAt ?? nowIso(),
  };
}

export function canTransitionQuoteExecutionStatus(
  from: QuoteExecutionStatus,
  to: QuoteExecutionStatus,
): boolean {
  return QUOTE_EXECUTION_TRANSITIONS[from].includes(to);
}

export function transitionQuoteExecutionStatus(
  state: QuoteExecutionState,
  nextStatus: QuoteExecutionStatus,
  options?: { lastError?: string },
): import("./quote-execution.types").QuoteExecutionTransitionResult {
  const previousStatus = state.status;

  if (!canTransitionQuoteExecutionStatus(previousStatus, nextStatus)) {
    return {
      accepted: false,
      previousStatus,
      nextStatus,
      state,
      reason: `illegal quote execution transition: ${previousStatus} -> ${nextStatus}`,
    };
  }

  return {
    accepted: true,
    previousStatus,
    nextStatus,
    state: {
      ...state,
      status: nextStatus,
      lastError: options?.lastError?.trim(),
      updatedAt: nowIso(),
    },
  };
}

export function validateQuoteExecutionState(state: QuoteExecutionState): boolean {
  return state.executionId.trim().length > 0 && state.quoteId.trim().length > 0;
}

export function assertQuoteExecutionState(state: QuoteExecutionState): void {
  if (!validateQuoteExecutionState(state)) {
    throw new Error("quote execution state requires executionId and quoteId");
  }
}

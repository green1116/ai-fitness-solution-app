import { QUOTE_LIFECYCLE_STATUS_IDLE } from "../shared/quote-lifecycle-constants";
import type { QuoteLifecycleState } from "./quote-lifecycle.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function createQuoteLifecycleState(input: {
  quoteId: string;
  status?: QuoteLifecycleState["status"];
  jobStatus?: QuoteLifecycleState["jobStatus"];
  executionStatus?: QuoteLifecycleState["executionStatus"];
  executionId?: string;
  jobId?: string;
  retryCount?: number;
  lastError?: string;
  updatedAt?: string;
}): QuoteLifecycleState {
  return {
    quoteId: input.quoteId.trim(),
    status: input.status ?? QUOTE_LIFECYCLE_STATUS_IDLE,
    jobStatus: input.jobStatus,
    executionStatus: input.executionStatus,
    executionId: input.executionId?.trim(),
    jobId: input.jobId?.trim(),
    retryCount: input.retryCount ?? 0,
    lastError: input.lastError?.trim(),
    updatedAt: input.updatedAt ?? nowIso(),
  };
}

export function cloneQuoteLifecycleState(
  state: QuoteLifecycleState,
  patch?: Partial<Omit<QuoteLifecycleState, "quoteId">>,
): QuoteLifecycleState {
  return {
    ...state,
    ...patch,
    quoteId: state.quoteId,
    updatedAt: patch?.updatedAt ?? nowIso(),
  };
}

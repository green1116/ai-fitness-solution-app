import {
  QUOTE_STATUS_EXECUTION_NOT_STARTED,
  QUOTE_STATUS_JOB_PENDING,
  QUOTE_STATUS_LIFECYCLE_IDLE,
} from "../shared/quote-lifecycle-constants";
import type { QuoteStatusSnapshot } from "./quote-status.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function createQuoteStatusSnapshot(input: {
  quoteId: string;
  workspaceId: string;
  lifecycleStatus?: QuoteStatusSnapshot["lifecycleStatus"];
  jobStatus?: QuoteStatusSnapshot["jobStatus"];
  executionStatus?: QuoteStatusSnapshot["executionStatus"];
  lastEventType?: string;
  lastEventId?: string;
  updatedAt?: string;
}): QuoteStatusSnapshot {
  return {
    quoteId: input.quoteId.trim(),
    workspaceId: input.workspaceId.trim(),
    lifecycleStatus: input.lifecycleStatus ?? QUOTE_STATUS_LIFECYCLE_IDLE,
    jobStatus: input.jobStatus ?? QUOTE_STATUS_JOB_PENDING,
    executionStatus: input.executionStatus ?? QUOTE_STATUS_EXECUTION_NOT_STARTED,
    lastEventType: input.lastEventType ?? "INITIALIZED",
    lastEventId: input.lastEventId?.trim(),
    updatedAt: input.updatedAt ?? nowIso(),
  };
}

export function cloneQuoteStatusSnapshot(snapshot: QuoteStatusSnapshot): QuoteStatusSnapshot {
  return { ...snapshot };
}

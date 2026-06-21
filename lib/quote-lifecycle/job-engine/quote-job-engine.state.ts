import {
  QUOTE_JOB_RESULT_STATUS_COMPLETED,
  QUOTE_JOB_RESULT_STATUS_DISPATCHED,
  QUOTE_JOB_RESULT_STATUS_FAILED,
  QUOTE_JOB_RESULT_STATUS_QUEUED,
} from "../shared/quote-lifecycle-constants";
import { createQuoteJobState } from "../job/quote-job.state";
import type { QuoteJobCommand } from "./quote-job-command.types";
import type { QuoteJobEngineEntry, QuoteJobResultStatus } from "./quote-job-engine.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function createQuoteJobEngineEntry(command: QuoteJobCommand): QuoteJobEngineEntry {
  return {
    command,
    jobState: createQuoteJobState({
      jobId: command.jobId,
      quoteId: command.quoteId,
    }),
    resultStatus: QUOTE_JOB_RESULT_STATUS_QUEUED,
    updatedAt: nowIso(),
  };
}

export const QUOTE_JOB_ENGINE_RESULT_TRANSITIONS: Record<
  QuoteJobResultStatus,
  QuoteJobResultStatus[]
> = {
  [QUOTE_JOB_RESULT_STATUS_QUEUED]: [QUOTE_JOB_RESULT_STATUS_DISPATCHED],
  [QUOTE_JOB_RESULT_STATUS_DISPATCHED]: [
    QUOTE_JOB_RESULT_STATUS_COMPLETED,
    QUOTE_JOB_RESULT_STATUS_FAILED,
  ],
  [QUOTE_JOB_RESULT_STATUS_COMPLETED]: [],
  [QUOTE_JOB_RESULT_STATUS_FAILED]: [],
};

export function canTransitionQuoteJobEngineResultStatus(
  from: QuoteJobResultStatus,
  to: QuoteJobResultStatus,
): boolean {
  return QUOTE_JOB_ENGINE_RESULT_TRANSITIONS[from].includes(to);
}

export function applyQuoteJobEngineEntryUpdate(
  entry: QuoteJobEngineEntry,
  patch: Partial<Pick<QuoteJobEngineEntry, "jobState" | "resultStatus" | "executionId" | "lastError">>,
): QuoteJobEngineEntry {
  return {
    ...entry,
    ...patch,
    updatedAt: nowIso(),
  };
}

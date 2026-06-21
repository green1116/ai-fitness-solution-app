import type { QuoteJobCommand } from "./quote-job-command.types";
import type { QuoteJobState } from "../job/quote-job.types";

export type QuoteJobResultStatus = "QUEUED" | "DISPATCHED" | "COMPLETED" | "FAILED";

export interface QuoteJobEngineEntry {
  command: QuoteJobCommand;
  jobState: QuoteJobState;
  resultStatus: QuoteJobResultStatus;
  executionId?: string;
  lastError?: string;
  updatedAt: string;
}

export interface QuoteJobEngineStateTransitionResult {
  accepted: boolean;
  previousResultStatus: QuoteJobResultStatus;
  nextResultStatus: QuoteJobResultStatus;
  entry: QuoteJobEngineEntry;
  reason?: string;
}

export interface QuoteJobResolveResult {
  jobId: string;
  resolved: boolean;
  result?: QuoteJobResultStatus;
  entry?: QuoteJobEngineEntry;
  reason?: string;
}

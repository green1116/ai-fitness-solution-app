import type { QuoteExecutionStatus } from "../execution/quote-execution.types";
import type { QuoteJobStatus } from "../job/quote-job.types";

export type QuoteLifecycleStatus =
  | "IDLE"
  | "QUEUED"
  | "SCHEDULED"
  | "RUNNING"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED"
  | "RETRYING";

export interface QuoteLifecycleState {
  quoteId: string;
  status: QuoteLifecycleStatus;
  jobStatus?: QuoteJobStatus;
  executionStatus?: QuoteExecutionStatus;
  executionId?: string;
  jobId?: string;
  retryCount?: number;
  lastError?: string;
  updatedAt: string;
}

export interface QuoteLifecycleTransitionResult {
  accepted: boolean;
  previousStatus: QuoteLifecycleStatus;
  nextStatus: QuoteLifecycleStatus;
  state: QuoteLifecycleState;
  reason?: string;
}

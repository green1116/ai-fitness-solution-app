export type QuoteExecutionStatus =
  | "NOT_STARTED"
  | "STARTED"
  | "IN_PROGRESS"
  | "DONE"
  | "ERROR"
  | "UNKNOWN";

export interface QuoteExecutionState {
  executionId: string;
  quoteId: string;
  status: QuoteExecutionStatus;
  jobId?: string;
  lastError?: string;
  updatedAt: string;
}

export interface QuoteExecutionTransitionResult {
  accepted: boolean;
  previousStatus: QuoteExecutionStatus;
  nextStatus: QuoteExecutionStatus;
  state: QuoteExecutionState;
  reason?: string;
}

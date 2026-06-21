export type QuoteJobStatus =
  | "PENDING"
  | "DISPATCHED"
  | "ACTIVE"
  | "COMPLETED"
  | "ERRORED"
  | "ABORTED";

export interface QuoteJobState {
  jobId: string;
  quoteId: string;
  status: QuoteJobStatus;
  retryCount?: number;
  lastError?: string;
  updatedAt: string;
}

export interface QuoteJobTransitionResult {
  accepted: boolean;
  previousStatus: QuoteJobStatus;
  nextStatus: QuoteJobStatus;
  state: QuoteJobState;
  reason?: string;
}

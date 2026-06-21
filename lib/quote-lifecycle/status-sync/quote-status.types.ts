export type QuoteStatusLifecycleStatus =
  | "IDLE"
  | "QUEUED"
  | "RUNNING"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "RETRYING";

export type QuoteStatusJobStatus = "PENDING" | "DISPATCHED" | "COMPLETED" | "FAILED";

export type QuoteStatusExecutionStatus = "NOT_STARTED" | "RUNNING" | "DONE" | "ERROR";

export interface QuoteStatusSnapshot {
  quoteId: string;
  workspaceId: string;
  lifecycleStatus: QuoteStatusLifecycleStatus;
  jobStatus: QuoteStatusJobStatus;
  executionStatus: QuoteStatusExecutionStatus;
  lastEventType: string;
  lastEventId?: string;
  updatedAt: string;
}

export interface QuoteStatusReduceResult {
  accepted: boolean;
  snapshot: QuoteStatusSnapshot;
  reason?: string;
}

export interface QuoteStatusProjectionResult {
  accepted: boolean;
  snapshot: QuoteStatusSnapshot;
  previousSnapshot: QuoteStatusSnapshot;
  reason?: string;
}

export type QuoteStatusStore = Map<string, QuoteStatusSnapshot>;

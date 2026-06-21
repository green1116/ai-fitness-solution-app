export type QuoteAsyncResponseStatus = "ACCEPTED" | "REJECTED" | "RUNNING";

export interface QuoteAsyncRequest {
  jobId: string;
  executionId?: string;
  quoteId: string;
  workspaceId: string;
  payload?: unknown;
}

export interface QuoteAsyncResponse {
  success: boolean;
  executionId?: string;
  status: QuoteAsyncResponseStatus;
  error?: string;
}

export interface QuoteAsyncSubmitResult {
  accepted: boolean;
  response: QuoteAsyncResponse;
  note?: string;
}

export interface QuoteRuntimeBridgeRequest {
  workspaceId: string;
  quoteId: string;
  executionId?: string;
  jobId: string;
  payload?: unknown;
}

export interface QuoteRuntimeBridgeResponse {
  success: boolean;
  executionId?: string;
  status: "ACCEPTED" | "RUNNING" | "DONE" | "REJECTED";
  error?: string;
}

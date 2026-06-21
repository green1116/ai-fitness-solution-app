export type QuoteExecutionMode = "SYNC" | "ASYNC";

export type QuoteExecutionStatus = "RUNNING" | "DONE" | "FAILED";

export interface QuoteExecutionRequest {
  workspaceId: string;
  quoteId?: string;
  executionMode?: QuoteExecutionMode;
}

export interface QuoteExecutionResponse {
  success: boolean;
  executionId?: string;
  status: QuoteExecutionStatus;
  error?: string;
  quoteId?: string;
  logs?: string[];
}

export interface QuoteExecutionError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface QuoteExecutionClient {
  execute(request: QuoteExecutionRequest): Promise<QuoteExecutionResponse>;
}

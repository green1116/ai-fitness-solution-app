import type { QuoteExecutionRequest } from "./quote-execution.types";

export function createExecutionRequest(input: {
  workspaceId: string;
  quoteId?: string;
  executionMode?: QuoteExecutionRequest["executionMode"];
}): QuoteExecutionRequest {
  return {
    workspaceId: input.workspaceId.trim(),
    quoteId: input.quoteId?.trim(),
    executionMode: input.executionMode ?? "SYNC",
  };
}

export function validateExecutionRequest(request: QuoteExecutionRequest): boolean {
  return request.workspaceId.trim().length > 0;
}

export function assertExecutionRequest(request: QuoteExecutionRequest): void {
  if (!validateExecutionRequest(request)) {
    throw new Error("workspaceId is required for quote execution");
  }
}

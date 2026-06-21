import type { QuoteProductContext } from "../service/quote-product.types";
import type { QuoteRuntimeClientRequest } from "../integration/quote-runtime.client";
import type { QuoteExecutionRequest } from "./quote-execution.types";
import { createExecutionRequest } from "./quote-execution.validation";

export function adaptExecutionRequestToRuntimeClient(
  request: QuoteExecutionRequest,
): QuoteRuntimeClientRequest {
  return {
    workspaceId: request.workspaceId,
    quoteId: request.quoteId,
    executionMode: request.executionMode,
  };
}

export function createExecutionRequestFromProductContext(
  context: QuoteProductContext,
): QuoteExecutionRequest {
  return createExecutionRequest({
    workspaceId: context.workspaceId,
    quoteId: context.quoteId,
    executionMode: "SYNC",
  });
}

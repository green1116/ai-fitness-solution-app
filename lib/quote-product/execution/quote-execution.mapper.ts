import type { QuoteRuntimeClientResult } from "../integration/quote-runtime.client";
import type { QuoteProductResult } from "../service/quote-product.types";
import type { QuoteExecutionResponse } from "./quote-execution.types";

export function mapRuntimeResult(runtimeResult: QuoteRuntimeClientResult): QuoteExecutionResponse {
  return {
    success: runtimeResult.success,
    executionId: runtimeResult.executionId,
    quoteId: runtimeResult.quoteId,
    status: runtimeResult.success ? "DONE" : "FAILED",
    logs: runtimeResult.logs,
    error: runtimeResult.success ? undefined : "Quote runtime execution failed",
  };
}

export function mapExecutionResponseToProductResult(
  response: QuoteExecutionResponse,
): QuoteProductResult {
  return {
    success: response.success,
    executionId: response.executionId,
    quoteId: response.quoteId,
    status: response.status,
    error: response.error,
    logs: response.logs,
  };
}

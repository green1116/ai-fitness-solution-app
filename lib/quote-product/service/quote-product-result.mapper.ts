import type { QuoteProductExecutionView } from "../shared/quote-product-types";
import type { QuoteRuntimeClientResult } from "../integration/quote-runtime.client";
import { mapExecutionResponseToProductResult } from "../execution/quote-execution.mapper";
import type { QuoteProductResult } from "./quote-product.types";

export function mapRuntimeClientResultToProductResult(
  runtimeResult: QuoteRuntimeClientResult,
): QuoteProductResult {
  return mapExecutionResponseToProductResult({
    success: runtimeResult.success,
    executionId: runtimeResult.executionId,
    quoteId: runtimeResult.quoteId,
    status: runtimeResult.success ? "DONE" : "FAILED",
    logs: runtimeResult.logs,
    error: runtimeResult.success ? undefined : "Quote runtime execution failed",
  });
}

export function mapProductResultToExecutionView(
  workspaceId: string,
  result: QuoteProductResult,
): QuoteProductExecutionView {
  const quoteStatus =
    result.status === "DONE" ? "DONE" : result.status === "FAILED" ? "FAILED" : "RUNNING";
  const readiness = result.success ? "READY" : "BLOCKED";

  return {
    workspaceId,
    success: result.success,
    quoteId: result.quoteId,
    executionId: result.executionId,
    quoteStatus,
    readiness,
    logs: result.logs ?? [],
  };
}

import type { QuoteProductResult } from "../service/quote-product.types";
import type { QuoteProductExecutionView } from "../shared/quote-product-types";
import type { QuoteExecutionResponse } from "../execution/quote-execution.types";
import type { QuoteUIState, QuoteUIStatus } from "./quote-ui.model";
import { computeQuoteReadiness } from "./quote-ui-readiness";

function mapExecutionStatusToQuoteUIStatus(status: QuoteProductResult["status"]): QuoteUIStatus {
  if (status === "DONE") {
    return "DONE";
  }
  if (status === "FAILED") {
    return "FAILED";
  }
  return "RUNNING";
}

export function createQuoteUIState(
  workspaceId: string,
  options?: Partial<Pick<QuoteUIState, "quoteStatus" | "readiness" | "lastExecutionId" | "lastError">>,
): QuoteUIState {
  const quoteStatus = options?.quoteStatus ?? "EMPTY";
  const readiness =
    options?.readiness ??
    computeQuoteReadiness({
      quoteStatus,
      hasError: Boolean(options?.lastError),
    });

  return {
    workspaceId: workspaceId.trim(),
    quoteStatus,
    readiness,
    lastExecutionId: options?.lastExecutionId,
    lastError: options?.lastError,
  };
}

export function mapProductResultToUIState(
  workspaceId: string,
  result: QuoteProductResult,
): QuoteUIState {
  const quoteStatus = mapExecutionStatusToQuoteUIStatus(result.status);
  const hasError = !result.success || Boolean(result.error);

  return createQuoteUIState(workspaceId, {
    quoteStatus,
    readiness: computeQuoteReadiness({
      quoteStatus,
      success: result.success,
      hasError,
    }),
    lastExecutionId: result.executionId,
    lastError: hasError ? result.error ?? result.logs?.at(-1) ?? "quote execution failed" : undefined,
  });
}

export function mapExecutionResultToUIState(
  execution: QuoteProductExecutionView,
): QuoteUIState {
  return createQuoteUIState(execution.workspaceId, {
    quoteStatus: execution.quoteStatus,
    readiness: computeQuoteReadiness({
      quoteStatus: execution.quoteStatus,
      success: execution.success,
      hasError: !execution.success,
    }),
    lastExecutionId: execution.executionId,
    lastError: execution.success ? undefined : execution.logs.at(-1) ?? "quote execution failed",
  });
}

export function mapExecutionResponseToUIState(
  workspaceId: string,
  response: QuoteExecutionResponse,
): QuoteUIState {
  return mapProductResultToUIState(workspaceId, {
    success: response.success,
    executionId: response.executionId,
    status: response.status,
    error: response.error,
    quoteId: response.quoteId,
    logs: response.logs,
  });
}

export function markQuoteUIStateRunning(state: QuoteUIState): QuoteUIState {
  return {
    ...state,
    quoteStatus: "RUNNING",
    readiness: computeQuoteReadiness({ quoteStatus: "RUNNING" }),
    lastError: undefined,
  };
}

export function markQuoteUIStateDraft(state: QuoteUIState): QuoteUIState {
  return {
    ...state,
    quoteStatus: "DRAFT",
    readiness: computeQuoteReadiness({ quoteStatus: "DRAFT" }),
    lastError: undefined,
  };
}

export function applyQuoteExecutionToUIState(
  state: QuoteUIState,
  input: {
    success: boolean;
    executionId?: string;
    errorMessage?: string;
  },
): QuoteUIState {
  const quoteStatus: QuoteUIStatus = input.success ? "DONE" : "FAILED";
  const hasError = !input.success;

  return {
    ...state,
    quoteStatus,
    readiness: computeQuoteReadiness({
      quoteStatus,
      success: input.success,
      hasError,
    }),
    lastExecutionId: input.executionId,
    lastError: input.errorMessage,
  };
}

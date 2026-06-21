import type { QuoteExecutionError, QuoteExecutionResponse } from "./quote-execution.types";

export const QUOTE_EXECUTION_ERROR_UNKNOWN = "QUOTE_EXECUTION_UNKNOWN" as const;
export const QUOTE_EXECUTION_ERROR_RUNTIME = "QUOTE_EXECUTION_RUNTIME" as const;
export const QUOTE_EXECUTION_ERROR_VALIDATION = "QUOTE_EXECUTION_VALIDATION" as const;

export type QuoteExecutionErrorCode =
  | typeof QUOTE_EXECUTION_ERROR_UNKNOWN
  | typeof QUOTE_EXECUTION_ERROR_RUNTIME
  | typeof QUOTE_EXECUTION_ERROR_VALIDATION
  | string;

export function normalizeExecutionError(
  input: unknown,
  fallbackCode: QuoteExecutionErrorCode = QUOTE_EXECUTION_ERROR_UNKNOWN,
): QuoteExecutionError {
  if (input instanceof Error) {
    return {
      code: fallbackCode,
      message: input.message,
      retryable: fallbackCode === QUOTE_EXECUTION_ERROR_RUNTIME,
    };
  }

  if (typeof input === "string" && input.trim().length > 0) {
    return {
      code: fallbackCode,
      message: input.trim(),
      retryable: false,
    };
  }

  return {
    code: fallbackCode,
    message: "Quote execution failed",
    retryable: false,
  };
}

export function buildExecutionErrorResponse(error: QuoteExecutionError): QuoteExecutionResponse {
  return {
    success: false,
    status: "FAILED",
    error: `${error.code}: ${error.message}`,
  };
}

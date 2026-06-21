import { executeQuoteViaRuntimeClient } from "../integration/quote-runtime.client";
import { adaptExecutionRequestToRuntimeClient } from "./quote-execution.adapter";
import {
  QUOTE_EXECUTION_ERROR_RUNTIME,
  buildExecutionErrorResponse,
  normalizeExecutionError,
} from "./quote-execution.error";
import { mapRuntimeResult } from "./quote-execution.mapper";
import type {
  QuoteExecutionClient,
  QuoteExecutionRequest,
  QuoteExecutionResponse,
} from "./quote-execution.types";
import { assertExecutionRequest, validateExecutionRequest } from "./quote-execution.validation";

export { createExecutionRequest, validateExecutionRequest } from "./quote-execution.validation";
export { mapRuntimeResult } from "./quote-execution.mapper";
export { normalizeExecutionError } from "./quote-execution.error";

export async function executeQuoteRuntime(
  request: QuoteExecutionRequest,
): Promise<QuoteExecutionResponse> {
  assertExecutionRequest(request);

  try {
    const runtimeResult = await executeQuoteViaRuntimeClient(
      adaptExecutionRequestToRuntimeClient(request),
    );
    return mapRuntimeResult(runtimeResult);
  } catch (error) {
    const normalized = normalizeExecutionError(error, QUOTE_EXECUTION_ERROR_RUNTIME);
    return buildExecutionErrorResponse(normalized);
  }
}

export function buildExecutionClient(): QuoteExecutionClient {
  return {
    execute: executeQuoteRuntime,
  };
}

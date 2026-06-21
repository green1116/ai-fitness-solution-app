import {
  QUOTE_ASYNC_STATUS_ACCEPTED,
  QUOTE_ASYNC_STATUS_RUNNING,
} from "../shared/quote-lifecycle-constants";
import type { QuoteAsyncRequest, QuoteAsyncResponse } from "./quote-async-client.types";

export function stubAsyncExecution(request: QuoteAsyncRequest): QuoteAsyncResponse {
  const executionId = request.executionId?.trim() || `exec-${request.jobId.trim()}`;

  return {
    success: true,
    executionId,
    status: QUOTE_ASYNC_STATUS_ACCEPTED,
  };
}

export function stubAsyncExecutionRunning(request: QuoteAsyncRequest): QuoteAsyncResponse {
  const executionId = request.executionId?.trim() || `exec-${request.jobId.trim()}`;

  return {
    success: true,
    executionId,
    status: QUOTE_ASYNC_STATUS_RUNNING,
  };
}

export function describeStubAsyncExecution(request: QuoteAsyncRequest): string {
  return `stubAsyncExecution.jobId=${request.jobId};status=${QUOTE_ASYNC_STATUS_RUNNING}`;
}

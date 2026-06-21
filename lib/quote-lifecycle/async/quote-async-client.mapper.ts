import type { QuoteJobCommand } from "../job-engine/quote-job-command.types";
import type {
  QuoteAsyncRequest,
  QuoteAsyncResponse,
  QuoteRuntimeBridgeResponse,
} from "./quote-async-client.types";

export function mapJobToAsyncRequest(command: QuoteJobCommand, executionId?: string): QuoteAsyncRequest {
  return {
    jobId: command.jobId.trim(),
    executionId: executionId?.trim() ?? `exec-${command.jobId.trim()}`,
    quoteId: command.quoteId.trim(),
    workspaceId: command.workspaceId.trim(),
    payload: command.payload,
  };
}

export function mapRuntimeResponseToAsyncResponse(
  bridgeResponse: QuoteRuntimeBridgeResponse,
): QuoteAsyncResponse {
  if (bridgeResponse.status === "REJECTED") {
    return {
      success: false,
      executionId: bridgeResponse.executionId,
      status: "REJECTED",
      error: bridgeResponse.error ?? "runtime bridge rejected request",
    };
  }

  if (bridgeResponse.status === "RUNNING" || bridgeResponse.status === "DONE") {
    return {
      success: bridgeResponse.success,
      executionId: bridgeResponse.executionId,
      status: "RUNNING",
      error: bridgeResponse.error,
    };
  }

  return {
    success: bridgeResponse.success,
    executionId: bridgeResponse.executionId,
    status: "ACCEPTED",
    error: bridgeResponse.error,
  };
}

export function mapAsyncRequestToRuntimeBridgeRequest(
  request: QuoteAsyncRequest,
): import("./quote-async-client.types").QuoteRuntimeBridgeRequest {
  return {
    jobId: request.jobId,
    executionId: request.executionId,
    quoteId: request.quoteId,
    workspaceId: request.workspaceId,
    payload: request.payload,
  };
}

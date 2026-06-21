import type {
  QuoteRuntimeBridgeRequest,
  QuoteRuntimeBridgeResponse,
} from "../async/quote-async-client.types";

export interface QuoteRuntimeBridgeClient {
  invoke(request: QuoteRuntimeBridgeRequest): QuoteRuntimeBridgeResponse;
}

export function sendToRuntimeBridge(
  request: QuoteRuntimeBridgeRequest,
  bridge: QuoteRuntimeBridgeClient,
): QuoteRuntimeBridgeResponse {
  return bridge.invoke({
    jobId: request.jobId.trim(),
    quoteId: request.quoteId.trim(),
    workspaceId: request.workspaceId.trim(),
    executionId: request.executionId?.trim(),
    payload: request.payload,
  });
}

export function createQuoteRuntimeBridgeStub(): QuoteRuntimeBridgeClient {
  return {
    invoke(request) {
      const executionId = request.executionId?.trim() || `exec-${request.jobId.trim()}`;

      return {
        success: true,
        executionId,
        status: "ACCEPTED",
      };
    },
  };
}

export function createQuoteRuntimeBridgeRunningStub(): QuoteRuntimeBridgeClient {
  return {
    invoke(request) {
      const executionId = request.executionId?.trim() || `exec-${request.jobId.trim()}`;

      return {
        success: true,
        executionId,
        status: "RUNNING",
      };
    },
  };
}

export function describeQuoteRuntimeBridge(request: QuoteRuntimeBridgeRequest): string {
  return `quoteRuntimeBridge.workspaceId=${request.workspaceId};quoteId=${request.quoteId}`;
}

import type {
  QuoteAsyncRequest,
  QuoteAsyncResponse,
  QuoteRuntimeBridgeRequest,
  QuoteRuntimeBridgeResponse,
} from "./quote-async-client.types";
import {
  mapAsyncRequestToRuntimeBridgeRequest,
  mapRuntimeResponseToAsyncResponse,
} from "./quote-async-client.mapper";
import {
  createQuoteRuntimeBridgeStub,
  sendToRuntimeBridge,
  type QuoteRuntimeBridgeClient,
} from "../integration/quote-runtime.bridge";
import { stubAsyncExecution } from "./quote-async-client.stub";

export function createQuoteAsyncAdapter(options?: {
  bridge?: QuoteRuntimeBridgeClient;
}): QuoteAsyncAdapter {
  const bridge = options?.bridge ?? createQuoteRuntimeBridgeStub();

  return {
    bridge,
    toAsyncResponse(request, bridgeResponse) {
      return mapRuntimeResponseToAsyncResponse(bridgeResponse);
    },
    toBridgeRequest(request) {
      return mapAsyncRequestToRuntimeBridgeRequest(request);
    },
    invoke(request) {
      const bridgeRequest = mapAsyncRequestToRuntimeBridgeRequest(request);
      const bridgeResponse = sendToRuntimeBridge(bridgeRequest, bridge);
      return mapRuntimeResponseToAsyncResponse(bridgeResponse);
    },
    invokeStub(request) {
      return stubAsyncExecution(request);
    },
  };
}

export interface QuoteAsyncAdapter {
  bridge: QuoteRuntimeBridgeClient;
  toBridgeRequest(request: QuoteAsyncRequest): QuoteRuntimeBridgeRequest;
  toAsyncResponse(
    request: QuoteAsyncRequest,
    bridgeResponse: QuoteRuntimeBridgeResponse,
  ): QuoteAsyncResponse;
  invoke(request: QuoteAsyncRequest): QuoteAsyncResponse;
  invokeStub(request: QuoteAsyncRequest): QuoteAsyncResponse;
}

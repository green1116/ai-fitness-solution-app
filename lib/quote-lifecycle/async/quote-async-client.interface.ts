import type { QuoteJobCommand } from "../job-engine/quote-job-command.types";
import type {
  QuoteAsyncRequest,
  QuoteAsyncResponse,
  QuoteAsyncSubmitResult,
} from "./quote-async-client.types";
import type { QuoteRuntimeBridgeClient } from "../integration/quote-runtime.bridge";
import { createQuoteAsyncAdapter } from "./quote-async-client.adapter";
import { createAsyncGateway, submitAsyncExecution } from "./quote-async-client.gateway";
import { mapJobToAsyncRequest } from "./quote-async-client.mapper";

export interface QuoteAsyncClient {
  submitAsyncExecution(request: QuoteAsyncRequest): QuoteAsyncSubmitResult;
  submitJobCommand(command: QuoteJobCommand): QuoteAsyncSubmitResult;
}

export interface QuoteAsyncClientOptions {
  bridge?: QuoteRuntimeBridgeClient;
}

export interface QuoteAsyncGateway {
  submit(request: QuoteAsyncRequest): QuoteAsyncSubmitResult;
}

export interface QuoteAsyncGatewayOptions {
  bridge?: QuoteRuntimeBridgeClient;
}

export function createQuoteAsyncClient(options?: QuoteAsyncClientOptions): QuoteAsyncClient {
  const adapter = createQuoteAsyncAdapter({ bridge: options?.bridge });
  const gateway = createAsyncGateway({ bridge: adapter.bridge });

  return {
    submitAsyncExecution(request) {
      return submitAsyncExecution(request, adapter);
    },
    submitJobCommand(command) {
      const request = mapJobToAsyncRequest(command);
      return gateway.submit(request);
    },
  };
}

export function createQuoteAsyncClientForJobEngine(options?: QuoteAsyncClientOptions): {
  submit(command: QuoteJobCommand): { accepted: boolean; note: string };
} {
  const client = createQuoteAsyncClient(options);

  return {
    submit(command) {
      const result = client.submitJobCommand(command);
      return {
        accepted: result.accepted,
        note: result.note ?? "quote async runtime client submission",
      };
    },
  };
}

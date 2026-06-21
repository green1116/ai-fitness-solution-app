import type { QuoteJobCommand } from "../job-engine/quote-job-command.types";
import type { QuoteAsyncGateway, QuoteAsyncGatewayOptions } from "./quote-async-client.interface";
import type { QuoteAsyncRequest, QuoteAsyncSubmitResult } from "./quote-async-client.types";
import { createQuoteAsyncAdapter } from "./quote-async-client.adapter";
import { mapJobToAsyncRequest } from "./quote-async-client.mapper";

export function createAsyncGateway(options?: QuoteAsyncGatewayOptions): QuoteAsyncGateway {
  const adapter = createQuoteAsyncAdapter({ bridge: options?.bridge });

  return {
    submit(request) {
      return submitAsyncExecution(request, adapter);
    },
  };
}

export function submitAsyncExecution(
  request: QuoteAsyncRequest,
  adapter = createQuoteAsyncAdapter(),
): QuoteAsyncSubmitResult {
  const response = adapter.invoke(request);

  return {
    accepted: response.success && response.status !== "REJECTED",
    response,
    note: "async runtime client submission",
  };
}

export function submitJobCommandAsync(
  command: QuoteJobCommand,
  adapter = createQuoteAsyncAdapter(),
): QuoteAsyncSubmitResult {
  const request = mapJobToAsyncRequest(command);
  return submitAsyncExecution(request, adapter);
}

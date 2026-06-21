import { createExecutionRequestFromProductContext } from "../execution/quote-execution.adapter";
import { executeQuoteRuntime } from "../execution/quote-execution.client";
import { mapExecutionResponseToProductResult } from "../execution/quote-execution.mapper";
import type { QuoteProductContext, QuoteProductResult } from "./quote-product.types";
import { assertQuoteProductContext } from "./quote-product.validation";

export async function dispatchQuoteProductExecution(
  context: QuoteProductContext,
): Promise<QuoteProductResult> {
  assertQuoteProductContext(context);
  const request = createExecutionRequestFromProductContext(context);
  const response = await executeQuoteRuntime(request);
  return mapExecutionResponseToProductResult(response);
}

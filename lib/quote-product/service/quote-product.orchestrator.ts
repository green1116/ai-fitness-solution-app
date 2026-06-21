import { dispatchQuoteProductExecution } from "./quote-product.execution";
import type { QuoteProductExecutionView } from "../shared/quote-product-types";
import {
  mapProductResultToExecutionView,
} from "./quote-product-result.mapper";
import {
  createQuoteProductContext,
  mapExecutionViewForUI,
} from "./quote-product.service";
import type { QuoteProductContext, QuoteProductResult } from "./quote-product.types";

export { getQuoteStatusForUI } from "./quote-product.service";

export async function orchestrateQuoteExecution(
  context: QuoteProductContext,
): Promise<QuoteProductResult> {
  return dispatchQuoteProductExecution(context);
}

export async function executeQuoteFromUI(workspaceId: string): Promise<QuoteProductExecutionView> {
  const context = createQuoteProductContext({ workspaceId });
  const productResult = await orchestrateQuoteExecution(context);
  const executionView = mapProductResultToExecutionView(context.workspaceId, productResult);

  return mapExecutionViewForUI(context.workspaceId, {
    success: executionView.success,
    quoteId: executionView.quoteId,
    executionId: executionView.executionId,
    logs: executionView.logs,
  });
}

export async function runQuoteProductFlow(workspaceId: string): Promise<QuoteProductExecutionView> {
  return executeQuoteFromUI(workspaceId);
}

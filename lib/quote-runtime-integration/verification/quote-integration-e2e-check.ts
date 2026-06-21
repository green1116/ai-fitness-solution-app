import {
  assertMountedQuoteEndToEndFlow,
  assertE2eChainComplete,
  assertHasE2eContext,
  assertHasE2eResult,
} from "../e2e/quote-e2e-validation";
import { runQuoteEndToEndFlow } from "../e2e/quote-e2e-flow";
import { isQuoteEndToEndSuccess } from "../e2e/quote-e2e-result";

export interface QuoteIntegrationE2eCheck {
  hasE2eContext: boolean;
  hasE2eResult: boolean;
  chainComplete: boolean;
  mountedFlow: boolean;
}

export async function runQuoteIntegrationE2eCheck(): Promise<QuoteIntegrationE2eCheck> {
  const mountedFlow = await assertMountedQuoteEndToEndFlow();
  let chainComplete = false;

  if (mountedFlow) {
    const result = await runQuoteEndToEndFlow("v56-p7-e2e-mounted");
    chainComplete = assertE2eChainComplete(result) && isQuoteEndToEndSuccess(result);
  }

  return {
    hasE2eContext: assertHasE2eContext(),
    hasE2eResult: assertHasE2eResult(),
    chainComplete,
    mountedFlow,
  };
}

export async function assertQuoteIntegrationE2eComplete(): Promise<boolean> {
  const check = await runQuoteIntegrationE2eCheck();
  return Object.values(check).every(Boolean);
}

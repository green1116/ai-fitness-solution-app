import type { QuoteLifecycleState } from "./quote-lifecycle.types";

export function validateQuoteLifecycleState(state: QuoteLifecycleState): boolean {
  return state.quoteId.trim().length > 0 && state.updatedAt.trim().length > 0;
}

export function assertQuoteLifecycleState(state: QuoteLifecycleState): void {
  if (!validateQuoteLifecycleState(state)) {
    throw new Error("quote lifecycle state requires quoteId and updatedAt");
  }
}

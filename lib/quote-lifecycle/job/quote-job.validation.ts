import type { QuoteJobState } from "./quote-job.types";

export function validateQuoteJobState(state: QuoteJobState): boolean {
  return state.jobId.trim().length > 0 && state.quoteId.trim().length > 0;
}

export function assertQuoteJobState(state: QuoteJobState): void {
  if (!validateQuoteJobState(state)) {
    throw new Error("quote job state requires jobId and quoteId");
  }
}

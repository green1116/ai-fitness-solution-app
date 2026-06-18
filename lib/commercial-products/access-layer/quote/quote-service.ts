import type { QuoteRequest, QuoteResponse } from "../shared/types";
import { runQuoteRuntime } from "./quote-runtime";

export function createQuote(request: QuoteRequest): QuoteResponse {
  return runQuoteRuntime(request);
}

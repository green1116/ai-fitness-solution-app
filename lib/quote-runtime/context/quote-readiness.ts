import type { QuoteReadiness } from "../bridge/quote-bridge-view";

export type { QuoteReadiness };

export function isQuoteReadinessBlocked(readiness: QuoteReadiness): boolean {
  return readiness === "BLOCKED";
}

export function isQuoteReadinessReady(readiness: QuoteReadiness): boolean {
  return readiness === "READY";
}

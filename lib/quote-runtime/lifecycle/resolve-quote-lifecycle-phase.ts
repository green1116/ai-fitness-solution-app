import type { QuoteReadiness } from "../bridge/quote-bridge-view";
import type { QuoteLifecyclePhase } from "./quote-lifecycle";

export function resolveQuoteLifecyclePhase(readiness: QuoteReadiness): QuoteLifecyclePhase {
  switch (readiness) {
    case "READY":
      return "REVIEW";
    case "PARTIAL":
      return "DRAFT";
    case "BLOCKED":
    default:
      return "INTAKE";
  }
}

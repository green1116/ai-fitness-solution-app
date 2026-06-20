import type { QuoteDomainView } from "../domain/quote-domain-types";
import type { QuoteLifecyclePhase, QuoteLifecycleStatus } from "./quote-lifecycle-types";

export function resolveQuoteLifecycleStatus(phase: QuoteLifecyclePhase): QuoteLifecycleStatus {
  switch (phase) {
    case "REVIEW":
      return "READY";
    case "DRAFT":
      return "OPEN";
    case "INTAKE":
    default:
      return "PENDING";
  }
}

export function resolveQuoteLifecycleStatusFromDomainView(
  domainView: QuoteDomainView,
): QuoteLifecycleStatus {
  return resolveQuoteLifecycleStatus(domainView.lifecyclePhase);
}

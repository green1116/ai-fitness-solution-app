import type { QuoteContextSnapshot } from "../context/quote-context-snapshot";
import type {
  QuoteDomainLifecyclePhase,
  QuoteDomainReadiness,
  QuoteDomainState,
} from "./quote-domain-types";

export function resolveQuoteDomainState(readiness: QuoteDomainReadiness): QuoteDomainState {
  switch (readiness) {
    case "READY":
      return "ACTIVE";
    case "PARTIAL":
      return "SHELL";
    case "BLOCKED":
    default:
      return "SUSPENDED";
  }
}

export function resolveQuoteDomainLifecyclePhase(
  readiness: QuoteDomainReadiness,
): QuoteDomainLifecyclePhase {
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

export function resolveQuoteDomainStateFromSnapshot(snapshot: QuoteContextSnapshot): QuoteDomainState {
  return resolveQuoteDomainState(snapshot.quoteReadiness);
}

export function resolveQuoteDomainLifecyclePhaseFromSnapshot(
  snapshot: QuoteContextSnapshot,
): QuoteDomainLifecyclePhase {
  return resolveQuoteDomainLifecyclePhase(snapshot.quoteReadiness);
}

import type { QuoteReadiness } from "../bridge/quote-bridge-view";

export type QuoteContextLifecyclePhase = "INTAKE" | "DRAFT" | "REVIEW";

export type QuoteContextDomainState = "ACTIVE" | "SHELL" | "SUSPENDED";

export const QUOTE_CONTEXT_LIFECYCLE_PHASE_VALUES: QuoteContextLifecyclePhase[] = [
  "INTAKE",
  "DRAFT",
  "REVIEW",
];

export const QUOTE_CONTEXT_DOMAIN_STATE_VALUES: QuoteContextDomainState[] = [
  "ACTIVE",
  "SHELL",
  "SUSPENDED",
];

export function resolveContextLifecyclePhase(readiness: QuoteReadiness): QuoteContextLifecyclePhase {
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

export function resolveContextDomainState(readiness: QuoteReadiness): QuoteContextDomainState {
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

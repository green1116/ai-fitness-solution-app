import {
  QUOTE_DOMAIN_LIFECYCLE_PHASE_VALUES,
  QUOTE_DOMAIN_READINESS_VALUES,
  QUOTE_DOMAIN_STATE_VALUES,
  type QuoteDomainView,
} from "./quote-domain-types";
import {
  resolveQuoteDomainLifecyclePhase,
  resolveQuoteDomainState,
} from "./quote-domain-state";

export function validateQuoteDomainView(view: QuoteDomainView): { valid: boolean; summary: string } {
  const valid =
    view.workspaceId.trim().length > 0 &&
    view.version.trim().length > 0 &&
    QUOTE_DOMAIN_READINESS_VALUES.includes(view.quoteReadiness) &&
    QUOTE_DOMAIN_LIFECYCLE_PHASE_VALUES.includes(view.lifecyclePhase) &&
    QUOTE_DOMAIN_STATE_VALUES.includes(view.domainState) &&
    view.lifecyclePhase === resolveQuoteDomainLifecyclePhase(view.quoteReadiness) &&
    view.domainState === resolveQuoteDomainState(view.quoteReadiness);

  return {
    valid,
    summary: [
      `workspaceId=${view.workspaceId}`,
      `quoteReadiness=${view.quoteReadiness}`,
      `lifecyclePhase=${view.lifecyclePhase}`,
      `domainState=${view.domainState}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertQuoteDomainViewGuard(view: QuoteDomainView): boolean {
  return validateQuoteDomainView(view).valid;
}

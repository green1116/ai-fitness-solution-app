import type { QuoteDomainView } from "../domain/quote-domain-types";
import type { QuoteLifecycleView } from "./quote-lifecycle-types";
import { resolveQuoteLifecycleStatusFromDomainView } from "./quote-lifecycle-state";

export function createQuoteLifecycleView(domainView: QuoteDomainView): QuoteLifecycleView {
  return {
    workspaceId: domainView.workspaceId,
    version: domainView.version,
    lifecyclePhase: domainView.lifecyclePhase,
    lifecycleStatus: resolveQuoteLifecycleStatusFromDomainView(domainView),
    quoteReadiness: domainView.quoteReadiness,
    domainState: domainView.domainState,
  };
}

export function describeQuoteLifecycleView(view: QuoteLifecycleView): string {
  return [
    `workspaceId=${view.workspaceId}`,
    `lifecyclePhase=${view.lifecyclePhase}`,
    `lifecycleStatus=${view.lifecycleStatus}`,
    `quoteReadiness=${view.quoteReadiness}`,
  ].join(" ");
}

export function assertQuoteLifecycleViewShape(view: QuoteLifecycleView): boolean {
  return (
    view.workspaceId.trim().length > 0 &&
    view.version.trim().length > 0 &&
    view.lifecyclePhase.trim().length > 0 &&
    view.lifecycleStatus.trim().length > 0
  );
}

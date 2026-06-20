import type { QuoteContextSnapshot } from "../context/quote-context-snapshot";
import type { QuoteDomainView } from "./quote-domain-types";
import {
  resolveQuoteDomainLifecyclePhaseFromSnapshot,
  resolveQuoteDomainStateFromSnapshot,
} from "./quote-domain-state";

export function createQuoteDomainView(snapshot: QuoteContextSnapshot): QuoteDomainView {
  return {
    workspaceId: snapshot.workspaceId,
    version: snapshot.version,
    quoteReadiness: snapshot.quoteReadiness,
    lifecyclePhase: resolveQuoteDomainLifecyclePhaseFromSnapshot(snapshot),
    domainState: resolveQuoteDomainStateFromSnapshot(snapshot),
    surfaceEligible: snapshot.surfaceEligible,
    surfaceVisible: snapshot.surfaceVisible,
    surfaceActive: snapshot.surfaceActive,
  };
}

export function describeQuoteDomainView(view: QuoteDomainView): string {
  return [
    `workspaceId=${view.workspaceId}`,
    `quoteReadiness=${view.quoteReadiness}`,
    `lifecyclePhase=${view.lifecyclePhase}`,
    `domainState=${view.domainState}`,
  ].join(" ");
}

export function assertQuoteDomainViewShape(view: QuoteDomainView): boolean {
  return (
    view.workspaceId.trim().length > 0 &&
    view.version.trim().length > 0 &&
    view.lifecyclePhase.trim().length > 0 &&
    view.domainState.trim().length > 0
  );
}

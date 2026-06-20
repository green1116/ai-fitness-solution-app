import type { WorkspaceQuoteRuntimeContext } from "./workspace-quote-runtime-context-types";

export type QuoteContextSnapshot = Readonly<WorkspaceQuoteRuntimeContext>;

export function createQuoteContextSnapshot(
  context: WorkspaceQuoteRuntimeContext,
): QuoteContextSnapshot {
  return Object.freeze({
    workspaceId: context.workspaceId,
    version: context.version,
    entryState: context.entryState,
    quoteReadiness: context.quoteReadiness,
    lifecyclePhase: context.lifecyclePhase,
    domainState: context.domainState,
    surfaceEligible: context.surfaceEligible,
    surfaceVisible: context.surfaceVisible,
    surfaceActive: context.surfaceActive,
  });
}

export function describeQuoteContextSnapshot(snapshot: QuoteContextSnapshot): string {
  return [
    `workspaceId=${snapshot.workspaceId}`,
    `quoteReadiness=${snapshot.quoteReadiness}`,
    `lifecyclePhase=${snapshot.lifecyclePhase}`,
    `domainState=${snapshot.domainState}`,
  ].join(" ");
}

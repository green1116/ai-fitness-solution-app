import type { QuoteBridgeView } from "../bridge/quote-bridge-view";
import {
  resolveContextDomainState,
  resolveContextLifecyclePhase,
} from "./create-quote-runtime-context";
import type { WorkspaceQuoteRuntimeContext } from "./workspace-quote-runtime-context-types";

export function createWorkspaceQuoteRuntimeContext(
  bridgeView: QuoteBridgeView,
): WorkspaceQuoteRuntimeContext {
  return {
    workspaceId: bridgeView.workspaceId,
    version: bridgeView.version,
    entryState: bridgeView.entryState,
    quoteReadiness: bridgeView.quoteReadiness,
    lifecyclePhase: resolveContextLifecyclePhase(bridgeView.quoteReadiness),
    domainState: resolveContextDomainState(bridgeView.quoteReadiness),
    surfaceEligible: bridgeView.surfaceEligible,
    surfaceVisible: bridgeView.surfaceVisible,
    surfaceActive: bridgeView.surfaceActive,
  };
}

export function describeWorkspaceQuoteRuntimeContext(context: WorkspaceQuoteRuntimeContext): string {
  return [
    `workspaceId=${context.workspaceId}`,
    `version=${context.version}`,
    `entryState=${context.entryState}`,
    `quoteReadiness=${context.quoteReadiness}`,
    `lifecyclePhase=${context.lifecyclePhase}`,
    `domainState=${context.domainState}`,
  ].join(" ");
}

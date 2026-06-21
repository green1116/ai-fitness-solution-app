import type { QuoteWorkspaceView } from "../shared/quote-product-types";
import { createInitialQuoteUIState } from "../ui/quote-ui.state";
import type { QuoteUIState } from "../ui/quote-ui.model";
import type { QuoteWorkspaceResolveInput, ResolvedQuoteWorkspace } from "./quote-workspace.types";

export function resolveQuoteWorkspaceRoute(workspaceId: string): string {
  return `/saas-product/workspaces/${encodeURIComponent(workspaceId.trim())}/quotes`;
}

export function resolveQuoteWorkspaceTitle(workspaceId: string): string {
  return `Quote Workspace ${workspaceId.trim()}`;
}

export function resolveQuoteWorkspace(input: QuoteWorkspaceResolveInput): ResolvedQuoteWorkspace {
  const workspaceId = input.workspaceId.trim();
  return {
    workspaceId,
    title: resolveQuoteWorkspaceTitle(workspaceId),
    portalRoute: resolveQuoteWorkspaceRoute(workspaceId),
    tenantId: input.tenantId?.trim(),
    sessionId: input.sessionId?.trim(),
  };
}

export function resolveQuoteWorkspaceView(workspaceId: string, uiState?: QuoteUIState): QuoteWorkspaceView {
  const resolvedWorkspaceId = workspaceId.trim();
  const state = uiState ?? createInitialQuoteUIState(resolvedWorkspaceId);

  return {
    workspaceId: resolvedWorkspaceId,
    title: resolveQuoteWorkspaceTitle(resolvedWorkspaceId),
    portalRoute: resolveQuoteWorkspaceRoute(resolvedWorkspaceId),
    uiState: state,
  };
}

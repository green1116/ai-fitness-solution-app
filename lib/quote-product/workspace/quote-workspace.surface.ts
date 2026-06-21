import { resolveQuoteWorkspace } from "./quote-workspace.resolver";
import { loadQuoteWorkspace } from "./quote-workspace.service";

export interface QuoteWorkspaceSurface {
  workspaceId: string;
  title: string;
  portalRoute: string;
  quoteStatus: ReturnType<typeof loadQuoteWorkspace>["uiState"]["quoteStatus"];
  readiness: ReturnType<typeof loadQuoteWorkspace>["uiState"]["readiness"];
}

export function buildQuoteWorkspaceSurface(workspaceId: string): QuoteWorkspaceSurface {
  const resolved = resolveQuoteWorkspace({ workspaceId });
  const workspace = loadQuoteWorkspace(resolved.workspaceId);

  return {
    workspaceId: resolved.workspaceId,
    title: resolved.title,
    portalRoute: resolved.portalRoute,
    quoteStatus: workspace.uiState.quoteStatus,
    readiness: workspace.uiState.readiness,
  };
}

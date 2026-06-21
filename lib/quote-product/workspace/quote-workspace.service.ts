import type { QuoteWorkspaceView } from "../shared/quote-product-types";
import { createInitialQuoteUIState } from "../ui/quote-ui.state";
import { resolveQuoteWorkspaceView } from "./quote-workspace.resolver";

export function loadQuoteWorkspace(workspaceId: string): QuoteWorkspaceView {
  if (workspaceId.trim().length === 0) {
    throw new Error("workspaceId is required");
  }

  return resolveQuoteWorkspaceView(workspaceId, createInitialQuoteUIState(workspaceId));
}

export { loadQuoteEntryWorkspace } from "../entry/quote-entry.controller";

export function describeQuoteWorkspace(workspaceId: string): string {
  const view = loadQuoteWorkspace(workspaceId);
  return [
    `workspaceId=${view.workspaceId}`,
    `route=${view.portalRoute}`,
    `quoteStatus=${view.uiState.quoteStatus}`,
    `readiness=${view.uiState.readiness}`,
  ].join(" ");
}

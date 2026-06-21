import { buildQuoteEntrySurface } from "../entry/quote-entry.controller";
import { createQuoteUIState, markQuoteUIStateDraft } from "../ui/quote-ui-state.mapper";
import type { QuoteUIState } from "../ui/quote-ui.model";
import { buildQuoteWorkspaceSurface } from "../workspace/quote-workspace.surface";

export function buildQuoteProductState(workspaceId: string): QuoteUIState {
  const entrySurface = buildQuoteEntrySurface(workspaceId);
  const workspaceSurface = buildQuoteWorkspaceSurface(workspaceId);

  if (entrySurface.uiState.quoteStatus !== "EMPTY") {
    return createQuoteUIState(workspaceId, {
      quoteStatus: entrySurface.uiState.quoteStatus,
      readiness: entrySurface.uiState.readiness,
      lastExecutionId: entrySurface.uiState.lastExecutionId,
      lastError: entrySurface.uiState.lastError,
    });
  }

  if (workspaceSurface.quoteStatus !== "EMPTY") {
    return createQuoteUIState(workspaceId, {
      quoteStatus: workspaceSurface.quoteStatus,
      readiness: workspaceSurface.readiness,
    });
  }

  return markQuoteUIStateDraft(createQuoteUIState(workspaceId));
}

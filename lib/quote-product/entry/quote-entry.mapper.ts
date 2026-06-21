import type { QuoteEntryRequest, QuoteEntryView, QuoteProductExecutionView } from "../shared/quote-product-types";
import { QUOTE_UI_STATUS_DRAFT } from "../shared/quote-product-constants";
import {
  createInitialQuoteUIState,
  mapExecutionResultToQuoteUIState,
  markQuoteUIStateDraft,
} from "../ui/quote-ui.state";
import type { QuoteEntrySubmissionResult } from "./quote-entry.types";

function buildQuoteEntryId(workspaceId: string): string {
  return `entry-${workspaceId.trim()}`;
}

export function mapQuoteEntryRequestToView(request: QuoteEntryRequest): QuoteEntryView {
  const workspaceId = request.workspaceId.trim();
  const uiState = markQuoteUIStateDraft(createInitialQuoteUIState(workspaceId));

  return {
    workspaceId,
    entryId: buildQuoteEntryId(workspaceId),
    title: request.title?.trim() || `Quote Entry ${workspaceId}`,
    quoteStatus: uiState.quoteStatus ?? QUOTE_UI_STATUS_DRAFT,
  };
}

export function mapQuoteEntryToUIState(entry: QuoteEntryView) {
  return markQuoteUIStateDraft(createInitialQuoteUIState(entry.workspaceId));
}

export function mapExecutionResultToEntryUIState(
  execution: QuoteProductExecutionView,
): QuoteEntrySubmissionResult["uiState"] {
  return mapExecutionResultToQuoteUIState(execution);
}

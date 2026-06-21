import type { QuoteUIReadiness, QuoteUIStatus } from "../ui/quote-ui.model";
import type { QuoteEntryView, QuoteProductExecutionView } from "../shared/quote-product-types";

export interface QuoteEntryFormInput {
  workspaceId: string;
  title?: string;
}

export interface QuoteEntrySubmission extends QuoteEntryFormInput {
  submit: true;
}

export interface QuoteEntrySubmissionResult {
  entry: QuoteEntryView;
  execution: QuoteProductExecutionView;
  uiState: {
    workspaceId: string;
    quoteStatus: QuoteUIStatus;
    readiness: QuoteUIReadiness;
    lastExecutionId?: string;
    lastError?: string;
  };
}

export interface QuoteEntrySurface {
  workspaceId: string;
  portalRoute: string;
  title: string;
  entry: QuoteEntryView;
  uiState: QuoteEntrySubmissionResult["uiState"];
  form: {
    workspaceId: string;
    titlePlaceholder: string;
    submitLabel: string;
  };
}

export interface QuoteEntryWorkspaceView {
  workspaceId: string;
  title: string;
  portalRoute: string;
  entry: QuoteEntryView;
  uiState: QuoteEntrySubmissionResult["uiState"];
}

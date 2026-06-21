import type {
  QuoteUIReadiness,
  QuoteUIStatus,
} from "../ui/quote-ui.model";

export interface QuoteWorkspaceView {
  workspaceId: string;
  title: string;
  portalRoute: string;
  uiState: {
    workspaceId: string;
    quoteStatus: QuoteUIStatus;
    readiness: QuoteUIReadiness;
    lastExecutionId?: string;
    lastError?: string;
  };
}

export interface QuoteEntryRequest {
  workspaceId: string;
  title?: string;
}

export interface QuoteEntryView {
  workspaceId: string;
  entryId: string;
  title: string;
  quoteStatus: QuoteUIStatus;
}

export interface QuoteProductExecutionView {
  workspaceId: string;
  success: boolean;
  quoteId?: string;
  executionId?: string;
  quoteStatus: QuoteUIStatus;
  readiness: QuoteUIReadiness;
  logs: string[];
}

export interface QuoteSurfaceView {
  workspaceId: string;
  title: string;
  quoteStatus: QuoteUIStatus;
  readiness: QuoteUIReadiness;
  sections: Array<{ key: string; label: string; visible: boolean }>;
}

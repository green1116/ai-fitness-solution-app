import {
  QUOTE_UI_READINESS_BLOCKED,
  QUOTE_UI_READINESS_PARTIAL,
  QUOTE_UI_READINESS_READY,
  QUOTE_UI_STATUS_DONE,
  QUOTE_UI_STATUS_DRAFT,
  QUOTE_UI_STATUS_EMPTY,
  QUOTE_UI_STATUS_FAILED,
  QUOTE_UI_STATUS_RUNNING,
} from "../shared/quote-product-constants";

export type QuoteUIStatus =
  | typeof QUOTE_UI_STATUS_EMPTY
  | typeof QUOTE_UI_STATUS_DRAFT
  | typeof QUOTE_UI_STATUS_RUNNING
  | typeof QUOTE_UI_STATUS_DONE
  | typeof QUOTE_UI_STATUS_FAILED;

export type QuoteUIReadiness =
  | typeof QUOTE_UI_READINESS_READY
  | typeof QUOTE_UI_READINESS_PARTIAL
  | typeof QUOTE_UI_READINESS_BLOCKED;

export interface QuoteUIState {
  workspaceId: string;
  quoteStatus: QuoteUIStatus;
  readiness: QuoteUIReadiness;
  lastExecutionId?: string;
  lastError?: string;
}

export const QUOTE_UI_STATUS_VALUES: QuoteUIStatus[] = [
  QUOTE_UI_STATUS_EMPTY,
  QUOTE_UI_STATUS_DRAFT,
  QUOTE_UI_STATUS_RUNNING,
  QUOTE_UI_STATUS_DONE,
  QUOTE_UI_STATUS_FAILED,
];

export const QUOTE_UI_READINESS_VALUES: QuoteUIReadiness[] = [
  QUOTE_UI_READINESS_READY,
  QUOTE_UI_READINESS_PARTIAL,
  QUOTE_UI_READINESS_BLOCKED,
];

export function describeQuoteUIState(state: QuoteUIState): string {
  return [
    `workspaceId=${state.workspaceId}`,
    `quoteStatus=${state.quoteStatus}`,
    `readiness=${state.readiness}`,
    state.lastExecutionId ? `lastExecutionId=${state.lastExecutionId}` : "lastExecutionId=none",
    state.lastError ? `lastError=${state.lastError}` : "lastError=none",
  ].join(" ");
}

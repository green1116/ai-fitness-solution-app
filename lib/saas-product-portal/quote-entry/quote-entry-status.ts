import type { QuoteEntryStatusView } from "../shared/portal-types";

export const QUOTE_ENTRY_STATUS_VIEW: QuoteEntryStatusView = {
  phase: "P6",
  layer: "business-entry",
  capability: "entry-only",
  commercialLogic: false,
  label: "Entry Ready",
  summary: "Quote Entry UI shell mounted · commercial logic not implemented",
};

export function getQuoteEntryStatusView(): QuoteEntryStatusView {
  return QUOTE_ENTRY_STATUS_VIEW;
}

import type { ReportEntryStatusView } from "../shared/portal-types";

export const REPORT_ENTRY_STATUS_VIEW: ReportEntryStatusView = {
  phase: "P8",
  layer: "business-entry",
  capability: "entry-only",
  reportRuntime: false,
  label: "Entry Ready",
  summary: "Report Entry UI shell mounted · report runtime not implemented",
};

export function getReportEntryStatusView(): ReportEntryStatusView {
  return REPORT_ENTRY_STATUS_VIEW;
}

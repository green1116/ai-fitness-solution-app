import type { ReportEntryPlaceholderCard } from "../shared/portal-types";

export const REPORT_ENTRY_PLACEHOLDER_CARDS: ReportEntryPlaceholderCard[] = [
  {
    key: "report-list",
    title: "Report List",
    description: "Future workspace-scoped report inventory will appear here.",
    status: "coming-soon",
  },
  {
    key: "report-summary",
    title: "Summary Reports",
    description: "Placeholder for summary reporting surfaces without report runtime.",
    status: "coming-soon",
  },
  {
    key: "report-metadata",
    title: "Report Metadata",
    description: "Read-only metadata preview reserved for a future report runtime.",
    status: "coming-soon",
  },
];

export function listReportEntryPlaceholderCards(): ReportEntryPlaceholderCard[] {
  return REPORT_ENTRY_PLACEHOLDER_CARDS;
}

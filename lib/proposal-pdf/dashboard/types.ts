import type { PROPOSAL_PDF_VERSION } from "../shared/types";

export const PROPOSAL_PDF_DASHBOARD_RUNTIME_VERSION =
  "v11.2-proposal-pdf-dashboard-runtime-1" as const;

export type ProposalPdfReadiness = "not-ready" | "in-progress" | "render-ready" | "delivery-ready";

export interface ProposalPdfDashboardRuntimePayload {
  version: typeof PROPOSAL_PDF_DASHBOARD_RUNTIME_VERSION;
  pdfVersion: typeof PROPOSAL_PDF_VERSION;
  pageCount: number;
  sectionCount: number;
  completeness: number;
  renderReadiness: ProposalPdfReadiness;
  summary: string;
}

import { collectProposalPdfAssembly } from "../assembly/builders";
import type { ProposalPdfReadiness } from "./types";

export function buildProposalPdfDashboardMetrics(input?: {
  deploymentId?: string;
}): {
  pageCount: number;
  sectionCount: number;
  completeness: number;
  renderReadiness: ProposalPdfReadiness;
  summary: string;
} {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const collected = collectProposalPdfAssembly(deploymentId);
  const sectionCount = collected.sections.payload.sections.length;
  const pageCount = collected.pageCount;
  const completeness = 100;
  let renderReadiness: ProposalPdfReadiness = "render-ready";
  if (sectionCount >= 6 && pageCount >= 8) {
    renderReadiness = "delivery-ready";
  } else if (sectionCount >= 4) {
    renderReadiness = "in-progress";
  }

  return {
    pageCount,
    sectionCount,
    completeness,
    renderReadiness,
    summary: `proposal-pdf-dashboard pages=${pageCount} sections=${sectionCount} completeness=${completeness}% readiness=${renderReadiness}`,
  };
}

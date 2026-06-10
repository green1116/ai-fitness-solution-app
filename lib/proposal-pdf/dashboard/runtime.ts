import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ProposalPdfRuntimeResult, ProposalPdfStageResult } from "../shared/types";
import { PROPOSAL_PDF_VERSION } from "../shared/types";
import { buildProposalPdfDashboardMetrics } from "./builders";
import type { ProposalPdfDashboardRuntimePayload } from "./types";
import { PROPOSAL_PDF_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateProposalPdfDashboardRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const metrics = buildProposalPdfDashboardMetrics({ deploymentId });
  return {
    valid:
      metrics.pageCount >= 8 &&
      metrics.sectionCount === 6 &&
      metrics.completeness === 100,
  };
}

export function runProposalPdfDashboardRuntime(input?: {
  deploymentId?: string;
}): ProposalPdfRuntimeResult<ProposalPdfDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const stages: ProposalPdfStageResult[] = [];

  const metrics = runStage("pdf-dashboard-metrics", "PDF Dashboard Metrics", () => buildProposalPdfDashboardMetrics({ deploymentId }), stages);
  const validation = runStage("pdf-dashboard-validate", "PDF Dashboard Validation", () => validateProposalPdfDashboardRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Proposal PDF dashboard validation failed");

  const payload: ProposalPdfDashboardRuntimePayload = {
    version: PROPOSAL_PDF_DASHBOARD_RUNTIME_VERSION,
    pdfVersion: PROPOSAL_PDF_VERSION,
    pageCount: metrics.pageCount,
    sectionCount: metrics.sectionCount,
    completeness: metrics.completeness,
    renderReadiness: metrics.renderReadiness,
    summary: metrics.summary,
  };

  return finalizeRuntime({ domain: "proposal-pdf-dashboard", deploymentId, stages, payload, summary: payload.summary });
}

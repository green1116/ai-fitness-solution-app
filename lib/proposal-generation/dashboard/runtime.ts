import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ProposalRuntimeResult, ProposalStageResult } from "../shared/types";
import { PROPOSAL_GENERATION_VERSION } from "../shared/types";
import { buildProposalDashboardMetrics } from "./builders";
import type { ProposalDashboardRuntimePayload } from "./types";
import { PROPOSAL_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateProposalDashboardRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const metrics = buildProposalDashboardMetrics({ deploymentId });
  return {
    valid:
      metrics.proposalCompleteness > 0 &&
      metrics.sectionCount === 6 &&
      metrics.complianceCoverage >= 0 &&
      metrics.riskCoverage === 100,
  };
}

export function runProposalDashboardRuntime(input?: {
  deploymentId?: string;
}): ProposalRuntimeResult<ProposalDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const stages: ProposalStageResult[] = [];

  const metrics = runStage("dashboard-metrics", "Proposal Dashboard Metrics", () => buildProposalDashboardMetrics({ deploymentId }), stages);

  const validation = runStage("dashboard-validate", "Proposal Dashboard Validation", () => validateProposalDashboardRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Proposal dashboard validation failed");

  const payload: ProposalDashboardRuntimePayload = {
    version: PROPOSAL_DASHBOARD_RUNTIME_VERSION,
    proposalVersion: PROPOSAL_GENERATION_VERSION,
    proposalCompleteness: metrics.proposalCompleteness,
    proposalReadiness: metrics.proposalReadiness,
    complianceCoverage: metrics.complianceCoverage,
    riskCoverage: metrics.riskCoverage,
    deliveryReadiness: metrics.deliveryReadiness,
    sectionCount: metrics.sectionCount,
    summary: metrics.summary,
  };

  return finalizeRuntime({ domain: "proposal-dashboard", deploymentId, stages, payload, summary: payload.summary });
}

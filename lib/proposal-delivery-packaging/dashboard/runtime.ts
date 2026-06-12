import { finalizeRuntime, runStage } from "../shared/runtime";
import type { PackagingRuntimeResult, PackagingStageResult } from "../shared/types";
import { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";
import { buildProposalPackagingDashboardMetrics } from "./builders";
import type { ProposalPackagingDashboardRuntimePayload } from "./types";
import { PROPOSAL_PACKAGING_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateProposalPackagingDashboardRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const metrics = buildProposalPackagingDashboardMetrics(input);
  return {
    valid:
      metrics.budgetAlignmentScore >= 85 &&
      metrics.deliveryReadiness >= 90,
  };
}

export function runProposalPackagingDashboardRuntime(input?: {
  deploymentId?: string;
}): PackagingRuntimeResult<ProposalPackagingDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "proposal-packaging-dashboard-default";
  const stages: PackagingStageResult[] = [];

  const metrics = runStage("proposal-packaging-dashboard-build", "Proposal Packaging Dashboard", () => buildProposalPackagingDashboardMetrics(input), stages);
  const validation = runStage("proposal-packaging-dashboard-validate", "Dashboard Validation", () => validateProposalPackagingDashboardRuntime(input), stages);
  if (!validation.valid) throw new Error("Proposal packaging dashboard validation failed");

  const payload: ProposalPackagingDashboardRuntimePayload = {
    version: PROPOSAL_PACKAGING_DASHBOARD_RUNTIME_VERSION,
    packagingVersion: PROPOSAL_DELIVERY_PACKAGING_VERSION,
    metrics,
    budgetAlignmentScore: metrics.budgetAlignmentScore,
    deliveryReadinessScore: metrics.deliveryReadiness,
    summary: metrics.summary,
  };

  return finalizeRuntime({ domain: "proposal-packaging-dashboard", deploymentId, stages, payload, summary: payload.summary });
}

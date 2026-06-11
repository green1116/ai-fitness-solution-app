import { finalizeRuntime, runStage } from "../shared/runtime";
import type { DifferentiationRuntimeResult, DifferentiationStageResult } from "../shared/types";
import { PROPOSAL_DIFFERENTIATION_VERSION } from "../shared/types";
import { buildDifferentiationDashboardMetrics } from "./builders";
import type { DifferentiationDashboardRuntimePayload } from "./types";
import { DIFFERENTIATION_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateDifferentiationDashboardRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const metrics = buildDifferentiationDashboardMetrics(input);
  return {
    valid:
      metrics.differentiationScore > 0 &&
      metrics.variantScores.length === 4 &&
      metrics.brandDifferentiation > 0 &&
      metrics.proposalDifferentiation > 0,
  };
}

export function runDifferentiationDashboardRuntime(input?: {
  deploymentId?: string;
}): DifferentiationRuntimeResult<DifferentiationDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "differentiation-dashboard-default";
  const stages: DifferentiationStageResult[] = [];

  const metrics = runStage("differentiation-dashboard-metrics", "Differentiation Dashboard", () => buildDifferentiationDashboardMetrics({ deploymentId }), stages);
  const validation = runStage("differentiation-dashboard-validate", "Dashboard Validation", () => validateDifferentiationDashboardRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Differentiation dashboard validation failed");

  const payload: DifferentiationDashboardRuntimePayload = {
    version: DIFFERENTIATION_DASHBOARD_RUNTIME_VERSION,
    differentiationVersion: PROPOSAL_DIFFERENTIATION_VERSION,
    brandDifferentiation: metrics.brandDifferentiation,
    budgetDifferentiation: metrics.budgetDifferentiation,
    equipmentDifferentiation: metrics.equipmentDifferentiation,
    proposalDifferentiation: metrics.proposalDifferentiation,
    differentiationScore: metrics.differentiationScore,
    variantScores: metrics.variantScores,
    summary: metrics.summary,
  };

  return finalizeRuntime({ domain: "differentiation-dashboard", deploymentId, stages, payload, summary: payload.summary });
}

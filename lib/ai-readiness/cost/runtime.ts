import { finalizeRuntime, runStage } from "../shared/runtime";
import type { AiReadinessRuntimeResult, AiReadinessStageResult } from "../shared/types";
import { AI_READINESS_VERSION } from "../shared/types";
import { buildCostEstimates } from "./builders";
import type { CostRuntimePayload } from "./types";
import { COST_RUNTIME_VERSION } from "./types";

export function validateCostRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "cost-default";
  const costs = buildCostEstimates({ deploymentId });
  return {
    valid:
      costs.requestCost.amountUsd > 0 &&
      costs.proposalCost.amountUsd > costs.requestCost.amountUsd &&
      costs.monthlyCost.amountUsd > costs.proposalCost.amountUsd,
  };
}

export function runCostRuntime(input?: {
  deploymentId?: string;
}): AiReadinessRuntimeResult<CostRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "cost-default";
  const stages: AiReadinessStageResult[] = [];

  const costs = runStage("cost-estimates", "Cost Estimates", () => buildCostEstimates({ deploymentId }), stages);
  const validation = runStage("cost-validate", "Cost Validation", () => validateCostRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Cost runtime validation failed");

  const payload: CostRuntimePayload = {
    version: COST_RUNTIME_VERSION,
    readinessVersion: AI_READINESS_VERSION,
    requestCost: costs.requestCost,
    proposalCost: costs.proposalCost,
    monthlyCost: costs.monthlyCost,
    summary: `cost-runtime request=$${costs.requestCost.amountUsd} proposal=$${costs.proposalCost.amountUsd} monthly=$${costs.monthlyCost.amountUsd}`,
  };

  return finalizeRuntime({ domain: "cost-runtime", deploymentId, stages, payload, summary: payload.summary });
}

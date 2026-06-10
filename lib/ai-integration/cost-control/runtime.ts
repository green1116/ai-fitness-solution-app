import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  AiIntegrationRuntimeResult,
  AiIntegrationStageResult,
} from "../shared/types";
import { AI_INTEGRATION_VERSION } from "../shared/types";
import { runAdapterSmokeTests } from "../provider-adapter/builders";
import { aggregateUsage, checkCostAllowed, resolveCostLimits } from "./builders";
import type { AiCostControlRuntimePayload } from "./types";
import { AI_COST_CONTROL_RUNTIME_VERSION } from "./types";

export function validateAiCostControlRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const responses = runAdapterSmokeTests({
    deploymentId: input?.deploymentId ?? "cost-default",
    forceMode: "stub",
  });
  const usage = aggregateUsage(responses);
  return { valid: checkCostAllowed(usage) && usage.requestCount > 0 };
}

export function runAiCostControlRuntime(input?: {
  deploymentId?: string;
}): AiIntegrationRuntimeResult<AiCostControlRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "cost-default";
  const stages: AiIntegrationStageResult[] = [];

  const limits = runStage(
    "cost-limits",
    "Cost Limits",
    () => resolveCostLimits(),
    stages,
  );
  const responses = runStage(
    "cost-sample-requests",
    "Sample Requests",
    () => runAdapterSmokeTests({ deploymentId, forceMode: "stub" }),
    stages,
  );
  const usage = runStage(
    "cost-aggregate",
    "Aggregate Usage",
    () => aggregateUsage(responses),
    stages,
  );
  const validation = runStage(
    "cost-validate",
    "Cost Validation",
    () => validateAiCostControlRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("AI cost control validation failed");

  const payload: AiCostControlRuntimePayload = {
    version: AI_COST_CONTROL_RUNTIME_VERSION,
    integrationVersion: AI_INTEGRATION_VERSION,
    limits,
    usage,
    summary: `ai-cost-control requests=${usage.requestCount} tokens=${usage.totalTokens} cost=$${usage.estimatedCostUsd.toFixed(4)} withinLimits=${checkCostAllowed(usage)}`,
  };

  return finalizeRuntime({
    domain: "ai-cost-control",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}

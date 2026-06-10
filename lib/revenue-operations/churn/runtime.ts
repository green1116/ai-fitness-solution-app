import { finalizeRuntime, runStage } from "../shared/runtime";
import type { RevOpsRuntimeResult, RevOpsStageResult } from "../shared/types";
import { REVENUE_OPERATIONS_VERSION } from "../shared/types";
import { computeChurnMetrics } from "./builders";
import type { ChurnRuntimePayload } from "./types";
import { CHURN_RUNTIME_VERSION } from "./types";

export function validateChurnRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const metrics = computeChurnMetrics(input);
  return { valid: metrics.retentionRate > 0 && metrics.churnRate < 1 };
}

export function runChurnRuntime(input?: { deploymentId?: string }): RevOpsRuntimeResult<ChurnRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "churn-default";
  const stages: RevOpsStageResult[] = [];

  const metrics = runStage("churn-compute", "Churn Metrics", () => computeChurnMetrics({ deploymentId }), stages);
  const validation = runStage("churn-validate", "Churn Validation", () => validateChurnRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Churn runtime validation failed");

  const payload: ChurnRuntimePayload = {
    version: CHURN_RUNTIME_VERSION,
    revOpsVersion: REVENUE_OPERATIONS_VERSION,
    ...metrics,
    summary: `churn-runtime churned=${metrics.churnedCustomers} churnRate=${(metrics.churnRate * 100).toFixed(0)}% retention=${(metrics.retentionRate * 100).toFixed(0)}%`,
  };

  return finalizeRuntime({ domain: "churn-runtime", deploymentId, stages, payload, summary: payload.summary });
}

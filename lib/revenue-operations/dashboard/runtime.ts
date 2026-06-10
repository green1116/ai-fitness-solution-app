import { finalizeRuntime, runStage } from "../shared/runtime";
import type { RevOpsRuntimeResult, RevOpsStageResult } from "../shared/types";
import { REVENUE_OPERATIONS_VERSION } from "../shared/types";
import { buildRevenueOpsDashboardMetrics } from "./builders";
import type { RevenueOpsDashboardRuntimePayload } from "./types";
import { REVENUE_OPS_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateRevenueOpsDashboardRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const metrics = buildRevenueOpsDashboardMetrics(input);
  return {
    valid:
      metrics.pipelineHealth > 0 &&
      metrics.conversionHealth > 0 &&
      metrics.revenueHealth > 0,
  };
}

export function runRevenueOpsDashboardRuntime(input?: {
  deploymentId?: string;
}): RevOpsRuntimeResult<RevenueOpsDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const stages: RevOpsStageResult[] = [];

  const metrics = runStage(
    "revenue-ops-dashboard-metrics",
    "Revenue Ops Dashboard",
    () => buildRevenueOpsDashboardMetrics({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "revenue-ops-dashboard-validate",
    "Dashboard Validation",
    () => validateRevenueOpsDashboardRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Revenue ops dashboard validation failed");

  const payload: RevenueOpsDashboardRuntimePayload = {
    version: REVENUE_OPS_DASHBOARD_RUNTIME_VERSION,
    revOpsVersion: REVENUE_OPERATIONS_VERSION,
    pipelineHealth: metrics.pipelineHealth,
    conversionHealth: metrics.conversionHealth,
    renewalHealth: metrics.renewalHealth,
    retentionHealth: metrics.retentionHealth,
    revenueHealth: metrics.revenueHealth,
    summary: metrics.summary,
  };

  return finalizeRuntime({
    domain: "revenue-dashboard",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}

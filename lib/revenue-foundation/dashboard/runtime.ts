import { finalizeRuntime, runStage } from "../shared/runtime";
import type { RevenueRuntimeResult, RevenueStageResult } from "../shared/types";
import { REVENUE_FOUNDATION_VERSION } from "../shared/types";
import { buildRevenueDashboardMetrics } from "./builders";
import type { RevenueDashboardRuntimePayload } from "./types";
import { REVENUE_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateRevenueDashboardRuntime(input?: {
  deploymentId?: string;
}): {
  metricsValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const metrics = buildRevenueDashboardMetrics({ deploymentId });

  return {
    metricsValid:
      metrics.mrr > 0 &&
      metrics.arr === metrics.mrr * 12 &&
      metrics.activeCustomers > 0 &&
      metrics.trialConversionRate >= 0 &&
      metrics.trialConversionRate <= 100 &&
      metrics.revenueGrowthRate >= 0,
  };
}

export function runRevenueDashboardRuntime(input?: {
  deploymentId?: string;
}): RevenueRuntimeResult<RevenueDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const stages: RevenueStageResult[] = [];

  const metrics = runStage(
    "revenue-dashboard-metrics",
    "Revenue Dashboard Metrics",
    () => buildRevenueDashboardMetrics({ deploymentId }),
    stages,
  );

  const validation = runStage(
    "revenue-dashboard-validate",
    "Revenue Dashboard Validation",
    () => validateRevenueDashboardRuntime({ deploymentId }),
    stages,
  );

  const allValid = Object.values(validation).every(Boolean);
  if (!allValid) {
    throw new Error("Revenue dashboard runtime validation failed");
  }

  const payload: RevenueDashboardRuntimePayload = {
    version: REVENUE_DASHBOARD_RUNTIME_VERSION,
    foundationVersion: REVENUE_FOUNDATION_VERSION,
    metrics,
    summary: `revenue-dashboard mrr=${metrics.mrr} arr=${metrics.arr} customers=${metrics.activeCustomers} trialConversion=${metrics.trialConversionRate}% growth=${metrics.revenueGrowthRate}%`,
  };

  return finalizeRuntime({
    domain: "revenue-dashboard",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}

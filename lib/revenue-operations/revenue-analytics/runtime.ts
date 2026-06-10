import { finalizeRuntime, runStage } from "../shared/runtime";
import type { RevOpsRuntimeResult, RevOpsStageResult } from "../shared/types";
import { REVENUE_OPERATIONS_VERSION } from "../shared/types";
import { buildRevenueSnapshot, buildRevenueTrend } from "./builders";
import type { RevenueAnalyticsRuntimePayload } from "./types";
import { REVENUE_ANALYTICS_RUNTIME_VERSION } from "./types";

export function validateRevenueAnalyticsRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const snapshot = buildRevenueSnapshot(input);
  return { valid: snapshot.mrrCny > 0 && snapshot.arrCny === snapshot.mrrCny * 12 };
}

export function runRevenueAnalyticsRuntime(input?: {
  deploymentId?: string;
}): RevOpsRuntimeResult<RevenueAnalyticsRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "analytics-default";
  const stages: RevOpsStageResult[] = [];

  const snapshot = runStage("revenue-snapshot", "Revenue Snapshot", () => buildRevenueSnapshot({ deploymentId }), stages);
  const trend = runStage("revenue-trend", "Revenue Trend", () => buildRevenueTrend({ deploymentId }), stages);
  const validation = runStage("revenue-analytics-validate", "Analytics Validation", () => validateRevenueAnalyticsRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Revenue analytics validation failed");

  const payload: RevenueAnalyticsRuntimePayload = {
    version: REVENUE_ANALYTICS_RUNTIME_VERSION,
    revOpsVersion: REVENUE_OPERATIONS_VERSION,
    snapshot,
    trend,
    summary: `revenue-analytics MRR=¥${snapshot.mrrCny.toLocaleString()} ARR=¥${snapshot.arrCny.toLocaleString()} growth=${snapshot.revenueGrowthPercent}%`,
  };

  return finalizeRuntime({ domain: "revenue-analytics", deploymentId, stages, payload, summary: payload.summary });
}

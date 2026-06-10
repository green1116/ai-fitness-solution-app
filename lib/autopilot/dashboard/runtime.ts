import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  AutopilotRuntimeResult,
  AutopilotStageResult,
} from "../shared/types";
import { AUTOPILOT_VERSION } from "../shared/types";
import { buildAutopilotDashboardMetrics } from "./builders";
import type { AutopilotDashboardRuntimePayload } from "./types";
import { AUTOPILOT_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateAutopilotDashboardRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const metrics = buildAutopilotDashboardMetrics(input);
  return {
    valid:
      metrics.completionRate >= 50 &&
      metrics.successRate >= 50 &&
      metrics.deliveryReadiness === 100,
  };
}

export function runAutopilotDashboardRuntime(input?: {
  deploymentId?: string;
}): AutopilotRuntimeResult<AutopilotDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const stages: AutopilotStageResult[] = [];

  const metrics = runStage(
    "autopilot-dashboard-metrics",
    "Autopilot Dashboard Metrics",
    () => buildAutopilotDashboardMetrics({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "autopilot-dashboard-validate",
    "Dashboard Validation",
    () => validateAutopilotDashboardRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Autopilot dashboard validation failed");

  const payload: AutopilotDashboardRuntimePayload = {
    version: AUTOPILOT_DASHBOARD_RUNTIME_VERSION,
    autopilotVersion: AUTOPILOT_VERSION,
    completionRate: metrics.completionRate,
    successRate: metrics.successRate,
    retryRate: metrics.retryRate,
    reviewRate: metrics.reviewRate,
    deliveryReadiness: metrics.deliveryReadiness,
    summary: metrics.summary,
  };

  return finalizeRuntime({
    domain: "autopilot-dashboard",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}

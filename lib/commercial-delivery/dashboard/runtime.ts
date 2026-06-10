import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  CommercialDeliveryRuntimeResult,
  CommercialDeliveryStageResult,
} from "../shared/types";
import { COMMERCIAL_DELIVERY_VERSION } from "../shared/types";
import { buildCommercialDashboardMetrics } from "./builders";
import type { CommercialDashboardRuntimePayload } from "./types";
import { COMMERCIAL_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateCommercialDashboardRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const metrics = buildCommercialDashboardMetrics(input);
  return {
    valid:
      metrics.activeProjects > 0 &&
      metrics.downloads >= 3 &&
      metrics.approvals >= 2,
  };
}

export function runCommercialDashboardRuntime(input?: {
  deploymentId?: string;
}): CommercialDeliveryRuntimeResult<CommercialDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const stages: CommercialDeliveryStageResult[] = [];

  const metrics = runStage(
    "commercial-dashboard-metrics",
    "Commercial Dashboard Metrics",
    () => buildCommercialDashboardMetrics({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "commercial-dashboard-validate",
    "Dashboard Validation",
    () => validateCommercialDashboardRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Commercial dashboard validation failed");

  const payload: CommercialDashboardRuntimePayload = {
    version: COMMERCIAL_DASHBOARD_RUNTIME_VERSION,
    deliveryVersion: COMMERCIAL_DELIVERY_VERSION,
    activeProjects: metrics.activeProjects,
    completedProjects: metrics.completedProjects,
    deliveries: metrics.deliveries,
    downloads: metrics.downloads,
    approvals: metrics.approvals,
    summary: metrics.summary,
  };

  return finalizeRuntime({
    domain: "commercial-dashboard",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}

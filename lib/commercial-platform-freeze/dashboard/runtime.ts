import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  CommercialFreezeRuntimeResult,
  CommercialFreezeStageResult,
} from "../shared/types";
import { COMMERCIAL_PLATFORM_FREEZE_VERSION } from "../shared/types";
import { COMMERCIAL_FREEZE_TAG } from "../registry";
import { buildCommercialPlatformDashboardMetrics } from "./builders";
import type { CommercialPlatformDashboardRuntimePayload } from "./types";
import { COMMERCIAL_PLATFORM_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateCommercialPlatformDashboardRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const metrics = buildCommercialPlatformDashboardMetrics(input);
  return {
    valid:
      metrics.platformCompleteness === 100 &&
      metrics.platformStability === 100 &&
      metrics.platformReadiness === 100 &&
      metrics.commercializationReadiness === 100,
  };
}

export function runCommercialPlatformDashboardRuntime(input?: {
  deploymentId?: string;
}): CommercialFreezeRuntimeResult<CommercialPlatformDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "commercial-platform-dashboard-default";
  const stages: CommercialFreezeStageResult[] = [];

  const metrics = runStage(
    "commercial-platform-dashboard-metrics",
    "Commercial Platform Dashboard",
    () => buildCommercialPlatformDashboardMetrics({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "commercial-platform-dashboard-validate",
    "Dashboard Validation",
    () => validateCommercialPlatformDashboardRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Commercial platform dashboard validation failed");

  const payload: CommercialPlatformDashboardRuntimePayload = {
    version: COMMERCIAL_PLATFORM_DASHBOARD_RUNTIME_VERSION,
    freezeVersion: COMMERCIAL_PLATFORM_FREEZE_VERSION,
    freezeTag: COMMERCIAL_FREEZE_TAG,
    platformCompleteness: metrics.platformCompleteness,
    platformStability: metrics.platformStability,
    platformReadiness: metrics.platformReadiness,
    commercializationReadiness: metrics.commercializationReadiness,
    layerScores: metrics.layerScores,
    summary: metrics.summary,
  };

  return finalizeRuntime({
    domain: "commercial-platform-dashboard",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}

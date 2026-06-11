import { finalizeRuntime, runStage } from "../shared/runtime";
import type { GtmRuntimeResult, GtmStageResult } from "../shared/types";
import { GO_TO_MARKET_VERSION } from "../shared/types";
import { buildGtmDashboardMetrics } from "./builders";
import type { GtmDashboardRuntimePayload } from "./types";
import { GTM_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateGtmDashboardRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const metrics = buildGtmDashboardMetrics(input);
  return {
    valid:
      metrics.goToMarketReadiness > 0 &&
      metrics.marketActivation > 0 &&
      metrics.leadMomentum > 0,
  };
}

export function runGtmDashboardRuntime(input?: {
  deploymentId?: string;
}): GtmRuntimeResult<GtmDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const stages: GtmStageResult[] = [];

  const metrics = runStage("gtm-dashboard-metrics", "GTM Dashboard", () => buildGtmDashboardMetrics({ deploymentId }), stages);
  const validation = runStage("gtm-dashboard-validate", "Dashboard Validation", () => validateGtmDashboardRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("GTM dashboard validation failed");

  const payload: GtmDashboardRuntimePayload = {
    version: GTM_DASHBOARD_RUNTIME_VERSION,
    gtmVersion: GO_TO_MARKET_VERSION,
    goToMarketReadiness: metrics.goToMarketReadiness,
    marketActivation: metrics.marketActivation,
    leadMomentum: metrics.leadMomentum,
    conversionMomentum: metrics.conversionMomentum,
    summary: metrics.summary,
  };

  return finalizeRuntime({ domain: "gtm-dashboard", deploymentId, stages, payload, summary: payload.summary });
}

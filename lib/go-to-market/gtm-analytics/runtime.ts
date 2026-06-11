import { finalizeRuntime, runStage } from "../shared/runtime";
import type { GtmRuntimeResult, GtmStageResult } from "../shared/types";
import { GO_TO_MARKET_VERSION } from "../shared/types";
import { buildGtmAnalyticsSnapshot } from "./builders";
import type { GtmAnalyticsRuntimePayload } from "./types";
import { GTM_ANALYTICS_RUNTIME_VERSION } from "./types";

export function validateGtmAnalyticsRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const snapshot = buildGtmAnalyticsSnapshot(input);
  return {
    valid:
      snapshot.leadCount > 0 &&
      snapshot.goToMarketHealth > 0 &&
      snapshot.launchHealth > 0,
  };
}

export function runGtmAnalyticsRuntime(input?: {
  deploymentId?: string;
}): GtmRuntimeResult<GtmAnalyticsRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "analytics-default";
  const stages: GtmStageResult[] = [];

  const snapshot = runStage("gtm-analytics-build", "GTM Analytics", () => buildGtmAnalyticsSnapshot({ deploymentId }), stages);
  const validation = runStage("gtm-analytics-validate", "Analytics Validation", () => validateGtmAnalyticsRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("GTM analytics validation failed");

  const payload: GtmAnalyticsRuntimePayload = {
    version: GTM_ANALYTICS_RUNTIME_VERSION,
    gtmVersion: GO_TO_MARKET_VERSION,
    snapshot,
    summary: `gtm-analytics gtmHealth=${snapshot.goToMarketHealth}% pipeline=${snapshot.pipelineHealth}% conversion=${snapshot.conversionHealth}% launch=${snapshot.launchHealth}%`,
  };

  return finalizeRuntime({ domain: "gtm-analytics", deploymentId, stages, payload, summary: payload.summary });
}

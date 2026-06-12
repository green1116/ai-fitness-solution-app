import { finalizeRuntime, runStage } from "../shared/runtime";
import type { BidderIntelligenceRuntimeResult, BidderIntelligenceStageResult } from "../shared/types";
import { BIDDER_INTELLIGENCE_VERSION } from "../shared/types";
import { buildBidderDashboardMetrics } from "./builders";
import type { BidderDashboardRuntimePayload } from "./types";
import { BIDDER_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateBidderDashboardRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const metrics = buildBidderDashboardMetrics(input);
  return {
    valid:
      metrics.bidderReadiness > 0 &&
      metrics.brandReadiness > 0 &&
      metrics.catalogReadiness > 0 &&
      metrics.proposalDifferentiationReadiness > 0,
  };
}

export function runBidderDashboardRuntime(input?: {
  deploymentId?: string;
}): BidderIntelligenceRuntimeResult<BidderDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "bidder-dashboard-default";
  const stages: BidderIntelligenceStageResult[] = [];

  const metrics = runStage("bidder-dashboard-metrics", "Bidder Intelligence Dashboard", () => buildBidderDashboardMetrics({ deploymentId }), stages);
  const validation = runStage("bidder-dashboard-validate", "Dashboard Validation", () => validateBidderDashboardRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Bidder dashboard validation failed");

  const payload: BidderDashboardRuntimePayload = {
    version: BIDDER_DASHBOARD_RUNTIME_VERSION,
    bidderIntelligenceVersion: BIDDER_INTELLIGENCE_VERSION,
    bidderReadiness: metrics.bidderReadiness,
    brandReadiness: metrics.brandReadiness,
    catalogReadiness: metrics.catalogReadiness,
    proposalDifferentiationReadiness: metrics.proposalDifferentiationReadiness,
    summary: metrics.summary,
  };

  return finalizeRuntime({ domain: "bidder-dashboard", deploymentId, stages, payload, summary: payload.summary });
}

import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ComposerRuntimeResult, ComposerStageResult } from "../shared/types";
import { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";
import { buildBidderProposalDashboardMetrics } from "./builders";
import type { BidderProposalDashboardRuntimePayload } from "./types";
import { BIDDER_PROPOSAL_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateBidderProposalDashboardRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const metrics = buildBidderProposalDashboardMetrics(input);
  return {
    valid:
      metrics.proposalDifferentiationScore >= 85 &&
      metrics.contextReadiness > 0 &&
      metrics.qualityReadiness > 0,
  };
}

export function runBidderProposalDashboardRuntime(input?: {
  deploymentId?: string;
}): ComposerRuntimeResult<BidderProposalDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "bidder-proposal-dashboard-default";
  const stages: ComposerStageResult[] = [];

  const metrics = runStage("bidder-proposal-dashboard-build", "Bidder Proposal Dashboard", () => buildBidderProposalDashboardMetrics(input), stages);
  const validation = runStage("bidder-proposal-dashboard-validate", "Dashboard Validation", () => validateBidderProposalDashboardRuntime(input), stages);
  if (!validation.valid) throw new Error("Bidder proposal dashboard validation failed");

  const payload: BidderProposalDashboardRuntimePayload = {
    version: BIDDER_PROPOSAL_DASHBOARD_RUNTIME_VERSION,
    composerVersion: BIDDER_PROPOSAL_COMPOSER_VERSION,
    metrics,
    proposalDifferentiationScore: metrics.proposalDifferentiationScore,
    summary: metrics.summary,
  };

  return finalizeRuntime({ domain: "bidder-proposal-dashboard", deploymentId, stages, payload, summary: payload.summary });
}

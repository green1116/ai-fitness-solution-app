import { finalizeRuntime, runStage } from "../shared/runtime";
import type { GtmRuntimeResult, GtmStageResult } from "../shared/types";
import { GO_TO_MARKET_VERSION } from "../shared/types";
import { buildCampaigns, summarizeCampaignPerformance } from "./builders";
import type { CampaignRuntimePayload } from "./types";
import { CAMPAIGN_RUNTIME_VERSION } from "./types";

export function validateCampaignRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const campaigns = buildCampaigns(input);
  return { valid: campaigns.length >= 3 && campaigns.some((c) => c.status === "active") };
}

export function runCampaignRuntime(input?: {
  deploymentId?: string;
}): GtmRuntimeResult<CampaignRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "campaign-default";
  const stages: GtmStageResult[] = [];

  const campaigns = runStage("campaign-build", "Campaigns", () => buildCampaigns({ deploymentId }), stages);
  const perf = runStage("campaign-summarize", "Campaign Performance", () => summarizeCampaignPerformance(campaigns), stages);
  const validation = runStage("campaign-validate", "Campaign Validation", () => validateCampaignRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Campaign runtime validation failed");

  const payload: CampaignRuntimePayload = {
    version: CAMPAIGN_RUNTIME_VERSION,
    gtmVersion: GO_TO_MARKET_VERSION,
    campaigns,
    campaignPerformance: perf.campaignPerformance,
    campaignConversion: perf.campaignConversion,
    summary: `campaign-runtime count=${campaigns.length} performance=${perf.campaignPerformance} conversion=${perf.campaignConversion}`,
  };

  return finalizeRuntime({ domain: "campaign-runtime", deploymentId, stages, payload, summary: payload.summary });
}

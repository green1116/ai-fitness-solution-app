import { runCampaignRuntime } from "../campaign/runtime";
import { runLeadAcquisitionRuntime } from "../lead-acquisition/runtime";
import { runOutreachRuntime } from "../outreach/runtime";
import { runProductLaunchRuntime } from "../product-launch/runtime";
import type { GtmAnalyticsSnapshot } from "./types";

export function buildGtmAnalyticsSnapshot(input?: { deploymentId?: string }): GtmAnalyticsSnapshot {
  const deploymentId = input?.deploymentId ?? "analytics-default";

  const launch = runProductLaunchRuntime({ deploymentId });
  const campaign = runCampaignRuntime({ deploymentId });
  const leads = runLeadAcquisitionRuntime({ deploymentId });
  const outreach = runOutreachRuntime({ deploymentId });

  const leadCount = leads.payload.leads.length;
  const campaignCount = campaign.payload.campaigns.length;
  const outreachCount = outreach.payload.records.length;
  const conversionRate = outreach.payload.conversionRate;
  const launchReadiness = launch.payload.launchReadiness;

  const pipelineHealth = Math.round((leads.payload.highQualityCount / leadCount) * 100);
  const conversionHealth = Math.round(conversionRate * 100);
  const launchHealth = launchReadiness;
  const goToMarketHealth = Math.round(
    (pipelineHealth + conversionHealth + launchHealth + campaign.payload.campaignPerformance) / 4,
  );

  return {
    leadCount,
    campaignCount,
    outreachCount,
    conversionRate,
    launchReadiness,
    goToMarketHealth,
    pipelineHealth,
    conversionHealth,
    launchHealth,
  };
}

import { runCampaignRuntime } from "../campaign/runtime";
import { runGtmAnalyticsRuntime } from "../gtm-analytics/runtime";
import { runLeadAcquisitionRuntime } from "../lead-acquisition/runtime";
import { runMarketSegmentRuntime } from "../market-segment/runtime";
import { runOutreachRuntime } from "../outreach/runtime";
import { runProductLaunchRuntime } from "../product-launch/runtime";

export function buildGtmDashboardMetrics(input?: {
  deploymentId?: string;
}): {
  goToMarketReadiness: number;
  marketActivation: number;
  leadMomentum: number;
  conversionMomentum: number;
  summary: string;
} {
  const deploymentId = input?.deploymentId ?? "dashboard-default";

  const launch = runProductLaunchRuntime({ deploymentId });
  const campaign = runCampaignRuntime({ deploymentId });
  const leads = runLeadAcquisitionRuntime({ deploymentId });
  const outreach = runOutreachRuntime({ deploymentId });
  const segments = runMarketSegmentRuntime({ deploymentId });
  const analytics = runGtmAnalyticsRuntime({ deploymentId });

  const goToMarketReadiness = analytics.payload.snapshot.goToMarketHealth;
  const marketActivation = Math.round(
    (campaign.payload.campaigns.filter((c) => c.status === "active").length /
      campaign.payload.campaigns.length) *
      100,
  );
  const leadMomentum = Math.round(
    (leads.payload.highQualityCount / leads.payload.leads.length) * 100,
  );
  const conversionMomentum = Math.round(outreach.payload.conversionRate * 100);

  void launch;
  void segments;

  return {
    goToMarketReadiness,
    marketActivation,
    leadMomentum,
    conversionMomentum,
    summary: `gtm-dashboard readiness=${goToMarketReadiness}% activation=${marketActivation}% leadMomentum=${leadMomentum}% conversionMomentum=${conversionMomentum}%`,
  };
}

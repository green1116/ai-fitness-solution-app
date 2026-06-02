import { buildConversionMetrics } from "./conversion";
import type { CustomerJourneyStageKind, JourneyAnalytics } from "./types";
import { CUSTOMER_JOURNEY_VERSION } from "./types";
import { getLinearFunnelStages } from "./stages";

function computeDropOffRate(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((previous - current) / previous) * 1000) / 10;
}

export function buildJourneyAnalytics(input?: { deploymentId?: string }): JourneyAnalytics {
  const deploymentId = input?.deploymentId ?? "customer-journey-default";
  const metrics = buildConversionMetrics({ deploymentId });
  const linearStages = getLinearFunnelStages();

  const stageCounts: Record<CustomerJourneyStageKind, number> = {
    lead: metrics.leadCount,
    "qualified-lead": metrics.qualifiedLeadCount,
    "demo-requested": metrics.demoRequests,
    "proposal-generated": metrics.proposalGenerated,
    "trial-started": metrics.trialStarted,
    evaluation: metrics.evaluation,
    "commercial-negotiation": metrics.commercialNegotiation,
    won: metrics.won,
    lost: metrics.lost,
  };

  const funnelDropOff = linearStages.slice(1).map((stage, index) => {
    const previousStage = linearStages[index];
    const current = stageCounts[stage.kind];
    const previous = stageCounts[previousStage.kind];
    return {
      stage: stage.kind,
      dropOffRate: computeDropOffRate(current, previous),
    };
  });

  return {
    analyticsId: `journey-analytics-${deploymentId}`,
    version: CUSTOMER_JOURNEY_VERSION,
    leadCount: metrics.leadCount,
    demoRequests: metrics.demoRequests,
    proposalGenerated: metrics.proposalGenerated,
    trialStarted: metrics.trialStarted,
    evaluation: metrics.evaluation,
    won: metrics.won,
    lost: metrics.lost,
    conversionRate: metrics.conversionRate,
    funnelDropOff,
    summary: [
      `journey-analytics leads=${metrics.leadCount}`,
      `demos=${metrics.demoRequests}`,
      `proposals=${metrics.proposalGenerated}`,
      `trials=${metrics.trialStarted}`,
      `evaluations=${metrics.evaluation}`,
      `won=${metrics.won}`,
      `lost=${metrics.lost}`,
      `conversionRate=${metrics.conversionRate}%`,
    ].join(" "),
  };
}

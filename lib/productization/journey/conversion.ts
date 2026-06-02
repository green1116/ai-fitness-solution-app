import type { ConversionMetrics } from "./types";

export const BASELINE_COUNTS = {
  leadCount: 100,
  qualifiedLeadCount: 72,
  demoRequests: 48,
  proposalGenerated: 36,
  trialStarted: 24,
  evaluation: 18,
  commercialNegotiation: 15,
  won: 9,
  lost: 6,
} as const;

function computeConversionRate(won: number, leadCount: number): number {
  if (leadCount === 0) return 0;
  return Math.round((won / leadCount) * 1000) / 10;
}

export function buildConversionMetrics(input?: { deploymentId?: string }): ConversionMetrics {
  const deploymentId = input?.deploymentId ?? "customer-journey-default";
  const conversionRate = computeConversionRate(BASELINE_COUNTS.won, BASELINE_COUNTS.leadCount);

  return {
    metricsId: `conversion-metrics-${deploymentId}`,
    leadCount: BASELINE_COUNTS.leadCount,
    qualifiedLeadCount: BASELINE_COUNTS.qualifiedLeadCount,
    demoRequests: BASELINE_COUNTS.demoRequests,
    proposalGenerated: BASELINE_COUNTS.proposalGenerated,
    trialStarted: BASELINE_COUNTS.trialStarted,
    evaluation: BASELINE_COUNTS.evaluation,
    commercialNegotiation: BASELINE_COUNTS.commercialNegotiation,
    won: BASELINE_COUNTS.won,
    lost: BASELINE_COUNTS.lost,
    conversionRate,
    summary: [
      `conversion-metrics leads=${BASELINE_COUNTS.leadCount}`,
      `won=${BASELINE_COUNTS.won}`,
      `lost=${BASELINE_COUNTS.lost}`,
      `rate=${conversionRate}%`,
    ].join(" "),
  };
}

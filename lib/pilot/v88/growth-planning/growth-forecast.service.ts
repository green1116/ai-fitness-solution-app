/**
 * V88 — Growth forecast (read from V87 revenue ops + V85 health)
 */

import type { AccountHealthRow } from "@/lib/pilot/v85";
import type { RevenueOpsDashboard } from "@/lib/pilot/v87";
import { computeWeightedValue } from "@/lib/pilot/v87";

import type { GrowthForecastSummary, GrowthPlanningQueueItem } from "./growth-ops.types";

const HIGH_VALUE_THRESHOLD = 40_000;

export function computeExpansionPotential(
  account: AccountHealthRow,
  baseRenewalValue: number,
): number {
  if (
    account.forecast.category !== "likely_renew" &&
    account.scores.renewalLikelihood < 65
  ) {
    return Math.round(baseRenewalValue * 0.05);
  }
  const uplift = 0.1 + (account.scores.engagementScore / 100) * 0.15;
  return Math.round(baseRenewalValue * uplift);
}

export function isHighValueAccount(baseRenewalValue: number): boolean {
  return baseRenewalValue >= HIGH_VALUE_THRESHOLD;
}

export function buildGrowthForecastSummary(
  revenueDashboard: RevenueOpsDashboard,
  planningItems: GrowthPlanningQueueItem[],
  lostRecords: Array<{ baseRenewalValue: number }>,
): GrowthForecastSummary {
  const openItems = planningItems.filter((i) => i.outcome === "open");

  const predictedFromRevenue = revenueDashboard.forecast.expectedRenewalValue;

  const expansionOpportunity = openItems.reduce(
    (sum, i) => sum + i.expansionPotential,
    0,
  );

  const churnExposure =
    revenueDashboard.forecast.atRiskRevenue +
    revenueDashboard.forecast.churnedRevenue +
    lostRecords.reduce((sum, r) => sum + r.baseRenewalValue, 0);

  const netGrowthOutlook = Math.round(
    predictedFromRevenue + expansionOpportunity - churnExposure * 0.5,
  );

  return {
    predictedRenewalRevenue: predictedFromRevenue,
    expansionOpportunity,
    churnExposure,
    netGrowthOutlook,
    readOnly: true,
  };
}

export function computePredictedValue(
  baseRenewalValue: number,
  renewalLikelihood: number,
  expansionPotential: number,
): number {
  const weighted = computeWeightedValue(baseRenewalValue, renewalLikelihood);
  return weighted + Math.round(expansionPotential * 0.5);
}

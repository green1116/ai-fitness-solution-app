/**
 * V90 — Portfolio account row builder
 */

import type { AccountHealthRow } from "@/lib/pilot/v85";
import { computeWeightedValue } from "@/lib/pilot/v87";
import type { GrowthPlanningQueueItem } from "@/lib/pilot/v88";
import type { ExpansionQueueItem } from "@/lib/pilot/v89";
import type { RevenueQueueItem } from "@/lib/pilot/v87";

import { computeChurnExposure } from "./portfolio-intelligence.service";
import type { PortfolioAccountRow, PortfolioActionBadge } from "./portfolio.types";
import { SEGMENT_NEXT_ACTIONS } from "./portfolio.types";
import {
  classifyPortfolioSegments,
  resolveBaseRenewalValue,
  resolvePrimarySegment,
} from "./segmentation.service";

function resolveActionBadge(
  primarySegment: PortfolioAccountRow["primarySegment"],
): PortfolioActionBadge {
  switch (primarySegment) {
    case "expansion_ready":
      return "expand";
    case "churn_rescue":
    case "at_risk":
      return "rescue";
    case "follow_up_needed":
      return "follow_up";
    case "enterprise":
    case "high_value":
      return "retain";
    default:
      return "monitor";
  }
}

export function buildPortfolioAccountRow(input: {
  account: AccountHealthRow;
  expansionItem: ExpansionQueueItem | null;
  growthItem: GrowthPlanningQueueItem | null;
  revenueItem: RevenueQueueItem | null;
}): PortfolioAccountRow {
  const { account, expansionItem, growthItem, revenueItem } = input;
  const baseRenewalValue = resolveBaseRenewalValue(
    account.sessionId,
    revenueItem,
    growthItem,
  );
  const segments = classifyPortfolioSegments({
    account,
    expansionItem,
    growthItem,
    revenueItem,
    baseRenewalValue,
  });
  const primarySegment = resolvePrimarySegment(segments);
  const expansionPotential =
    expansionItem?.expansionOpportunity ??
    growthItem?.expansionPotential ??
    Math.round(baseRenewalValue * 0.1);
  const expectedValue = computeWeightedValue(
    baseRenewalValue,
    account.scores.renewalLikelihood,
  );

  const row: PortfolioAccountRow = {
    sessionId: account.sessionId,
    releasePackageId: account.releasePackageId,
    projectName: account.projectName,
    segments,
    primarySegment,
    segmentHealthScore: account.scores.accountHealthScore,
    expansionPotential,
    churnExposure: 0,
    expectedValue,
    rankScore: 0,
    rankPosition: 0,
    nextAction:
      expansionItem?.nextAction ??
      growthItem?.nextAction ??
      SEGMENT_NEXT_ACTIONS[primarySegment],
    actionBadge: resolveActionBadge(primarySegment),
    riskScore: account.scores.riskScore,
    renewalLikelihood: account.scores.renewalLikelihood,
    daysUntilRenewal: account.forecast.daysUntilRenewal,
    account,
    expansionItem,
    growthItem,
    revenueItem,
    readOnly: true,
  };

  row.churnExposure = computeChurnExposure(row);
  return row;
}

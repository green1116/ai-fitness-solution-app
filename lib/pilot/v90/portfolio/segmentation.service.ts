/**
 * V90 — Portfolio segmentation (read from expansion / growth / revenue / health)
 */

import type { AccountHealthRow } from "@/lib/pilot/v85";
import { resolveExpectedRenewalValue, type RevenueQueueItem } from "@/lib/pilot/v87";
import { isHighValueAccount, type GrowthPlanningQueueItem } from "@/lib/pilot/v88";
import type { ExpansionQueueItem } from "@/lib/pilot/v89";

import type { PortfolioSegment } from "./portfolio.types";

const ENTERPRISE_THRESHOLD = 60_000;

export function classifyPortfolioSegments(input: {
  account: AccountHealthRow;
  expansionItem: ExpansionQueueItem | null;
  growthItem: GrowthPlanningQueueItem | null;
  revenueItem: RevenueQueueItem | null;
  baseRenewalValue: number;
}): PortfolioSegment[] {
  const { account, expansionItem, growthItem, revenueItem, baseRenewalValue } = input;
  const segments: PortfolioSegment[] = [];

  if (baseRenewalValue >= ENTERPRISE_THRESHOLD) segments.push("enterprise");
  else if (isHighValueAccount(baseRenewalValue)) segments.push("high_value");

  if (
    account.forecast.category === "at_risk" ||
    account.scores.riskScore >= 65 ||
    revenueItem?.revenueQueue === "at_risk"
  ) {
    segments.push("at_risk");
  }

  if (
    expansionItem?.expansionQueue === "expansion_target" ||
    growthItem?.planningQueue === "expansion_target" ||
    (account.scores.renewalLikelihood >= 65 && (growthItem?.expansionPotential ?? 0) > 3000)
  ) {
    segments.push("expansion_ready");
  }

  if (account.scores.engagementScore >= 50) {
    segments.push("active");
  } else if (account.scores.engagementScore < 40) {
    segments.push("dormant");
  }

  if (
    expansionItem?.expansionQueue === "churn_rescue" ||
    revenueItem?.revenueQueue === "churn_risk" ||
    revenueItem?.revenueQueue === "at_risk"
  ) {
    segments.push("churn_rescue");
  }

  if (account.scores.accountHealthScore >= 60 && account.signedOffAt) {
    segments.push("release_ready");
  }

  if (
    account.followUp.status === "pending" ||
    account.followUp.status === "in_progress" ||
    account.forecast.category === "needs_outreach" ||
    account.forecast.outreachRecommended
  ) {
    segments.push("follow_up_needed");
  }

  if (segments.length === 0) segments.push("active");

  return [...new Set(segments)];
}

const PRIMARY_PRIORITY: PortfolioSegment[] = [
  "churn_rescue",
  "at_risk",
  "expansion_ready",
  "enterprise",
  "high_value",
  "follow_up_needed",
  "dormant",
  "active",
  "release_ready",
];

export function resolvePrimarySegment(segments: PortfolioSegment[]): PortfolioSegment {
  for (const seg of PRIMARY_PRIORITY) {
    if (segments.includes(seg)) return seg;
  }
  return segments[0] ?? "active";
}

export function resolveBaseRenewalValue(
  sessionId: string,
  revenueItem: RevenueQueueItem | null,
  growthItem: GrowthPlanningQueueItem | null,
): number {
  return (
    revenueItem?.expectedRenewalValue ??
    growthItem?.baseRenewalValue ??
    resolveExpectedRenewalValue(sessionId)
  );
}

/**
 * V64 P3 — User revenue segment engine
 */

import type { RevenueSegment } from "../revenue.types";
import { predictLTV } from "../ltv/ltv.predictor";
import { aggregateRevenueMetrics } from "../core/revenue.context";
import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";

export type UserRevenueProfile = {
  userId?: string;
  organizationId?: string;
  segment: RevenueSegment;
  score: number;
  signals: string[];
};

export function scoreUserValue(input: {
  userId?: string;
  organizationId?: string;
  plan?: string;
}): UserRevenueProfile {
  const events = getGrowthEventsSnapshot();
  const metrics = aggregateRevenueMetrics();
  const ltv = predictLTV(input);
  const signals: string[] = [];
  let score = 0;

  const userEvents = events.filter(
    (e) =>
      (input.userId && e.userId === input.userId) ||
      (input.organizationId && e.organizationId === input.organizationId),
  );

  const quotes = userEvents.filter((e) => e.event === "quote.generated").length;
  const tenders = userEvents.filter((e) => e.event === "tender.generated").length;
  const payments = userEvents.filter((e) => e.event === "payment.completed").length;

  score += quotes * 5;
  score += tenders * 15;
  score += payments * 50;
  score += Math.min(ltv.predictedLtv / 10, 100);

  if (input.plan === "ENTERPRISE") {
    score += 80;
    signals.push("Enterprise plan");
  } else if (input.plan === "PRO") {
    score += 40;
    signals.push("Pro plan");
  }

  if (tenders > 0) signals.push("Tender usage");
  if (quotes > 5) signals.push("High quote volume");

  let segment: RevenueSegment = "LOW_VALUE";
  if (score >= 120 || input.plan === "ENTERPRISE") segment = "ENTERPRISE_VALUE";
  else if (score >= 70) segment = "HIGH_VALUE";
  else if (score >= 30) segment = "MID_VALUE";

  if (metrics.mrr === 0 && payments === 0) segment = "LOW_VALUE";

  return { ...input, segment, score, signals };
}

export function segmentHighValueUsers(limit = 10): UserRevenueProfile[] {
  const events = getGrowthEventsSnapshot();
  const orgIds = [
    ...new Set(events.map((e) => e.organizationId).filter(Boolean) as string[]),
  ];
  const userIds = [...new Set(events.map((e) => e.userId).filter(Boolean) as string[])];

  const profiles: UserRevenueProfile[] = [];

  for (const orgId of orgIds.slice(0, limit)) {
    profiles.push(scoreUserValue({ organizationId: orgId }));
  }
  for (const userId of userIds.slice(0, limit)) {
    if (!profiles.some((p) => p.userId === userId)) {
      profiles.push(scoreUserValue({ userId }));
    }
  }

  return profiles
    .filter((p) => p.segment === "HIGH_VALUE" || p.segment === "ENTERPRISE_VALUE")
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

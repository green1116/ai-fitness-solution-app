/**
 * V62 P1 — Revenue analyzer
 */

import type { BusinessContext } from "../core/decision.types";
import { DECISION_THRESHOLDS } from "../core/decision.types";
import { analyzeRevenue } from "@/lib/dashboard/analytics/revenue.analytics";

export function analyzeRevenueState(context: BusinessContext) {
  const revenue = analyzeRevenue();
  const insights: string[] = [];
  const leaks: string[] = [];

  if (context.mrr <= DECISION_THRESHOLDS.mrrStagnationDelta && context.activeUsers > 0) {
    insights.push("MRR appears stagnant relative to active user count");
  }

  if (revenue.usageRevenue < revenue.mrr * 0.1 && revenue.mrr > 0) {
    leaks.push("Under-monetized usage revenue vs subscription MRR");
  }

  const enterpriseShare =
    revenue.totalRevenue > 0 ? revenue.enterpriseRevenue / revenue.totalRevenue : 0;
  if (enterpriseShare < 0.2 && context.mrr > 500) {
    insights.push("Enterprise tier underrepresented — upsell opportunity");
  }

  return {
    mrr: context.mrr,
    arr: context.arr,
    totalRevenue: revenue.totalRevenue,
    subscriptionBreakdown: revenue.subscriptionBreakdown,
    insights,
    leaks,
    isStagnating: context.mrr <= DECISION_THRESHOLDS.mrrStagnationDelta && context.activeUsers > 5,
  };
}

export function detectRevenueLeaks(context: BusinessContext): string[] {
  const state = analyzeRevenueState(context);
  const leaks = [...state.leaks];

  if (context.churnRate > 10) {
    leaks.push(`Churn-driven revenue leak (~${context.churnRate}% monthly)`);
  }
  if (context.conversionRate < DECISION_THRESHOLDS.conversionRateLow) {
    leaks.push("Conversion gap between acquisition and monetization");
  }

  return leaks;
}

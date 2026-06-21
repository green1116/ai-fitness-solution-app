/**
 * V62 P1 — Growth analyzer
 */

import type { BusinessContext } from "../core/decision.types";
import { DECISION_THRESHOLDS } from "../core/decision.types";
import { analyzeGrowth } from "@/lib/dashboard/analytics/growth.analytics";

export function analyzeGrowthState(context: BusinessContext) {
  const growth = analyzeGrowth();
  const bottlenecks: string[] = [];

  if (context.churnRate > DECISION_THRESHOLDS.churnRateHigh) {
    bottlenecks.push("retention");
  }
  if (context.conversionRate < DECISION_THRESHOLDS.conversionRateLow) {
    bottlenecks.push("conversion");
  }
  if (growth.activationRate < 50 && growth.metrics.signups > 0) {
    bottlenecks.push("activation");
  }
  if (growth.visitorToSignup < 20) {
    bottlenecks.push("acquisition");
  }

  return {
    funnel: growth.funnel,
    activationRate: growth.activationRate,
    visitorToSignup: growth.visitorToSignup,
    retentionRate: growth.metrics.retentionRate,
    bottlenecks,
    trends: growth.trends,
  };
}

export function detectGrowthBottlenecks(context: BusinessContext): string[] {
  const state = analyzeGrowthState(context);
  return state.bottlenecks.map((b) => `Growth bottleneck: ${b}`);
}

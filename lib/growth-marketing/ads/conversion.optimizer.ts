/**
 * V65 — Ads conversion optimizer
 */

import { computeDynamicThresholds } from "../growth-marketing.types";
import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";
import { deriveSignupRate } from "../growth-metrics.util";

export function optimizeAdsConversion(): string[] {
  const metrics = aggregateGrowthMetrics();
  const signupRate = deriveSignupRate(metrics);
  const thresholds = computeDynamicThresholds({
    visitors: metrics.visitors,
    signups: metrics.signups,
    conversionRate: signupRate,
  });

  const tactics: string[] = [];
  if (signupRate < thresholds.conversionRateLow) {
    tactics.push("Align ad landing page with demo CTA above fold");
    tactics.push("Add social proof to paid landing variant");
  }
  tactics.push("Sync UTM params with V64 funnel tracking");
  return tactics;
}

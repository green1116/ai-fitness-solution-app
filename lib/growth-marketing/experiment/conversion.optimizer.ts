/**
 * V65 — Experiment conversion optimizer
 */

import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";
import { computeDynamicThresholds } from "../growth-marketing.types";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";
import { deriveSignupRate } from "../growth-metrics.util";

export function optimizeExperimentConversion(): string[] {
  const metrics = aggregateGrowthMetrics();
  const signupRate = deriveSignupRate(metrics);
  const thresholds = computeDynamicThresholds({
    visitors: metrics.visitors,
    signups: metrics.signups,
    conversionRate: signupRate,
  });

  const tactics: string[] = [];
  if (signupRate < thresholds.conversionRateLow) {
    tactics.push("Run pricing page clarity experiment (read-only, no billing mutation)");
  }
  const pro = getPricingTier("PRO");
  tactics.push(`Highlight ${pro.label} tier in experiment variant: ${pro.headline}`);
  tactics.push("Measure demo-to-signup rate as primary experiment KPI");
  return tactics;
}

export function runPricingExperiments(): string[] {
  return [
    "A/B test annual vs monthly framing on /pricing",
    "Test PRO highlight vs ENTERPRISE highlight",
    ...optimizeExperimentConversion(),
  ];
}

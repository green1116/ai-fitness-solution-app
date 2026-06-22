/**
 * V64 P3 — Pricing optimizer
 */

import { runDynamicPricingEngine } from "./dynamic.pricing.engine";
import { aggregateRevenueMetrics, countPaidUsersByPlan } from "../core/revenue.context";
import { computeRevenueThresholds } from "../revenue.types";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";
import type { SaasPlan } from "@/lib/saas/types";

export function optimizePricingStrategy(): {
  recommendations: ReturnType<typeof runDynamicPricingEngine>["recommendations"];
  actions: string[];
  optimizations: string[];
} {
  const engine = runDynamicPricingEngine();
  const metrics = aggregateRevenueMetrics();
  const thresholds = computeRevenueThresholds(metrics);
  const optimizations: string[] = [];

  optimizations.push("Optimize Basic / Pro / Enterprise tier feature binding");
  optimizations.push("Adjust free-tier boundary based on conversion metrics");

  if (metrics.arpu < thresholds.arpuLow) {
    optimizations.push("Increase upsell pressure on Budget and PDF gates");
  }

  for (const rec of engine.recommendations) {
    if (rec.adjustmentPct !== 0) {
      optimizations.push(`${rec.plan}: ${rec.rationale}`);
    }
  }

  return {
    recommendations: engine.recommendations,
    actions: engine.actions,
    optimizations,
  };
}

export function optimizeSubscriptionPlan(): {
  recommendedPlan: SaasPlan;
  rationale: string;
  actions: string[];
} {
  const metrics = aggregateRevenueMetrics();
  const thresholds = computeRevenueThresholds(metrics);
  const mix = countPaidUsersByPlan();
  const actions: string[] = [];

  let recommendedPlan: SaasPlan = "PRO";
  let rationale = "Pro offers best ARPU / conversion balance";

  if (mix.ENTERPRISE > mix.PRO && mix.ENTERPRISE > 0) {
    recommendedPlan = "ENTERPRISE";
    rationale = "Enterprise mix dominant — expand enterprise packaging";
  } else if (metrics.arpu < thresholds.arpuLow) {
    recommendedPlan = "PRO";
    rationale = "ARPU below target — push Pro as default upgrade path";
    actions.push("Highlight Pro on pricing page and post-demo upsell");
  }

  const tier = getPricingTier(recommendedPlan);
  actions.push(`Default upgrade target: ${tier.label} — ${tier.headline}`);

  if (mix.BASIC > mix.PRO * 2) {
    actions.push("Basic-heavy base — accelerate Basic → Pro migration");
  }

  return { recommendedPlan, rationale, actions };
}

/**
 * V64 P3 — Dynamic pricing engine
 */

import type { SaasPlan } from "@/lib/saas/types";
import { aggregateRevenueMetrics } from "../core/revenue.context";
import { computeRevenueThresholds } from "../revenue.types";
import { computePlanPriceAdjustment, buildRevenuePricingStrategy } from "./pricing.strategy";

export function runDynamicPricingEngine(): {
  recommendations: ReturnType<typeof computePlanPriceAdjustment>[];
  strategy: ReturnType<typeof buildRevenuePricingStrategy>;
  actions: string[];
} {
  const metrics = aggregateRevenueMetrics();
  const thresholds = computeRevenueThresholds(metrics);
  const plans: SaasPlan[] = ["BASIC", "PRO", "ENTERPRISE"];
  const recommendations = plans.map((p) => computePlanPriceAdjustment(p));
  const strategy = buildRevenuePricingStrategy();
  const actions: string[] = [];

  if (metrics.arpu < thresholds.arpuLow) {
    actions.push("adjustPricing: review Pro bundle vs Basic gap");
    const pro = recommendations.find((r) => r.plan === "PRO");
    if (pro && pro.adjustmentPct !== 0) {
      actions.push(`Pro recommendation: ¥${pro.recommendedPriceCny} (${pro.adjustmentPct}%)`);
    }
  }

  actions.push(`Free boundary: ${strategy.freeTierBoundary.join(", ")}`);
  return { recommendations, strategy, actions };
}

export function optimizeDynamicPricing(): string[] {
  return runDynamicPricingEngine().actions;
}

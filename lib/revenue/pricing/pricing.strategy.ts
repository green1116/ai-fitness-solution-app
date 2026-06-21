/**
 * V64 P3 — Revenue pricing strategy (metrics-driven recommendations — no billing mutation)
 */

import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";
import type { SaasPlan } from "@/lib/saas/types";
import { aggregateRevenueMetrics } from "../core/revenue.context";
import type { PricingRecommendation } from "../revenue.types";

const PLANS: SaasPlan[] = ["BASIC", "PRO", "ENTERPRISE"];

export function buildRevenuePricingStrategy(): {
  tiers: ReturnType<typeof getPricingTier>[];
  featureBinding: Record<SaasPlan, string[]>;
  freeTierBoundary: string[];
} {
  const metrics = aggregateRevenueMetrics();
  const emphasizeUpgrade = metrics.arpu < 350;

  return {
    tiers: PLANS.map((p) => getPricingTier(p)),
    featureBinding: {
      BASIC: ["Quote", "基础方案", "50次/月"],
      PRO: emphasizeUpgrade
        ? ["Quote", "Budget", "PDF", "优先升级推荐"]
        : ["Quote", "Budget", "PDF", "500次/月"],
      ENTERPRISE: ["Tender", "API", "无限用量", "企业支持"],
    },
    freeTierBoundary: ["Demo预览", "Landing访问", "单次Quote预览"],
  };
}

export function computePlanPriceAdjustment(plan: SaasPlan): PricingRecommendation {
  const tier = getPricingTier(plan);
  const metrics = aggregateRevenueMetrics();
  const current = tier.monthlyPriceCny;

  let adjustmentPct = 0;
  let rationale = "Maintain current price — metrics within target";

  if (metrics.arpu < 250 && plan === "BASIC") {
    adjustmentPct = metrics.conversionRate < 8 ? -5 : 8;
    rationale = "ARPU low — test price elasticity on entry tier";
  } else if (metrics.upgradeRate < 10 && plan === "PRO") {
    adjustmentPct = -8;
    rationale = "Upgrade rate low — bundle value at lower Pro anchor";
  } else if (metrics.ltv > 1200 && plan === "ENTERPRISE") {
    adjustmentPct = 10;
    rationale = "High LTV segment — enterprise price headroom";
  }

  const recommendedPriceCny = Math.round(current * (1 + adjustmentPct / 100));

  return {
    plan,
    currentPriceCny: current,
    recommendedPriceCny,
    adjustmentPct,
    rationale,
  };
}

/**
 * V64 P3 — Revenue optimization types
 */

import type { SaasPlan } from "@/lib/saas/types";

export type RevenueSegment = "LOW_VALUE" | "MID_VALUE" | "HIGH_VALUE" | "ENTERPRISE_VALUE";

export type RevenueMetrics = {
  mrr: number;
  arr: number;
  arpu: number;
  ltv: number;
  conversionRate: number;
  upgradeRate: number;
};

export type RevenueThresholds = {
  ltvLow: number;
  arpuLow: number;
  upgradeRateLow: number;
  enterpriseUsageMin: number;
};

export type PricingRecommendation = {
  plan: SaasPlan;
  currentPriceCny: number;
  recommendedPriceCny: number;
  adjustmentPct: number;
  rationale: string;
};

export type UpsellTrigger = {
  id: string;
  fromFeature: string;
  toPlan: SaasPlan;
  message: string;
  priority: number;
};

export type RevenueLoopResult = {
  traceId: string;
  metrics: RevenueMetrics;
  thresholds: RevenueThresholds;
  segments: { segment: RevenueSegment; count: number }[];
  pricingRecommendations: PricingRecommendation[];
  upsellTriggers: UpsellTrigger[];
  crossSellOffers: string[];
  actions: string[];
  optimizations: string[];
  generatedAt: string;
};

export function computeRevenueThresholds(metrics: RevenueMetrics): RevenueThresholds {
  const baseLtv = metrics.mrr > 5000 ? 800 : 400;
  const baseArpu = metrics.mrr > 2000 ? 350 : 199;
  return {
    ltvLow: Math.max(200, baseLtv - 100),
    arpuLow: Math.max(99, baseArpu - 50),
    upgradeRateLow: metrics.conversionRate > 10 ? 8 : 5,
    enterpriseUsageMin: metrics.mrr > 3000 ? 15 : 8,
  };
}

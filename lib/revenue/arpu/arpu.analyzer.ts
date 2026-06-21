/**
 * V64 P3 — ARPU analyzer
 */

import { aggregateRevenueMetrics, countPaidUsersByPlan } from "../core/revenue.context";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";

export function analyzeARPU(): {
  arpu: number;
  mrr: number;
  paidUsers: number;
  planMix: Record<string, number>;
  arpuByPlan: { plan: string; arpu: number; count: number }[];
} {
  const metrics = aggregateRevenueMetrics();
  const planCounts = countPaidUsersByPlan();
  const paidUsers = planCounts.BASIC + planCounts.PRO + planCounts.ENTERPRISE;

  const arpuByPlan = (["BASIC", "PRO", "ENTERPRISE"] as const).map((plan) => ({
    plan,
    count: planCounts[plan],
    arpu: planCounts[plan] > 0 ? getPricingTier(plan).monthlyPriceCny : 0,
  }));

  return {
    arpu: metrics.arpu,
    mrr: metrics.mrr,
    paidUsers,
    planMix: planCounts,
    arpuByPlan,
  };
}

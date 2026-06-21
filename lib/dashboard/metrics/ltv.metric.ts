/**
 * V61 P2 — LTV & CAC metrics
 */

import { computeMRR } from "./mrr.metric";
import { computeChurnRateMetric } from "./churn.metric";
import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";

export function computeLTV(avgRevenuePerUser?: number, churnRate?: number): number {
  const mrr = computeMRR();
  const growth = aggregateGrowthMetrics();
  const paidUsers = Math.max(growth.paidUsers, 1);
  const arpu = avgRevenuePerUser ?? Math.round(mrr / paidUsers);
  const churn = (churnRate ?? computeChurnRateMetric()) / 100;
  if (churn <= 0) return arpu * 24;
  return Math.round(arpu / churn);
}

export function computeCAC(marketingSpend = 5000): number {
  const growth = aggregateGrowthMetrics();
  const signups = Math.max(growth.signups, 1);
  return Math.round(marketingSpend / signups);
}

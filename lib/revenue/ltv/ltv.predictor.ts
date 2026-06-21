/**
 * V64 P3 — LTV predictor
 */

import { aggregateRevenueMetrics } from "../core/revenue.context";
import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";

export function predictLTV(input?: { userId?: string; organizationId?: string }): {
  predictedLtv: number;
  arpu: number;
  expectedLifetimeMonths: number;
  retentionFactor: number;
  confidence: "low" | "medium" | "high";
} {
  const metrics = aggregateRevenueMetrics();
  const growth = aggregateGrowthMetrics();
  const retentionFactor = Math.max(0.1, growth.retentionRate / 100);
  const churn = Math.max(0.01, growth.churnRate / 100);
  const expectedLifetimeMonths = Math.round(1 / churn);
  const arpu = metrics.arpu || 199;

  let predictedLtv = Math.round(arpu * expectedLifetimeMonths * retentionFactor);
  if (metrics.ltv > 0) {
    predictedLtv = Math.round((predictedLtv + metrics.ltv) / 2);
  }

  const confidence: "low" | "medium" | "high" =
    growth.paidUsers >= 10 ? "high" : growth.paidUsers >= 3 ? "medium" : "low";

  if (input?.organizationId && growth.paidUsers > 0) {
    predictedLtv = Math.round(predictedLtv * 1.05);
  }

  return {
    predictedLtv,
    arpu,
    expectedLifetimeMonths,
    retentionFactor,
    confidence,
  };
}

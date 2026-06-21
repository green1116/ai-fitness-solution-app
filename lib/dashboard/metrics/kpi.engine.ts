/**
 * V61 P2 — KPI engine (aggregates all core metrics)
 */

import type { EnterpriseDashboardMetrics } from "../dashboard.types";
import { computeMRR } from "../metrics/mrr.metric";
import { computeARR } from "../metrics/arr.metric";
import { computeChurnRateMetric } from "../metrics/churn.metric";
import { computeLTV, computeCAC } from "../metrics/ltv.metric";
import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";

export function buildEnterpriseDashboardMetrics(): EnterpriseDashboardMetrics {
  const growth = aggregateGrowthMetrics();
  const mrr = computeMRR();
  const churnRate = computeChurnRateMetric();
  const conversionRate =
    growth.visitors > 0 ? Math.round((growth.paidUsers / growth.visitors) * 100) : 0;

  return {
    mrr,
    arr: computeARR(mrr),
    activeUsers: Math.max(growth.activatedUsers, growth.signups),
    churnRate,
    conversionRate,
    ltv: computeLTV(undefined, churnRate),
    cac: computeCAC(),
  };
}

export function createEmptyEnterpriseMetrics(): EnterpriseDashboardMetrics {
  return {
    mrr: 0,
    arr: 0,
    activeUsers: 0,
    churnRate: 0,
    conversionRate: 0,
    ltv: 0,
    cac: 0,
  };
}

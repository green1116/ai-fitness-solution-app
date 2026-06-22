/**
 * V62 P1 — Business context builder (from V61 dashboard + V60 systems)
 */

import type { BusinessContext } from "./decision.types";
import { buildEnterpriseDashboardMetrics } from "@/lib/dashboard/metrics/kpi.engine";
import { analyzeRevenue } from "@/lib/dashboard/analytics/revenue.analytics";
import { analyzeGrowth } from "@/lib/dashboard/analytics/growth.analytics";
import { analyzeSales } from "@/lib/dashboard/analytics/sales.analytics";

export function createEmptyBusinessContext(): BusinessContext {
  return {
    mrr: 0,
    arr: 0,
    churnRate: 0,
    conversionRate: 0,
    leadCount: 0,
    dealCount: 0,
    activeUsers: 0,
    revenue: 0,
  };
}

export function buildBusinessContext(organizationId: string): BusinessContext {
  const metrics = buildEnterpriseDashboardMetrics();
  const revenue = analyzeRevenue();
  const growth = analyzeGrowth();
  const sales = analyzeSales(organizationId);

  const leadCount = growth.metrics.signups + sales.signals.quoteGenerations;
  const dealCount = sales.pipeline.hotDeals + growth.metrics.paidUsers;

  return {
    mrr: metrics.mrr,
    arr: metrics.arr,
    churnRate: metrics.churnRate,
    conversionRate: metrics.conversionRate,
    leadCount,
    dealCount,
    activeUsers: metrics.activeUsers,
    revenue: revenue.totalRevenue,
  };
}

export function mergeBusinessContext(
  base: BusinessContext,
  patch: Partial<BusinessContext>,
): BusinessContext {
  return { ...base, ...patch };
}

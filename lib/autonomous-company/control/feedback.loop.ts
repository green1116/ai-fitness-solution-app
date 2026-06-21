/**
 * V62 P3 — Control: feedback loop (V60/V59/V61 → V62 P1 brain)
 */

import type { CompanyState } from "../core/company.state";
import { buildEnterpriseDashboardMetrics } from "@/lib/dashboard/metrics/kpi.engine";
import { analyzeGrowth } from "@/lib/dashboard/analytics/growth.analytics";
import { analyzeRevenue } from "@/lib/dashboard/analytics/revenue.analytics";
import { analyzeSales } from "@/lib/dashboard/analytics/sales.analytics";
import { emitKpiStreamUpdate } from "@/lib/dashboard/realtime/dashboard.stream";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";

export type FeedbackSnapshot = {
  dashboard: ReturnType<typeof buildEnterpriseDashboardMetrics>;
  growth: ReturnType<typeof analyzeGrowth>;
  revenue: ReturnType<typeof analyzeRevenue>;
  sales: ReturnType<typeof analyzeSales>;
  ingestedAt: string;
};

export function ingestBusinessFeedback(organizationId: string): FeedbackSnapshot {
  return {
    dashboard: buildEnterpriseDashboardMetrics(),
    growth: analyzeGrowth(),
    revenue: analyzeRevenue(),
    sales: analyzeSales(organizationId),
    ingestedAt: new Date().toISOString(),
  };
}

export function publishFeedbackLoop(state: CompanyState, feedback: FeedbackSnapshot): Record<string, number> {
  emitKpiStreamUpdate(state.organizationId);

  appendGrowthEvent({
    event: "autonomous.feedback_loop",
    organizationId: state.organizationId,
    meta: {
      traceId: state.traceId,
      mrr: feedback.dashboard.mrr,
      churn: feedback.dashboard.churnRate,
      conversion: feedback.dashboard.conversionRate,
    },
  });

  return {
    mrr: feedback.dashboard.mrr,
    arr: feedback.dashboard.arr,
    churnRate: feedback.dashboard.churnRate,
    conversionRate: feedback.dashboard.conversionRate,
    activeUsers: feedback.dashboard.activeUsers,
    revenue: feedback.revenue.totalRevenue,
    signups: feedback.growth.metrics.signups,
    hotDeals: feedback.sales.pipeline.hotDeals,
  };
}

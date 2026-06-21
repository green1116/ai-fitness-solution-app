/**
 * V61 P2 — Enterprise dashboard service (single aggregation entry)
 */

export { buildEnterpriseDashboardMetrics, createEmptyEnterpriseMetrics } from "./metrics/kpi.engine";
export { analyzeRevenue, analyzeRevenueForOrganization } from "./analytics/revenue.analytics";
export { analyzeGrowth } from "./analytics/growth.analytics";
export { analyzeSales } from "./analytics/sales.analytics";
export { analyzeCustomers, analyzeCustomersFromEvents } from "./analytics/customer.analytics";
export { analyzeOperations } from "./analytics/operations.analytics";
export { buildKpiWidgets } from "./widgets/kpi.widget";
export { buildRevenueChartSeries, buildTrendChartSeries } from "./widgets/chart.widget";
export { buildFunnelWidget, buildSalesFunnelWidget } from "./widgets/funnel.widget";
export { refreshDashboardData, autoRefreshKPIs } from "./realtime/dashboard.updater";
export {
  getDashboardStreamEvents,
  emitKpiStreamUpdate,
  clearDashboardStreamForTests,
} from "./realtime/dashboard.stream";
export {
  enforceDashboardAccess,
  canAccessDashboardView,
  resolveAllowedViews,
  DashboardAccessError,
} from "./dashboard.access";
export type { EnterpriseDashboardMetrics, DashboardView, DashboardSnapshot } from "./dashboard.types";

import { refreshDashboardData } from "./realtime/dashboard.updater";
import type { DashboardView } from "./dashboard.types";
import { enforceDashboardAccess } from "./dashboard.access";
import type { OrgRole } from "@/lib/organization/role.service";

export async function buildDashboardView(
  view: DashboardView,
  organizationId: string,
  role: OrgRole,
) {
  enforceDashboardAccess(role, view);
  const data = refreshDashboardData(organizationId);

  switch (view) {
    case "overview":
      return { view, kpis: data.kpis, metrics: data.metrics, funnel: data.funnelWidget };
    case "revenue":
      return { view, revenue: data.revenue, chart: data.revenue.subscriptionBreakdown };
    case "customers":
      return { view, customers: await import("./analytics/customer.analytics").then((m) => m.analyzeCustomers(organizationId)) };
    case "sales":
      return { view, sales: data.sales };
    case "growth":
      return { view, growth: data.growth, funnel: data.funnelWidget };
    case "operations":
      return { view, operations: data.operations };
    default:
      return { view, data };
  }
}

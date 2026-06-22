/**
 * V61 P2 — Dashboard auto-refresh updater (event-driven from V60 systems)
 */

import { analyzeGrowth } from "../analytics/growth.analytics";
import { analyzeRevenue } from "../analytics/revenue.analytics";
import { analyzeSales } from "../analytics/sales.analytics";
import { buildEnterpriseDashboardMetrics } from "../metrics/kpi.engine";
import { buildKpiWidgets } from "../widgets/kpi.widget";
import { buildFunnelWidget } from "../widgets/funnel.widget";
import {
  emitFunnelStreamUpdate,
  emitHealthStreamUpdate,
  emitKpiStreamUpdate,
} from "./dashboard.stream";
import { analyzeOperations } from "../analytics/operations.analytics";

export type DashboardRefreshPayload = {
  metrics: ReturnType<typeof buildEnterpriseDashboardMetrics>;
  kpis: ReturnType<typeof buildKpiWidgets>;
  growth: ReturnType<typeof analyzeGrowth>;
  revenue: ReturnType<typeof analyzeRevenue>;
  sales: ReturnType<typeof analyzeSales>;
  operations: ReturnType<typeof analyzeOperations>;
  funnelWidget: ReturnType<typeof buildFunnelWidget>;
  refreshedAt: string;
};

export function refreshDashboardData(organizationId: string): DashboardRefreshPayload {
  const metrics = buildEnterpriseDashboardMetrics();
  const growth = analyzeGrowth();
  const revenue = analyzeRevenue();
  const sales = analyzeSales(organizationId);
  const operations = analyzeOperations();

  emitKpiStreamUpdate(organizationId);
  emitFunnelStreamUpdate();
  emitHealthStreamUpdate();

  return {
    metrics,
    kpis: buildKpiWidgets(metrics),
    growth,
    revenue,
    sales,
    operations,
    funnelWidget: buildFunnelWidget(growth.funnel),
    refreshedAt: new Date().toISOString(),
  };
}

export async function autoRefreshKPIs(organizationId: string) {
  return refreshDashboardData(organizationId);
}

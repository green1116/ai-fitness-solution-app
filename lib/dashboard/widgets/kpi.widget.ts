/**
 * V61 P2 — KPI widget builder
 */

import type { EnterpriseDashboardMetrics } from "../dashboard.types";
import { buildEnterpriseDashboardMetrics } from "../metrics/kpi.engine";

export type KpiWidget = {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: "up" | "down" | "flat";
};

export function buildKpiWidgets(metrics?: EnterpriseDashboardMetrics): KpiWidget[] {
  const m = metrics ?? buildEnterpriseDashboardMetrics();
  return [
    { id: "mrr", label: "MRR", value: m.mrr, unit: "USD", trend: m.mrr > 0 ? "up" : "flat" },
    { id: "arr", label: "ARR", value: m.arr, unit: "USD", trend: m.arr > 0 ? "up" : "flat" },
    { id: "active_users", label: "Active Users", value: m.activeUsers, trend: "up" },
    { id: "conversion", label: "Conversion Rate", value: m.conversionRate, unit: "%" },
    { id: "churn", label: "Churn Rate", value: m.churnRate, unit: "%", trend: m.churnRate > 20 ? "down" : "flat" },
    { id: "ltv", label: "LTV", value: m.ltv, unit: "USD" },
    { id: "cac", label: "CAC", value: m.cac, unit: "USD" },
  ];
}

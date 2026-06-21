/**
 * V61 P2 — Enterprise dashboard metric types
 */

export interface EnterpriseDashboardMetrics {
  mrr: number;
  arr: number;
  activeUsers: number;
  churnRate: number;
  conversionRate: number;
  ltv: number;
  cac: number;
}

export type DashboardView =
  | "overview"
  | "revenue"
  | "customers"
  | "sales"
  | "growth"
  | "operations";

export type DashboardStreamEvent = {
  type: "kpi_update" | "funnel_update" | "health_update";
  timestamp: string;
  payload: Record<string, unknown>;
};

export type DashboardSnapshot = {
  metrics: EnterpriseDashboardMetrics;
  generatedAt: string;
  organizationId: string;
  traceId?: string;
};

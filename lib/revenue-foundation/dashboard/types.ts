import type { REVENUE_FOUNDATION_VERSION } from "../shared/types";

export const REVENUE_DASHBOARD_RUNTIME_VERSION = "v10.0-revenue-dashboard-runtime-1" as const;

export interface RevenueDashboardMetrics {
  metricsId: string;
  mrr: number;
  arr: number;
  activeCustomers: number;
  trialConversionRate: number;
  revenueGrowthRate: number;
  currency: string;
}

export interface RevenueDashboardRuntimePayload {
  version: typeof REVENUE_DASHBOARD_RUNTIME_VERSION;
  foundationVersion: typeof REVENUE_FOUNDATION_VERSION;
  metrics: RevenueDashboardMetrics;
  summary: string;
}

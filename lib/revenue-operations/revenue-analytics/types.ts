import type { REVENUE_OPERATIONS_VERSION } from "../shared/types";

export const REVENUE_ANALYTICS_RUNTIME_VERSION = "v15.0-revenue-analytics-1" as const;

export interface RevenueSnapshot {
  mrrCny: number;
  arrCny: number;
  revenueGrowthPercent: number;
  arpcCny: number;
  customerCount: number;
  asOf: string;
}

export interface RevenueTrendPoint {
  period: string;
  mrrCny: number;
}

export interface RevenueAnalyticsRuntimePayload {
  version: typeof REVENUE_ANALYTICS_RUNTIME_VERSION;
  revOpsVersion: typeof REVENUE_OPERATIONS_VERSION;
  snapshot: RevenueSnapshot;
  trend: RevenueTrendPoint[];
  summary: string;
}

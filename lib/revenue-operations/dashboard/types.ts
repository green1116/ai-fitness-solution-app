import type { REVENUE_OPERATIONS_VERSION } from "../shared/types";

export const REVENUE_OPS_DASHBOARD_RUNTIME_VERSION = "v15.0-revenue-ops-dashboard-1" as const;

export interface RevenueOpsDashboardRuntimePayload {
  version: typeof REVENUE_OPS_DASHBOARD_RUNTIME_VERSION;
  revOpsVersion: typeof REVENUE_OPERATIONS_VERSION;
  pipelineHealth: number;
  conversionHealth: number;
  renewalHealth: number;
  retentionHealth: number;
  revenueHealth: number;
  summary: string;
}

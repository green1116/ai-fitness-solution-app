import type { CUSTOMER_SUCCESS_VERSION } from "../shared/types";

export const CUSTOMER_SUCCESS_DASHBOARD_RUNTIME_VERSION = "v16.0-customer-success-dashboard-1" as const;

export interface CustomerSuccessDashboardRuntimePayload {
  version: typeof CUSTOMER_SUCCESS_DASHBOARD_RUNTIME_VERSION;
  successVersion: typeof CUSTOMER_SUCCESS_VERSION;
  customerHealth: number;
  adoptionHealth: number;
  renewalHealth: number;
  expansionHealth: number;
  summary: string;
}

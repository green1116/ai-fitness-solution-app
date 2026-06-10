import type { CUSTOMER_SUCCESS_VERSION, ReadinessStubMode } from "../shared/types";

export const CUSTOMER_HEALTH_RUNTIME_VERSION = "v16.0-customer-health-1" as const;

export const HEALTH_STATUSES = ["healthy", "warning", "critical"] as const;
export type HealthStatus = (typeof HEALTH_STATUSES)[number];

export interface CustomerHealthScore {
  customerId: string;
  companyName: string;
  usageScore: number;
  engagementScore: number;
  deliveryScore: number;
  renewalScore: number;
  overallScore: number;
  status: HealthStatus;
  mode: ReadinessStubMode;
}

export interface CustomerHealthRuntimePayload {
  version: typeof CUSTOMER_HEALTH_RUNTIME_VERSION;
  successVersion: typeof CUSTOMER_SUCCESS_VERSION;
  customers: CustomerHealthScore[];
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  summary: string;
}

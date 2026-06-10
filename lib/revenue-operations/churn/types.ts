import type { REVENUE_OPERATIONS_VERSION } from "../shared/types";

export const CHURN_RUNTIME_VERSION = "v15.0-churn-runtime-1" as const;

export interface ChurnRecord {
  churnId: string;
  customerId: string;
  companyName: string;
  churnDate: string;
  reason: string;
  lostMrrCny: number;
}

export interface ChurnRuntimePayload {
  version: typeof CHURN_RUNTIME_VERSION;
  revOpsVersion: typeof REVENUE_OPERATIONS_VERSION;
  churnedCustomers: number;
  churnRate: number;
  retentionRate: number;
  churnTrend: "up" | "stable" | "down";
  records: ChurnRecord[];
  summary: string;
}

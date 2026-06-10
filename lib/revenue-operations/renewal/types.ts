import type { REVENUE_OPERATIONS_VERSION } from "../shared/types";

export const RENEWAL_RUNTIME_VERSION = "v15.0-renewal-runtime-1" as const;

export interface RenewalRecord {
  renewalId: string;
  customerId: string;
  companyName: string;
  renewalDate: string;
  status: "upcoming" | "completed" | "at-risk";
  amountCny: number;
  renewalRisk: "low" | "medium" | "high";
}

export interface RenewalRuntimePayload {
  version: typeof RENEWAL_RUNTIME_VERSION;
  revOpsVersion: typeof REVENUE_OPERATIONS_VERSION;
  upcomingRenewals: number;
  completedRenewals: number;
  renewalRate: number;
  renewalReadiness: number;
  renewalRisk: "low" | "medium" | "high";
  records: RenewalRecord[];
  summary: string;
}

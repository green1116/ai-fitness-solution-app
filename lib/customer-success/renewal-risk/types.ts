import type { CUSTOMER_SUCCESS_VERSION } from "../shared/types";

export const RENEWAL_RISK_RUNTIME_VERSION = "v16.0-renewal-risk-1" as const;

export const RENEWAL_RISK_LEVELS = ["low", "medium", "high"] as const;
export type RenewalRiskLevel = (typeof RENEWAL_RISK_LEVELS)[number];

export interface RenewalRiskRecord {
  recordId: string;
  customerId: string;
  companyName: string;
  riskLevel: RenewalRiskLevel;
  riskScore: number;
  drivers: string[];
  renewalDate: string;
}

export interface RenewalRiskRuntimePayload {
  version: typeof RENEWAL_RISK_RUNTIME_VERSION;
  successVersion: typeof CUSTOMER_SUCCESS_VERSION;
  records: RenewalRiskRecord[];
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  summary: string;
}

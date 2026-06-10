import type { REVENUE_OPERATIONS_VERSION, ReadinessStubMode } from "../shared/types";

export const CUSTOMER_RUNTIME_VERSION = "v15.0-customer-runtime-1" as const;

export const CUSTOMER_TIERS = ["trial", "professional", "enterprise"] as const;
export type CustomerTier = (typeof CUSTOMER_TIERS)[number];

export const CUSTOMER_LIFECYCLE_STAGES = [
  "onboarding",
  "active",
  "expanding",
  "at-risk",
  "churned",
] as const;
export type CustomerLifecycleStage = (typeof CUSTOMER_LIFECYCLE_STAGES)[number];

export interface CustomerProfile {
  customerId: string;
  companyName: string;
  tier: CustomerTier;
  lifecycleStage: CustomerLifecycleStage;
  mrrCny: number;
  mode: ReadinessStubMode;
}

export interface CustomerRuntimePayload {
  version: typeof CUSTOMER_RUNTIME_VERSION;
  revOpsVersion: typeof REVENUE_OPERATIONS_VERSION;
  customers: CustomerProfile[];
  customerCount: number;
  summary: string;
}

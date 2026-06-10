import type { CUSTOMER_SUCCESS_VERSION, ReadinessStubMode } from "../shared/types";

export const EXPANSION_RUNTIME_VERSION = "v16.0-expansion-runtime-1" as const;

export const EXPANSION_TYPES = ["upgrade", "cross-sell", "enterprise"] as const;
export type ExpansionType = (typeof EXPANSION_TYPES)[number];

export interface ExpansionOpportunity {
  opportunityId: string;
  customerId: string;
  companyName: string;
  type: ExpansionType;
  typeLabel: string;
  estimatedValueCny: number;
  confidence: number;
  mode: ReadinessStubMode;
}

export interface ExpansionRuntimePayload {
  version: typeof EXPANSION_RUNTIME_VERSION;
  successVersion: typeof CUSTOMER_SUCCESS_VERSION;
  opportunities: ExpansionOpportunity[];
  upgradeCount: number;
  crossSellCount: number;
  enterpriseCount: number;
  summary: string;
}

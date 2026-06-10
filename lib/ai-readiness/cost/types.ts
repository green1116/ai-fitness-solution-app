import type { AI_READINESS_VERSION } from "../shared/types";

export const COST_RUNTIME_VERSION = "v11.5-cost-runtime-1" as const;

export interface CostEstimate {
  estimateId: string;
  label: string;
  amountUsd: number;
  currency: string;
  tokenBasis: number;
  mode: "readiness-stub";
}

export interface CostRuntimePayload {
  version: typeof COST_RUNTIME_VERSION;
  readinessVersion: typeof AI_READINESS_VERSION;
  requestCost: CostEstimate;
  proposalCost: CostEstimate;
  monthlyCost: CostEstimate;
  summary: string;
}

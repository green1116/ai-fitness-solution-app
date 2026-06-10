import type { AI_INTEGRATION_VERSION } from "../shared/types";

export const AI_COST_CONTROL_RUNTIME_VERSION = "v13.0-ai-cost-control-1" as const;

export interface CostLimits {
  dailyLimitUsd: number;
  monthlyLimitUsd: number;
  dailyTokenLimit: number;
  monthlyTokenLimit: number;
}

export interface CostUsageSnapshot {
  requestCount: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  withinDailyLimit: boolean;
  withinMonthlyLimit: boolean;
}

export interface AiCostControlRuntimePayload {
  version: typeof AI_COST_CONTROL_RUNTIME_VERSION;
  integrationVersion: typeof AI_INTEGRATION_VERSION;
  limits: CostLimits;
  usage: CostUsageSnapshot;
  summary: string;
}

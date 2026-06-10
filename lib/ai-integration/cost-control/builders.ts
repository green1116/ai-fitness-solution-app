import type { AiGenerationResponse } from "../shared/types";
import type { CostLimits, CostUsageSnapshot } from "./types";

export function resolveCostLimits(): CostLimits {
  return {
    dailyLimitUsd: Number(process.env.AI_DAILY_COST_LIMIT_USD ?? "50"),
    monthlyLimitUsd: Number(process.env.AI_MONTHLY_COST_LIMIT_USD ?? "500"),
    dailyTokenLimit: Number(process.env.AI_DAILY_TOKEN_LIMIT ?? "500000"),
    monthlyTokenLimit: Number(process.env.AI_MONTHLY_TOKEN_LIMIT ?? "5000000"),
  };
}

export function aggregateUsage(responses: AiGenerationResponse[]): CostUsageSnapshot {
  const limits = resolveCostLimits();
  const requestCount = responses.length;
  const promptTokens = responses.reduce((s, r) => s + r.tokenUsage.promptTokens, 0);
  const completionTokens = responses.reduce((s, r) => s + r.tokenUsage.completionTokens, 0);
  const totalTokens = promptTokens + completionTokens;
  const estimatedCostUsd = responses.reduce((s, r) => s + r.tokenUsage.estimatedCostUsd, 0);

  return {
    requestCount,
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCostUsd,
    withinDailyLimit:
      estimatedCostUsd <= limits.dailyLimitUsd && totalTokens <= limits.dailyTokenLimit,
    withinMonthlyLimit:
      estimatedCostUsd <= limits.monthlyLimitUsd && totalTokens <= limits.monthlyTokenLimit,
  };
}

export function checkCostAllowed(usage: CostUsageSnapshot): boolean {
  return usage.withinDailyLimit && usage.withinMonthlyLimit;
}

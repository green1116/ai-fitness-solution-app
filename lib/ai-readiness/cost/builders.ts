import type { CostEstimate } from "./types";

const STUB_RATE_PER_1K = 0.002;

function estimateCost(label: string, tokens: number, deploymentId: string, suffix: string): CostEstimate {
  return {
    estimateId: `cost-${suffix}-${deploymentId}`,
    label,
    amountUsd: Math.round((tokens / 1000) * STUB_RATE_PER_1K * 10000) / 10000,
    currency: "USD",
    tokenBasis: tokens,
    mode: "readiness-stub",
  };
}

export function buildCostEstimates(input?: { deploymentId?: string }): {
  requestCost: CostEstimate;
  proposalCost: CostEstimate;
  monthlyCost: CostEstimate;
} {
  const deploymentId = input?.deploymentId ?? "cost-default";
  return {
    requestCost: estimateCost("单次请求", 1920, deploymentId, "request"),
    proposalCost: estimateCost("完整投标方案", 24_000, deploymentId, "proposal"),
    monthlyCost: estimateCost("月度估算", 480_000, deploymentId, "monthly"),
  };
}

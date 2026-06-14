import type { BidStrategy, BidStrategyInput } from "../../shared/types";

export function buildCostOptimizedBidStrategy(input: BidStrategyInput): BidStrategy {
  const targetWinRate = Math.max(45, input.winProbability - 8);

  return {
    strategyType: "cost-optimized",
    expectedWinRate: targetWinRate,
    pricingAdjustment: "Reduce discount depth — protect margin at list-to-project spread",
    supplierAdjustment: "Consolidate through primary supplier to minimize procurement overhead",
    inventoryAdjustment: "Fulfill from nearest warehouse only — avoid cross-region transfer cost",
    recommendations: [
      "Prioritize profitability over win probability",
      "Hold pricing at project-rate floor without bulk concession",
      "Minimize logistics cost through single-warehouse fulfillment",
      "Accept lower win rate in favor of sustainable margin",
    ],
  };
}

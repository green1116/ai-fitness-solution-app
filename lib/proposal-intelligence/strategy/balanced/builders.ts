import type { BidStrategy, BidStrategyInput } from "../../shared/types";

export function buildBalancedBidStrategy(input: BidStrategyInput): BidStrategy {
  const targetWinRate = Math.min(78, input.winProbability + 3);

  return {
    strategyType: "balanced",
    expectedWinRate: targetWinRate,
    pricingAdjustment: "Apply moderate project discount — balance margin and competitiveness",
    supplierAdjustment: "Qualify secondary supplier while keeping primary lead",
    inventoryAdjustment: "Confirm inventory buffer and replenishment timeline",
    recommendations: [
      "Offer selective pricing concession on high-visibility SKUs",
      "Balance margin targets with competitive positioning",
      "Strengthen supplier redundancy narrative",
      "Align delivery commitments with verified stock levels",
    ],
  };
}

import type { BidStrategy, BidStrategyInput } from "../../shared/types";

export function buildAggressiveBidStrategy(input: BidStrategyInput): BidStrategy {
  const targetWinRate = Math.min(85, input.winProbability + 12);

  return {
    strategyType: "aggressive",
    expectedWinRate: targetWinRate,
    pricingAdjustment: "Additional 3–5% price concession — accept margin reduction to win",
    supplierAdjustment: "Accelerate dual-source qualification and expedite supplier onboarding",
    inventoryAdjustment: "Pre-commit inventory and offer expedited fulfillment guarantee",
    recommendations: [
      "Increase discount depth to outbid regional competitors",
      "Accept lower margin in exchange for strategic account win",
      "Add backup supplier to reduce buyer risk perception",
      "Offer accelerated delivery as competitive differentiator",
    ],
  };
}

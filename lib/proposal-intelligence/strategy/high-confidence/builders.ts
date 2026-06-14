import type { BidStrategy, BidStrategyInput } from "../../shared/types";

export function buildHighConfidenceBidStrategy(input: BidStrategyInput): BidStrategy {
  return {
    strategyType: "high-confidence",
    expectedWinRate: input.winProbability,
    pricingAdjustment: "Hold bulk project price — prioritize win rate over margin expansion",
    supplierAdjustment: "Maintain primary supplier with documented backup contingency",
    inventoryAdjustment: "Reserve in-stock units for tender delivery window",
    recommendations: [
      "Proceed with current competitive pricing posture",
      "Lead with fast delivery and inventory availability",
      "Document supplier backup plan to mitigate concentration risk",
      "Emphasize service coverage strength in proposal narrative",
    ],
  };
}

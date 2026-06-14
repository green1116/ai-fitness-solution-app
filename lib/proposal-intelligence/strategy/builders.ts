import type { BidStrategy, BidStrategyInput } from "../shared/types";
import { buildAggressiveBidStrategy } from "./aggressive/builders";
import { buildBalancedBidStrategy } from "./balanced/builders";
import { buildCostOptimizedBidStrategy } from "./cost-optimized/builders";
import { buildHighConfidenceBidStrategy } from "./high-confidence/builders";

export function selectBidStrategyType(input: BidStrategyInput): BidStrategy["strategyType"] {
  const elevatedRiskCount = input.risks.filter((r) => r.level !== "low").length;

  if (input.winProbability >= 80) {
    return "high-confidence";
  }
  if (input.winProbability >= 65) {
    return "balanced";
  }
  if (input.winProbability >= 50) {
    return "aggressive";
  }
  if (input.proposalScore >= 85 && elevatedRiskCount <= 1) {
    return "cost-optimized";
  }
  return "aggressive";
}

export function buildBidStrategy(input: BidStrategyInput): BidStrategy {
  const strategyType = selectBidStrategyType(input);

  switch (strategyType) {
    case "high-confidence":
      return buildHighConfidenceBidStrategy(input);
    case "balanced":
      return buildBalancedBidStrategy(input);
    case "aggressive":
      return buildAggressiveBidStrategy(input);
    case "cost-optimized":
      return buildCostOptimizedBidStrategy(input);
  }
}

export { buildHighConfidenceBidStrategy } from "./high-confidence/builders";
export { buildBalancedBidStrategy } from "./balanced/builders";
export { buildAggressiveBidStrategy } from "./aggressive/builders";
export { buildCostOptimizedBidStrategy } from "./cost-optimized/builders";

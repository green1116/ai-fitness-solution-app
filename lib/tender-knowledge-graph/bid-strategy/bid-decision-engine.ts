import { generateBidStrategies } from "./bid-strategy-builder";
import { buildBidRecommendation } from "./bid-recommendation";
import { rankBidStrategies } from "./bid-strategy-ranking";
import type { BidDecisionResult } from "./bid-strategy-types";

const cachedDecisions = new Map<string, BidDecisionResult>();

export function runBidDecisionEngine(tenderId: string): BidDecisionResult {
  const cached = cachedDecisions.get(tenderId);
  if (cached) return cached;

  const strategies = generateBidStrategies(tenderId);
  const ranking = rankBidStrategies(tenderId);
  const recommendation = buildBidRecommendation(tenderId);

  const result: BidDecisionResult = {
    decisionId: `tkg-bid-decision-${tenderId}`,
    tenderId,
    recommendation,
    ranking,
    strategies,
    decisionLevel: recommendation.decisionLevel,
    mode: "tender-knowledge-graph",
  };

  cachedDecisions.set(tenderId, result);
  return result;
}

export function decideOptimalBidStrategy(tenderId: string) {
  return runBidDecisionEngine(tenderId).ranking.optimalStrategy;
}

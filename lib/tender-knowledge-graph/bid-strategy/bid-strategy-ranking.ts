import { generateBidStrategies } from "./bid-strategy-builder";
import type { BidStrategyRanking, BidStrategyRankingEntry } from "./bid-strategy-types";

const cachedRankings = new Map<string, BidStrategyRanking>();

export function rankBidStrategies(tenderId: string): BidStrategyRanking {
  const cached = cachedRankings.get(tenderId);
  if (cached) return cached;

  const strategies = generateBidStrategies(tenderId);
  const sorted = [...strategies].sort((a, b) => b.score.totalScore - a.score.totalScore);

  const entries: BidStrategyRankingEntry[] = sorted.map((strategy, index) => ({
    rank: index + 1,
    bidStrategyId: strategy.bidStrategyId,
    strategyKind: strategy.strategyKind,
    totalScore: strategy.score.totalScore,
    decisionLevel: strategy.decisionLevel,
    estimatedWinProbability: strategy.estimatedWinProbability,
  }));

  const ranking: BidStrategyRanking = {
    rankingId: `tkg-bid-ranking-${tenderId}`,
    tenderId,
    entries,
    optimalStrategy: sorted[0]!,
    alternativeStrategies: sorted.slice(1, 4),
    mode: "tender-knowledge-graph",
  };

  cachedRankings.set(tenderId, ranking);
  return ranking;
}

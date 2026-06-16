import { buildTenderOptimizationGaps } from "./optimization-gap";
import { buildTenderStrategyRecommendations } from "./optimization-recommendation";
import { buildTenderStrategyContext } from "./strategy-context";
import type { TenderStrategyRanking, TenderStrategyRankingEntry } from "./optimization-types";

const cachedRankings = new Map<string, TenderStrategyRanking>();

export function rankTenderStrategies(tenderId: string): TenderStrategyRanking {
  const cached = cachedRankings.get(tenderId);
  if (cached) return cached;

  const context = buildTenderStrategyContext(tenderId);
  const recommendations = buildTenderStrategyRecommendations(tenderId);
  const gaps = buildTenderOptimizationGaps(tenderId);

  const sorted = [...recommendations].sort(
    (a, b) => b.scoreBreakdown.strategyScore - a.scoreBreakdown.strategyScore,
  );

  const entries: TenderStrategyRankingEntry[] = sorted.map((rec, index) => ({
    rank: index + 1,
    strategyId: rec.strategyId,
    strategyKind: rec.strategyKind,
    strategyScore: rec.scoreBreakdown.strategyScore,
    estimatedWinProbabilityDelta: rec.estimatedWinProbabilityDelta,
    priority: rec.priority,
  }));

  const topRecommendation = sorted[0]!;
  const secondaryRecommendations = sorted.slice(1, 4);
  const estimatedWinProbabilityDelta = Math.min(
    100 - context.baselineWinProbability,
    sorted.reduce((sum, rec) => sum + rec.estimatedWinProbabilityDelta, 0),
  );

  const ranking: TenderStrategyRanking = {
    rankingId: `tkg-strategy-ranking-${tenderId}`,
    tenderId,
    entries,
    topRecommendation,
    secondaryRecommendations,
    gapSummary: gaps.map((gap) => gap.gapKind).join("|"),
    riskSummary: context.competition.riskSummary,
    estimatedWinProbabilityDelta,
    mode: "tender-knowledge-graph",
  };

  cachedRankings.set(tenderId, ranking);
  return ranking;
}

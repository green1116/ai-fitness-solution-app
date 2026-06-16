import type { TenderStrategyRecommendation } from "./optimization-types";
import { buildStrategyCandidatesForTender } from "./strategy-builder";

const cachedRecommendations = new Map<string, TenderStrategyRecommendation[]>();

export function buildTenderStrategyRecommendations(tenderId: string): TenderStrategyRecommendation[] {
  const cached = cachedRecommendations.get(tenderId);
  if (cached) return cached;

  const recommendations = buildStrategyCandidatesForTender(tenderId).map((candidate) => ({
    strategyId: candidate!.strategyId,
    tenderId: candidate!.tenderId,
    strategyKind: candidate!.strategyKind,
    priority: candidate!.priority,
    title: candidate!.title,
    actionSummary: candidate!.actionSummary,
    estimatedWinProbabilityDelta: candidate!.estimatedWinProbabilityDelta,
    estimatedEffortCost: candidate!.estimatedEffortCost,
    expectedImpact: candidate!.expectedImpact,
    scoreBreakdown: candidate!.scoreBreakdown,
    gapRefs: candidate!.gapRefs,
    riskMitigation: candidate!.riskMitigation,
    mode: candidate!.mode,
  }));

  cachedRecommendations.set(tenderId, recommendations);
  return recommendations;
}

export function findTopTenderStrategyRecommendation(
  tenderId: string,
): TenderStrategyRecommendation | undefined {
  const ranked = [...buildTenderStrategyRecommendations(tenderId)].sort(
    (a, b) => b.scoreBreakdown.strategyScore - a.scoreBreakdown.strategyScore,
  );
  return ranked[0];
}

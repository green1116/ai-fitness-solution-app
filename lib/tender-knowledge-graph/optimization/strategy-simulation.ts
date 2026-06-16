import { buildTenderStrategyRecommendations } from "./optimization-recommendation";
import { buildTenderStrategyContext } from "./strategy-context";
import { estimateWinProbabilityDeltaFromGap } from "./strategy-builder";
import { buildTenderOptimizationGaps } from "./optimization-gap";
import type { TenderSimulationResult } from "./optimization-types";

const cachedSimulations = new Map<string, TenderSimulationResult>();

export function calculateWinProbabilityDelta(tenderId: string): number {
  const context = buildTenderStrategyContext(tenderId);
  const recommendations = buildTenderStrategyRecommendations(tenderId);
  if (recommendations.length === 0) return 0;

  const top = [...recommendations].sort(
    (a, b) => b.scoreBreakdown.strategyScore - a.scoreBreakdown.strategyScore,
  )[0]!;

  return Math.min(100 - context.baselineWinProbability, top.estimatedWinProbabilityDelta);
}

export function simulateTenderStrategy(
  tenderId: string,
  strategyId: string,
): TenderSimulationResult | undefined {
  const cacheKey = `${tenderId}:${strategyId}`;
  const cached = cachedSimulations.get(cacheKey);
  if (cached) return cached;

  const context = buildTenderStrategyContext(tenderId);
  const recommendation = buildTenderStrategyRecommendations(tenderId).find(
    (rec) => rec.strategyId === strategyId,
  );
  if (!recommendation) return undefined;

  const gap = buildTenderOptimizationGaps(tenderId).find((g) =>
    recommendation.gapRefs.includes(g.gapId),
  );
  const { delta, explanation } = gap
    ? estimateWinProbabilityDeltaFromGap(
        gap,
        recommendation.strategyKind,
        context.baselineWinProbability,
      )
    : {
        delta: recommendation.estimatedWinProbabilityDelta,
        explanation: `strategy=${recommendation.strategyKind} estimated uplift`,
      };

  const simulatedWinProbability = Math.min(100, context.baselineWinProbability + delta);

  const result: TenderSimulationResult = {
    simulationId: `tkg-sim-${tenderId}-${strategyId}`,
    tenderId,
    strategyId,
    strategyKind: recommendation.strategyKind,
    baselineWinProbability: context.baselineWinProbability,
    simulatedWinProbability,
    winProbabilityDelta: delta,
    deltaExplanation: explanation,
    strategyScore: recommendation.scoreBreakdown.strategyScore,
    mode: "tender-knowledge-graph",
  };

  cachedSimulations.set(cacheKey, result);
  return result;
}

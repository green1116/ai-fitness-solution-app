import { buildBidStrategyContext } from "./bid-strategy-context";
import { generateBidStrategies } from "./bid-strategy-builder";
import type { BidSimulationResult } from "./bid-strategy-types";

const cachedSimulations = new Map<string, BidSimulationResult>();

export function simulateBidStrategy(
  tenderId: string,
  bidStrategyId: string,
): BidSimulationResult | undefined {
  const cacheKey = `${tenderId}:${bidStrategyId}`;
  const cached = cachedSimulations.get(cacheKey);
  if (cached) return cached;

  const ctx = buildBidStrategyContext(tenderId);
  const strategy = generateBidStrategies(tenderId).find((s) => s.bidStrategyId === bidStrategyId);
  if (!strategy) return undefined;

  const delta = strategy.estimatedWinProbabilityDelta;
  const simulatedWinProbability = Math.min(100, ctx.winProbability.winProbability + delta);

  const result: BidSimulationResult = {
    simulationId: `tkg-bid-sim-${tenderId}-${strategy.strategyKind}`,
    tenderId,
    bidStrategyId,
    strategyKind: strategy.strategyKind,
    baselineWinProbability: ctx.winProbability.winProbability,
    simulatedWinProbability,
    winProbabilityDelta: delta,
    decisionLevel: strategy.decisionLevel,
    deltaExplanation: `bid=${strategy.strategyKind} baseline=${ctx.winProbability.winProbability} uplift=${delta} readiness=${ctx.evidenceReadiness} pressure=${ctx.competitionPressure}`,
    totalScore: strategy.score.totalScore,
    mode: "tender-knowledge-graph",
  };

  cachedSimulations.set(cacheKey, result);
  return result;
}

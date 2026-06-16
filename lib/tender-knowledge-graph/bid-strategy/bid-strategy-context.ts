import { analyzeTenderCompetition } from "../competition/competition-analysis";
import { buildCompetitorBrandNodesForTender } from "../competition/competitor-brand-node";
import { rankTenderStrategies } from "../optimization/strategy-ranking";
import { calculateWinProbability } from "../tender-scoring";
import type { BidStrategyContext } from "./bid-strategy-types";

const cachedContexts = new Map<string, BidStrategyContext>();

function resolveBrandStrength(tenderId: string): number {
  const primary = buildCompetitorBrandNodesForTender(tenderId).find((node) => node.isPrimary);
  if (!primary) return 50;
  return Math.round(primary.brandAdvantage * 0.6 + primary.strengthScore * 0.4);
}

export function buildBidStrategyContext(tenderId: string): BidStrategyContext {
  const cached = cachedContexts.get(tenderId);
  if (cached) return cached;

  const winProbability = calculateWinProbability(tenderId);
  const competition = analyzeTenderCompetition(tenderId);
  const optimizationRanking = rankTenderStrategies(tenderId);

  const context: BidStrategyContext = {
    contextId: `tkg-bid-context-${tenderId}`,
    tenderId,
    winProbability,
    competition,
    optimizationRanking,
    requirementCoverage: winProbability.requirementCoverage,
    evidenceReadiness: winProbability.evidenceReadiness,
    brandStrength: resolveBrandStrength(tenderId),
    competitionPressure: competition.metrics.brandWinPressure,
    optimizationDelta: optimizationRanking.estimatedWinProbabilityDelta,
    contextReady:
      Boolean(competition.dominantCompetitor) &&
      optimizationRanking.entries.length >= 1 &&
      winProbability.winProbability >= 0,
    mode: "tender-knowledge-graph",
  };

  cachedContexts.set(tenderId, context);
  return context;
}

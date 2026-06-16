import { buildBidGapReasoning } from "./bid-gap-reasoning";
import { buildBidStrategyContext } from "./bid-strategy-context";
import { rankBidStrategies } from "./bid-strategy-ranking";
import type { BidRecommendation } from "./bid-strategy-types";

const cachedRecommendations = new Map<string, BidRecommendation>();

function buildCounterBidHints(tenderId: string): string[] {
  const ctx = buildBidStrategyContext(tenderId);
  const hints: string[] = [];

  if (ctx.competitionPressure >= 70) hints.push("counter-high-competition-pressure");
  if (ctx.requirementCoverage < 80) hints.push("close-requirement-gaps-before-bid");
  if (ctx.evidenceReadiness < 70) hints.push("strengthen-evidence-before-aggressive-bid");
  if (ctx.competition.dominantCompetitor) {
    hints.push(`watch-dominant:${ctx.competition.dominantCompetitor.brandId}`);
  }
  return hints.length > 0 ? hints : ["maintain-balanced-bid-posture"];
}

export function buildBidRecommendation(tenderId: string): BidRecommendation {
  const cached = cachedRecommendations.get(tenderId);
  if (cached) return cached;

  const ctx = buildBidStrategyContext(tenderId);
  const ranking = rankBidStrategies(tenderId);
  const optimal = ranking.optimalStrategy;
  const gapReasoning = buildBidGapReasoning(tenderId);

  const recommendation: BidRecommendation = {
    recommendationId: `tkg-bid-recommendation-${tenderId}`,
    tenderId,
    optimalBidStrategy: optimal,
    decisionLevel: optimal.decisionLevel,
    decisionSummary: `${optimal.strategyKind} score=${optimal.score.totalScore} decision=${optimal.decisionLevel}`,
    gapSummary: gapReasoning.map((r) => r.gapKind).join("|"),
    riskSummary: ctx.competition.riskSummary,
    estimatedWinProbability: optimal.estimatedWinProbability,
    estimatedWinProbabilityDelta: optimal.estimatedWinProbabilityDelta,
    counterBidHints: buildCounterBidHints(tenderId),
    mode: "tender-knowledge-graph",
  };

  cachedRecommendations.set(tenderId, recommendation);
  return recommendation;
}

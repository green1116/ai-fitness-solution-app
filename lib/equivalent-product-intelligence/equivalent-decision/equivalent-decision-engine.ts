import { EPI_CANONICAL_ID } from "../shared/constants";
import { buildEquivalentRecommendation } from "./equivalent-recommendation";
import { rankEquivalentCandidates } from "./equivalent-ranking";
import { matchRequirementToProduct } from "./equivalent-matcher";
import type { EquivalentDecision } from "./equivalent-decision-types";

const cachedDecisions = new Map<string, EquivalentDecision>();

export function runEquivalentDecisionEngine(requirementId: string): EquivalentDecision | undefined {
  const cached = cachedDecisions.get(requirementId);
  if (cached) return cached;

  const match = matchRequirementToProduct(requirementId);
  const ranking = rankEquivalentCandidates(requirementId);
  const recommendation = buildEquivalentRecommendation(requirementId);
  if (!match || !recommendation || !ranking.optimalProductId) return undefined;

  const decision: EquivalentDecision = {
    decisionId: `epi-decision-${requirementId}`,
    requirementId,
    optimalProductId: recommendation.optimalProductId,
    candidateProductIds: ranking.entries.map((entry) => entry.productId),
    decisionLevel: recommendation.decisionLevel,
    decisionReason: [
      `primary-product=${match.primaryProductId}`,
      `ranked-candidates=${ranking.entries.length}`,
      `top-score=${ranking.entries[0]?.score.totalScore ?? 0}`,
      recommendation.compatibilitySummary,
      recommendation.riskSummary,
    ],
    riskSummary: recommendation.riskSummary,
    compatibilitySummary: recommendation.compatibilitySummary,
    recommendationSummary: recommendation.recommendationSummary,
    mode: EPI_CANONICAL_ID,
  };

  cachedDecisions.set(requirementId, decision);
  return decision;
}

export function decideOptimalEquivalentProduct(requirementId: string): string | undefined {
  return runEquivalentDecisionEngine(requirementId)?.optimalProductId;
}

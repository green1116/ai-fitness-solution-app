import { findEvidenceByBrand } from "@/lib/evidence-intelligence-network";
import { findRequirementById } from "@/lib/requirement-intelligence";
import { resolveProductWithSpecifications } from "../substitution/substitution-context";
import { assessSubstitution } from "../substitution/substitution-compatibility-engine";
import { EPI_CANONICAL_ID } from "../shared/constants";
import {
  findPrimaryProductForRequirement,
  matchRequirementToProduct,
} from "./equivalent-matcher";
import {
  rankEquivalentCandidates,
  resolveEquivalentDecisionLevel,
} from "./equivalent-ranking";
import type { EquivalentRecommendation } from "./equivalent-decision-types";

const cachedRecommendations = new Map<string, EquivalentRecommendation>();

export function buildEquivalentRecommendation(
  requirementId: string,
): EquivalentRecommendation | undefined {
  const cached = cachedRecommendations.get(requirementId);
  if (cached) return cached;

  const requirement = findRequirementById(requirementId);
  const match = matchRequirementToProduct(requirementId);
  const ranking = rankEquivalentCandidates(requirementId);
  if (!requirement || !match || !ranking.optimalProductId) return undefined;

  const optimalProduct = resolveProductWithSpecifications(ranking.optimalProductId);
  const primaryProductId = findPrimaryProductForRequirement(requirementId)!;
  const assessment = assessSubstitution(
    primaryProductId,
    ranking.optimalProductId,
    requirementId,
  );
  const evidenceCount = optimalProduct?.brandId
    ? findEvidenceByBrand(optimalProduct.brandId).length
    : 0;

  const decisionLevel = resolveEquivalentDecisionLevel({
    compatibilityLevel: assessment.compatibility.compatibilityLevel,
    riskLevel: assessment.riskLevel,
    evidenceCount,
  });

  const recommendation: EquivalentRecommendation = {
    recommendationId: `epi-recommendation-${requirementId}`,
    requirementId,
    optimalProductId: ranking.optimalProductId,
    alternativeProductIds: ranking.alternativeProductIds,
    decisionLevel,
    riskSummary: `risk=${assessment.riskLevel} score=${assessment.riskScore.totalRiskScore} compliance=${assessment.riskScore.complianceRiskScore} evidence=${assessment.riskScore.evidenceRiskScore}`,
    compatibilitySummary: `compatibility=${assessment.compatibility.compatibilityLevel} matches=${assessment.compatibility.specMatches}/${assessment.compatibility.totalSpecs} ratio=${assessment.compatibility.specMatchRatio}`,
    recommendationSummary: `optimal=${ranking.optimalProductId} decision=${decisionLevel} totalScore=${ranking.entries[0]?.score.totalScore ?? 0}`,
    mode: EPI_CANONICAL_ID,
  };

  cachedRecommendations.set(requirementId, recommendation);
  return recommendation;
}

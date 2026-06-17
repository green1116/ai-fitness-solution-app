import { PI_CANONICAL_ID } from "../shared/constants";
import { buildProcurementRequirementLinks } from "../procurement-matching/procurement-requirement-link";
import { buildProcurementMatches } from "../procurement-matching/procurement-match-builder";
import type { ProcurementDecisionLevel, ProcurementRecommendationResult } from "./procurement-decision-types";
import { rankProcurementCandidatesForRequirement } from "./procurement-ranking";

export function resolveProcurementDecisionLevel(totalScore: number): ProcurementDecisionLevel {
  if (totalScore >= 80) return "preferred";
  if (totalScore >= 60) return "acceptable";
  if (totalScore >= 40) return "fallback";
  return "defer";
}

const recommendationCache = new Map<string, ProcurementRecommendationResult>();

export function buildProcurementRecommendation(
  requirementId: string,
): ProcurementRecommendationResult | undefined {
  const cached = recommendationCache.get(requirementId);
  if (cached) return cached;

  const requirementLink = buildProcurementRequirementLinks().find(
    (link) => link.requirementId === requirementId,
  );
  if (!requirementLink) return undefined;

  const matches = buildProcurementMatches(requirementId);
  const ranking = rankProcurementCandidatesForRequirement(requirementId, matches);

  if (!ranking || ranking.candidates.length === 0) {
    const deferRecommendation: ProcurementRecommendationResult = {
      requirementId,
      decisionId: requirementLink.decisionId,
      optimalSupplierId: "",
      optimalProductId: requirementLink.productId,
      backupSupplierIds: [],
      backupProductIds: [],
      procurementLevel: "defer",
      recommendationReason: [
        "no-ranked-supplier-candidates",
        `decision=${requirementLink.decisionId}`,
        "procurement-level=defer",
      ],
      mode: PI_CANONICAL_ID,
    };
    recommendationCache.set(requirementId, deferRecommendation);
    return deferRecommendation;
  }

  const optimal = ranking.candidates[0]!;
  const procurementLevel = resolveProcurementDecisionLevel(optimal.totalScore);

  const recommendation: ProcurementRecommendationResult = {
    requirementId,
    decisionId: optimal.decisionId,
    optimalSupplierId: optimal.supplierId,
    optimalProductId: optimal.productId,
    backupSupplierIds: ranking.alternativeSupplierIds,
    backupProductIds: ranking.candidates.slice(1, 4).map((candidate) => candidate.productId),
    procurementLevel,
    recommendationReason: [
      `optimal-supplier=${optimal.supplierId}`,
      `match-score=${optimal.matchScore}`,
      `total-score=${optimal.totalScore}`,
      `procurement-level=${procurementLevel}`,
      `ranked-candidates=${ranking.candidates.length}`,
    ],
    mode: PI_CANONICAL_ID,
  };

  recommendationCache.set(requirementId, recommendation);
  return recommendation;
}

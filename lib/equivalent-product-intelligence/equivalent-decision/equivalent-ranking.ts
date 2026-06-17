import { findEvidenceByBrand } from "@/lib/evidence-intelligence-network";
import { findRequirementById } from "@/lib/requirement-intelligence";
import { getRealPricingBySku } from "@/lib/real-catalog-foundation";
import { assessSubstitution } from "../substitution/substitution-compatibility-engine";
import { resolveProductWithSpecifications } from "../substitution/substitution-context";
import { EPI_CANONICAL_ID } from "../shared/constants";
import {
  findPrimaryProductForRequirement,
  matchRequirementToProduct,
} from "./equivalent-matcher";
import type {
  EquivalentCandidateRanking,
  EquivalentCandidateRankingEntry,
  EquivalentCandidateScore,
  EquivalentDecisionLevel,
} from "./equivalent-decision-types";
import type { CompatibilityLevel, SubstitutionRiskLevel } from "../substitution/substitution-types";

function compatibilityLevelScore(level: CompatibilityLevel): number {
  if (level === "compatible") return 100;
  if (level === "partial") return 60;
  return 20;
}

function buildCandidateScore(input: {
  compatibilityLevel: CompatibilityLevel;
  totalRiskScore: number;
  brandId?: string;
  requirementBrandId?: string;
  fitScore: number;
  confidence: number;
  sourceSku?: string;
  targetSku?: string;
}): EquivalentCandidateScore {
  const evidenceCoverageScore = input.brandId
    ? Math.min(100, findEvidenceByBrand(input.brandId).length * 12)
    : 20;
  const brandFitScore =
    input.requirementBrandId && input.brandId
      ? input.requirementBrandId === input.brandId
        ? 100
        : 55
      : 50;

  let commercialFitScore = 50;
  if (input.sourceSku && input.targetSku) {
    const sourcePricing = getRealPricingBySku(input.sourceSku);
    const targetPricing = getRealPricingBySku(input.targetSku);
    if (sourcePricing && targetPricing) {
      const delta = Math.abs(sourcePricing.listPrice - targetPricing.listPrice);
      commercialFitScore = Math.max(20, 100 - Math.min(80, Math.round(delta / 5000)));
    }
  }

  const compatibilityScore = compatibilityLevelScore(input.compatibilityLevel);
  const riskScore = Math.max(0, 100 - input.totalRiskScore);
  const confidenceScore = input.confidence;

  const totalScore = Math.min(
    100,
    Math.round(
      compatibilityScore * 0.28 +
        riskScore * 0.22 +
        evidenceCoverageScore * 0.15 +
        brandFitScore * 0.15 +
        commercialFitScore * 0.1 +
        confidenceScore * 0.1,
    ),
  );

  return {
    compatibilityScore,
    riskScore,
    evidenceCoverageScore,
    brandFitScore,
    commercialFitScore,
    confidenceScore,
    totalScore,
  };
}

export function resolveEquivalentDecisionLevel(input: {
  compatibilityLevel: CompatibilityLevel;
  riskLevel: SubstitutionRiskLevel;
  evidenceCount: number;
}): EquivalentDecisionLevel {
  if (input.evidenceCount === 0) return "defer";
  if (input.compatibilityLevel === "incompatible") return "no-substitute";
  if (input.compatibilityLevel === "compatible" && input.riskLevel === "low") {
    return "substitute";
  }
  if (
    input.compatibilityLevel === "partial" &&
    (input.riskLevel === "medium" || input.riskLevel === "low")
  ) {
    return "conditional-substitute";
  }
  if (input.compatibilityLevel === "compatible" && input.riskLevel === "medium") {
    return "conditional-substitute";
  }
  if (input.riskLevel === "high" || input.riskLevel === "blocked") {
    return "no-substitute";
  }
  return "defer";
}

const cachedRankings = new Map<string, EquivalentCandidateRanking>();

export function rankEquivalentCandidates(requirementId: string): EquivalentCandidateRanking {
  const cached = cachedRankings.get(requirementId);
  if (cached) return cached;

  const match = matchRequirementToProduct(requirementId);
  const requirement = findRequirementById(requirementId);
  if (!match || !requirement) {
    return {
      rankingId: `epi-ranking-${requirementId}`,
      requirementId,
      entries: [],
      optimalProductId: "",
      alternativeProductIds: [],
      mode: EPI_CANONICAL_ID,
    };
  }

  const sourceProduct = resolveProductWithSpecifications(match.primaryProductId);
  const candidateIds = [match.primaryProductId, ...match.equivalentProductIds];
  const entries: EquivalentCandidateRankingEntry[] = [];

  for (const productId of candidateIds) {
    const targetProduct = resolveProductWithSpecifications(productId);
    const assessment =
      productId === match.primaryProductId
        ? assessSubstitution(productId, productId, requirementId)
        : assessSubstitution(match.primaryProductId, productId, requirementId);
    const evidenceCount = targetProduct?.brandId
      ? findEvidenceByBrand(targetProduct.brandId).length
      : 0;

    const score = buildCandidateScore({
      compatibilityLevel: assessment.compatibility.compatibilityLevel,
      totalRiskScore: assessment.riskScore.totalRiskScore,
      brandId: targetProduct?.brandId,
      requirementBrandId: requirement.brandId,
      fitScore: match.fitScore,
      confidence: match.confidence,
      sourceSku: sourceProduct?.skuId,
      targetSku: targetProduct?.skuId,
    });

    entries.push({
      rank: 0,
      requirementId,
      productId,
      sourceProductId: match.primaryProductId,
      decisionLevel: resolveEquivalentDecisionLevel({
        compatibilityLevel: assessment.compatibility.compatibilityLevel,
        riskLevel: assessment.riskLevel,
        evidenceCount,
      }),
      compatibilityLevel: assessment.compatibility.compatibilityLevel,
      riskLevel: assessment.riskLevel,
      score,
      mode: EPI_CANONICAL_ID,
    });
  }

  entries.sort((a, b) => b.score.totalScore - a.score.totalScore);
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  const ranking: EquivalentCandidateRanking = {
    rankingId: `epi-ranking-${requirementId}`,
    requirementId,
    entries,
    optimalProductId: entries[0]?.productId ?? "",
    alternativeProductIds: entries.slice(1, 4).map((entry) => entry.productId),
    mode: EPI_CANONICAL_ID,
  };

  cachedRankings.set(requirementId, ranking);
  return ranking;
}

export function findTopEquivalentCandidate(requirementId: string): string | undefined {
  return rankEquivalentCandidates(requirementId).optimalProductId || undefined;
}

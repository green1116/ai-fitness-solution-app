import type { CatalogScore } from "./shared/types";

export function buildCatalogScore(
  catalogId: string,
  input: {
    coverageScore: number;
    pricingScore: number;
    availabilityScore: number;
    complianceScore: number;
    matchingScore: number;
  },
): CatalogScore {
  const totalCatalogScore = Math.round(
    input.coverageScore * 0.2 +
      input.pricingScore * 0.2 +
      input.availabilityScore * 0.2 +
      input.complianceScore * 0.2 +
      input.matchingScore * 0.2,
  );

  return {
    scoreId: `catalog-score-${catalogId}`,
    catalogId,
    coverageScore: input.coverageScore,
    pricingScore: input.pricingScore,
    availabilityScore: input.availabilityScore,
    complianceScore: input.complianceScore,
    matchingScore: input.matchingScore,
    totalCatalogScore,
    mode: "product-catalog",
  };
}

export function deriveCatalogScoreFromProposal(
  catalogId: string,
  proposalScore: {
    complianceScore: number;
    technicalScore: number;
    commercialScore: number;
    competitionScore: number;
    winningScore: number;
  },
): CatalogScore {
  return buildCatalogScore(catalogId, {
    coverageScore: Math.min(100, proposalScore.technicalScore + 2),
    pricingScore: Math.min(100, proposalScore.commercialScore + 3),
    availabilityScore: Math.min(100, proposalScore.winningScore + 1),
    complianceScore: proposalScore.complianceScore,
    matchingScore: Math.min(100, proposalScore.competitionScore + 8),
  });
}

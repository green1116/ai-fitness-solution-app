import type { BrandScore } from "./shared/types";

export function buildBrandScore(
  brandId: string,
  input: {
    positioningScore: number;
    complianceScore: number;
    catalogCoverageScore: number;
    supplierCoverageScore: number;
    evidenceCoverageScore: number;
  },
): BrandScore {
  const totalBrandScore = Math.round(
    input.positioningScore * 0.2 +
      input.complianceScore * 0.2 +
      input.catalogCoverageScore * 0.2 +
      input.supplierCoverageScore * 0.2 +
      input.evidenceCoverageScore * 0.2,
  );

  return {
    scoreId: `brand-score-${brandId}`,
    brandId,
    positioningScore: input.positioningScore,
    complianceScore: input.complianceScore,
    catalogCoverageScore: input.catalogCoverageScore,
    supplierCoverageScore: input.supplierCoverageScore,
    evidenceCoverageScore: input.evidenceCoverageScore,
    totalBrandScore,
    mode: "brand-intelligence-network",
  };
}

export function deriveInitialBrandScore(brandId: string, tierWeight: number): BrandScore {
  const base = Math.min(95, 68 + tierWeight * 4);
  return buildBrandScore(brandId, {
    positioningScore: base + 2,
    complianceScore: base,
    catalogCoverageScore: Math.max(60, base - 5),
    supplierCoverageScore: Math.max(55, base - 8),
    evidenceCoverageScore: Math.max(50, base - 10),
  });
}

export function applyEvidenceScoreBoost(
  score: BrandScore,
  evidenceCount: number,
  hasCaseStudy: boolean,
): BrandScore {
  const boost = Math.min(15, evidenceCount * 2 + (hasCaseStudy ? 5 : 0));
  return buildBrandScore(score.brandId, {
    positioningScore: score.positioningScore,
    complianceScore: Math.min(100, score.complianceScore + Math.round(boost * 0.4)),
    catalogCoverageScore: score.catalogCoverageScore,
    supplierCoverageScore: score.supplierCoverageScore,
    evidenceCoverageScore: Math.min(100, score.evidenceCoverageScore + boost),
  });
}

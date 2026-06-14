import { buildBrandEvidenceCoverage } from "../evidence-coverage/coverage-registry";
import { isEvidenceExpired } from "../evidence-coverage/coverage-builder";
import { traverseEvidenceFromBrand } from "../evidence-graph/evidence-graph-traversal";
import { findEvidenceByBrand } from "../evidence-registry";
import type { EvidenceReadinessScore } from "../shared/types";

export function computeRegistryScore(brandId: string): number {
  const evidence = findEvidenceByBrand(brandId);
  if (evidence.length === 0) return 0;

  const uniqueKinds = new Set(evidence.map((record) => record.evidenceKind)).size;
  const averageScore =
    evidence.reduce((sum, record) => sum + record.score.totalEvidenceScore, 0) / evidence.length;

  const countScore = Math.min(40, evidence.length * 4);
  const kindScore = Math.round((uniqueKinds / 6) * 30);
  const qualityScore = Math.round(averageScore * 0.3);

  return Math.min(100, countScore + kindScore + qualityScore);
}

export function computeGraphScore(brandId: string): number {
  const traversal = traverseEvidenceFromBrand(brandId);
  if (traversal.pathCount === 0) return 0;

  const nodeScore = Math.min(50, traversal.visitedNodeIds.length * 3);
  const evidenceScore = Math.min(40, traversal.evidenceNodeIds.length * 5);
  const edgeScore = Math.min(10, traversal.visitedEdgeIds.length);

  return Math.min(100, nodeScore + evidenceScore + edgeScore);
}

export function computeCoverageScoreForBrand(brandId: string): number {
  return buildBrandEvidenceCoverage(brandId).coverageScore;
}

export function computeFreshnessScore(brandId: string): number {
  const evidence = findEvidenceByBrand(brandId);
  if (evidence.length === 0) return 0;

  const activeCount = evidence.filter((record) => !isEvidenceExpired(record)).length;
  return Math.round((activeCount / evidence.length) * 100);
}

export function computeBrandAlignmentScore(brandId: string): number {
  const evidence = findEvidenceByBrand(brandId);
  if (evidence.length === 0) return 0;

  let score = 50;
  if (evidence.some((record) => Boolean(record.manufacturerId))) score += 15;
  if (evidence.some((record) => Boolean(record.sku))) score += 15;
  if (evidence.some((record) => record.requirementLinkIds.length > 0)) score += 5;

  const traversal = traverseEvidenceFromBrand(brandId);
  if (traversal.evidenceNodeIds.length >= 2) score += 15;

  return Math.min(100, score);
}

export function buildEvidenceReadinessScore(brandId: string): EvidenceReadinessScore {
  const registryScore = computeRegistryScore(brandId);
  const graphScore = computeGraphScore(brandId);
  const coverageScore = computeCoverageScoreForBrand(brandId);
  const freshnessScore = computeFreshnessScore(brandId);
  const brandAlignmentScore = computeBrandAlignmentScore(brandId);

  const totalReadinessScore = Math.round(
    registryScore * 0.2 +
      graphScore * 0.2 +
      coverageScore * 0.25 +
      freshnessScore * 0.2 +
      brandAlignmentScore * 0.15,
  );

  return {
    readinessId: `evidence-readiness-${brandId}`,
    brandId,
    registryScore,
    graphScore,
    coverageScore,
    freshnessScore,
    brandAlignmentScore,
    totalReadinessScore,
    mode: "evidence-intelligence-network",
  };
}

export function deriveReadinessBlockers(
  brandId: string,
  score: EvidenceReadinessScore,
): { criticalBlockers: string[]; warningItems: string[] } {
  const evidence = findEvidenceByBrand(brandId);
  const coverage = buildBrandEvidenceCoverage(brandId);
  const criticalBlockers: string[] = [];
  const warningItems: string[] = [];

  if (evidence.length === 0) {
    criticalBlockers.push("no-evidence-records");
  }
  if (score.graphScore < 20) {
    criticalBlockers.push("graph-connectivity-insufficient");
  }
  if (coverage.coverageLevel === "none") {
    criticalBlockers.push("coverage-level-none");
  }
  if (score.totalReadinessScore < 70) {
    criticalBlockers.push("readiness-score-below-threshold");
  }

  if (coverage.gapKinds.length > 0) {
    warningItems.push(`gap-kinds:${coverage.gapKinds.join(",")}`);
  }
  if (coverage.expiredCount > 0) {
    warningItems.push(`expired-evidence-count:${coverage.expiredCount}`);
  }
  if (coverage.coverageLevel === "partial" || coverage.coverageLevel === "minimal") {
    warningItems.push(`coverage-level:${coverage.coverageLevel}`);
  }
  if (score.freshnessScore < 80) {
    warningItems.push("freshness-degraded");
  }

  return { criticalBlockers, warningItems };
}

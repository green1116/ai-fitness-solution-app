import type { ProductRecord } from "../product-foundation/product-spec-types";
import type { EquivalentMappingKind, EquivalentScore } from "./equivalent-graph-types";

function jaccardOverlap(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((value) => setB.has(value)).length;
  const union = new Set([...setA, ...setB]).size;
  if (union === 0) return 0;
  return Math.round((intersection / union) * 100);
}

function tokenizeName(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

function nameSimilarity(a: string, b: string): number {
  const tokensA = new Set(tokenizeName(a));
  const tokensB = new Set(tokenizeName(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  const overlap = [...tokensA].filter((token) => tokensB.has(token)).length;
  return Math.round((overlap / Math.max(tokensA.size, tokensB.size)) * 100);
}

function computeBrandDistanceScore(source: ProductRecord, target: ProductRecord): number {
  if (source.brandId && target.brandId) {
    if (source.brandId === target.brandId) return 100;
    return 55;
  }
  return 45;
}

function computeFunctionalSimilarityScore(source: ProductRecord, target: ProductRecord): number {
  let score = 0;
  if (source.category === target.category) score += 70;
  else if (
    source.category.includes(target.category) ||
    target.category.includes(source.category)
  ) {
    score += 45;
  }
  score += Math.round(nameSimilarity(source.name, target.name) * 0.3);
  return Math.min(100, score);
}

function computeCatalogSimilarityScore(source: ProductRecord, target: ProductRecord): number {
  let score = 40;
  if (source.source === target.source) score += 25;
  if (source.category === target.category) score += 35;
  return Math.min(100, score);
}

export function calculateEquivalentScore(
  source: ProductRecord,
  target: ProductRecord,
): EquivalentScore {
  const specOverlapScore = jaccardOverlap(source.specifications, target.specifications);
  const brandDistanceScore = computeBrandDistanceScore(source, target);
  const functionalSimilarityScore = computeFunctionalSimilarityScore(source, target);
  const catalogSimilarityScore = computeCatalogSimilarityScore(source, target);

  const totalScore = Math.min(
    100,
    Math.round(
      specOverlapScore * 0.3 +
        brandDistanceScore * 0.2 +
        functionalSimilarityScore * 0.3 +
        catalogSimilarityScore * 0.2,
    ),
  );

  return {
    specOverlapScore,
    brandDistanceScore,
    functionalSimilarityScore,
    catalogSimilarityScore,
    totalScore,
  };
}

export function resolveMappingKind(
  source: ProductRecord,
  target: ProductRecord,
  score: EquivalentScore,
): EquivalentMappingKind {
  const sameBrand = Boolean(source.brandId && target.brandId && source.brandId === target.brandId);

  if (sameBrand && score.specOverlapScore >= 60 && score.totalScore >= 75) {
    return "direct-equivalent";
  }

  if (!sameBrand && score.functionalSimilarityScore >= 45 && score.totalScore >= 40) {
    return "cross-brand-equivalent";
  }

  if (score.totalScore >= 60 && score.functionalSimilarityScore >= 55) {
    return "functional-substitute";
  }

  if (score.totalScore >= 50 && score.catalogSimilarityScore <= score.functionalSimilarityScore) {
    return "downgrade-substitute";
  }

  if (score.totalScore >= 35) {
    return "functional-substitute";
  }

  if (score.functionalSimilarityScore >= 30 || score.specOverlapScore >= 15) {
    return "emergency-substitute";
  }

  return "emergency-substitute";
}

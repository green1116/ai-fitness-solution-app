import type { RegistryValidation } from "../shared/types";
import { validateRecommendationContextRegistry } from "./recommendation-context";
import {
  executeRecommendationQuery,
  findSimilarOrganizations,
  recommendBrands,
  recommendByCategory,
  recommendRelationships,
  recommendSuppliers,
} from "./recommendation-engine";
import type { IndustryRecommendationValidation } from "./types";
import {
  CANONICAL_CATEGORY_RECOMMENDATION_QUERY,
  CANONICAL_RECOMMENDATION_ANCHOR,
  CANONICAL_RECOMMENDATION_QUERY,
} from "./types";

export function validateRecommendationEngineRegistry(): RegistryValidation {
  const similar = findSimilarOrganizations(CANONICAL_RECOMMENDATION_ANCHOR, 3);
  const suppliers = recommendSuppliers(CANONICAL_RECOMMENDATION_ANCHOR, 3);
  const brands = recommendBrands("ind-org-supplier-life-fitness-cn", 3);
  const relationships = recommendRelationships(CANONICAL_RECOMMENDATION_ANCHOR, 3);
  const byCategory = recommendByCategory({ categoryCode: "COMMERCIAL_GYM", limit: 3 });

  const valid =
    similar.recommendationReady &&
    suppliers.recommendationReady &&
    brands.recommendationReady &&
    relationships.recommendationReady &&
    byCategory.recommendationReady &&
    suppliers.candidates.every((candidate) => candidate.candidateKind === "supplier") &&
    brands.candidates.every((candidate) => candidate.candidateKind === "brand") &&
    relationships.candidates.every((candidate) => candidate.candidateKind === "relationship") &&
    byCategory.candidates.every((candidate) => candidate.candidateKind === "category-match") &&
    suppliers.scores[0]!.score >= suppliers.scores[suppliers.scores.length - 1]!.score;

  return {
    valid,
    count: suppliers.hitCount + brands.hitCount + relationships.hitCount,
    summary: `recommendation-engine similar=${similar.hitCount} suppliers=${suppliers.hitCount} brands=${brands.hitCount} category=${byCategory.hitCount} valid=${valid}`,
  };
}

export function validateRecommendationQueryRegistry(): RegistryValidation {
  const canonical = executeRecommendationQuery(CANONICAL_RECOMMENDATION_QUERY);
  const categoryQuery = executeRecommendationQuery(CANONICAL_CATEGORY_RECOMMENDATION_QUERY);

  const valid =
    canonical.recommendationReady &&
    canonical.hitCount >= 2 &&
    canonical.scores.length === canonical.hitCount &&
    categoryQuery.recommendationReady &&
    categoryQuery.hitCount >= 1 &&
    canonical.scores.every((score) => score.reasons.length > 0);

  return {
    valid,
    count: canonical.hitCount,
    summary: `recommendation-query canonical=${canonical.hitCount} category=${categoryQuery.hitCount} topScore=${canonical.scores[0]?.score ?? 0} valid=${valid}`,
  };
}

export function validateIndustryRecommendation(): IndustryRecommendationValidation {
  const recommendationEngine = validateRecommendationEngineRegistry();
  const recommendationContext = validateRecommendationContextRegistry();
  const recommendationQuery = validateRecommendationQueryRegistry();

  return {
    valid:
      recommendationEngine.valid &&
      recommendationContext.valid &&
      recommendationQuery.valid,
    recommendationEngine,
    recommendationContext,
    recommendationQuery,
  };
}

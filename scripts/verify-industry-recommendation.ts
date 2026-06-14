/**
 * V31 Industry Relationship Network — Phase 4 Recommendation verification
 */
import {
  buildRecommendationContext,
  CANONICAL_CATEGORY_RECOMMENDATION_QUERY,
  CANONICAL_RECOMMENDATION_ANCHOR,
  CANONICAL_RECOMMENDATION_QUERY,
  executeRecommendationQuery,
  findSimilarOrganizations,
  INDUSTRY_RECOMMENDATION_TAG,
  INDUSTRY_RECOMMENDATION_VERSION,
  recommendBrands,
  recommendByCategory,
  recommendRelationships,
  recommendSuppliers,
  validateIndustryRecommendation,
  validateRecommendationContext,
  validateRecommendationContextRegistry,
  validateRecommendationEngineRegistry,
  validateRecommendationQueryRegistry,
} from "../lib/industry-relationship";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testRecommendationEngine() {
  const result = validateRecommendationEngineRegistry();
  assert(result.valid, "recommendation engine valid");

  const similar = findSimilarOrganizations(CANONICAL_RECOMMENDATION_ANCHOR, 3);
  const suppliers = recommendSuppliers(CANONICAL_RECOMMENDATION_ANCHOR, 3);
  const brands = recommendBrands("ind-org-supplier-life-fitness-cn", 3);
  const relationships = recommendRelationships(CANONICAL_RECOMMENDATION_ANCHOR, 3);
  const byCategory = recommendByCategory({ categoryCode: "COMMERCIAL_GYM", limit: 3 });

  assert(similar.recommendationReady, "findSimilarOrganizations");
  assert(suppliers.recommendationReady, "recommendSuppliers");
  assert(brands.recommendationReady, "recommendBrands");
  assert(relationships.recommendationReady, "recommendRelationships");
  assert(byCategory.recommendationReady, "recommendByCategory");

  console.log("✓ recommendation engine");
  console.log(" ", result.summary);
}

function testRecommendationContext() {
  const result = validateRecommendationContextRegistry();
  assert(result.valid, "recommendation context registry valid");

  const context = buildRecommendationContext(CANONICAL_RECOMMENDATION_ANCHOR);
  assert(validateRecommendationContext(context), "recommendation context valid");

  console.log("✓ recommendation context");
  console.log(" ", result.summary);
}

function testRecommendationQuery() {
  const result = validateRecommendationQueryRegistry();
  assert(result.valid, "recommendation query registry valid");

  const canonical = executeRecommendationQuery(CANONICAL_RECOMMENDATION_QUERY);
  const category = executeRecommendationQuery(CANONICAL_CATEGORY_RECOMMENDATION_QUERY);

  assert(canonical.recommendationReady, "canonical query ready");
  assert(canonical.scores.length >= 2, "canonical scores");
  assert(category.recommendationReady, "category query ready");
  assert(canonical.scores[0]!.score >= canonical.scores[canonical.scores.length - 1]!.score, "score ranking");

  console.log("✓ recommendation query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `canonical=${canonical.hitCount} topScore=${canonical.scores[0]?.score} category=${category.hitCount}`,
  );
}

function testIndustryRecommendation() {
  const validation = validateIndustryRecommendation();
  assert(validation.valid, "industry recommendation validation");
  assert(INDUSTRY_RECOMMENDATION_VERSION === "v31-industry-recommendation-1", "recommendation version");
  assert(
    INDUSTRY_RECOMMENDATION_TAG === "v31-industry-recommendation-foundation",
    "recommendation tag",
  );

  console.log("✓ industry recommendation validation");
  console.log(
    " ",
    `engine=${validation.recommendationEngine.valid} context=${validation.recommendationContext.valid} query=${validation.recommendationQuery.valid}`,
  );
}

testRecommendationEngine();
testRecommendationContext();
testRecommendationQuery();
testIndustryRecommendation();
console.log("Industry Recommendation Foundation PASS");

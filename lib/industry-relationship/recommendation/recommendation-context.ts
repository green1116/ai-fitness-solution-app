import type { RegistryValidation } from "../shared/types";
import { buildRecommendationContext } from "./recommendation-engine";
import type { RecommendationContext } from "./types";
import {
  CANONICAL_RECOMMENDATION_ANCHOR,
  INDUSTRY_RECOMMENDATION_TAG,
  INDUSTRY_RECOMMENDATION_VERSION,
} from "./types";

export function validateRecommendationContext(context: RecommendationContext): boolean {
  return (
    context.recommendationReady &&
    context.candidates.length >= 5 &&
    context.scores.length >= 5 &&
    context.scores.every((score) => score.score >= 0 && score.confidence >= 0) &&
    context.candidates.some((candidate) => candidate.candidateKind === "supplier") &&
    context.mode === "industry-recommendation"
  );
}

export function validateRecommendationContextRegistry(): RegistryValidation {
  const context = buildRecommendationContext(CANONICAL_RECOMMENDATION_ANCHOR);
  const valid =
    validateRecommendationContext(context) &&
    INDUSTRY_RECOMMENDATION_VERSION === "v31-industry-recommendation-1" &&
    INDUSTRY_RECOMMENDATION_TAG === "v31-industry-recommendation-foundation";

  return {
    valid,
    count: context.candidates.length,
    summary: `recommendation-context anchor=${context.anchorId} candidates=${context.candidates.length} ready=${context.recommendationReady} valid=${valid}`,
  };
}

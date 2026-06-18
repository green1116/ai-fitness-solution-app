import {
  PI_MIN_OPTIMIZATION_AVERAGE_CONFIDENCE,
  PI_MIN_OPTIMIZATION_HIGH_PRIORITY_COUNT,
  PI_MIN_OPTIMIZATION_OPPORTUNITY_COUNT,
  PI_MIN_OPTIMIZATION_RECOMMENDATION_COUNT,
} from "../shared/constants";
import { buildOptimizationOpportunityRegistry } from "./optimization-opportunity-registry";
import { buildOptimizationRecommendationRegistry } from "./optimization-recommendation-registry";
import type { OptimizationLayerValidation } from "./optimization-types";

let cachedValidation: OptimizationLayerValidation | undefined;

export function validateOptimizationLayer(): OptimizationLayerValidation {
  if (cachedValidation) return cachedValidation;

  const opportunities = buildOptimizationOpportunityRegistry();
  const recommendations = buildOptimizationRecommendationRegistry();

  const valid =
    opportunities.count >= PI_MIN_OPTIMIZATION_OPPORTUNITY_COUNT &&
    recommendations.count >= PI_MIN_OPTIMIZATION_RECOMMENDATION_COUNT &&
    opportunities.highPriorityCount >= PI_MIN_OPTIMIZATION_HIGH_PRIORITY_COUNT &&
    recommendations.averageConfidence >= PI_MIN_OPTIMIZATION_AVERAGE_CONFIDENCE;

  const summary = [
    `opportunities=${opportunities.count}`,
    `recommendations=${recommendations.count}`,
    `highPriority=${opportunities.highPriorityCount}`,
    `avgConfidence=${recommendations.averageConfidence}`,
  ].join(" ");

  cachedValidation = {
    valid,
    opportunityCount: opportunities.count,
    recommendationCount: recommendations.count,
    highPriorityCount: opportunities.highPriorityCount,
    averageConfidence: recommendations.averageConfidence,
    summary,
  };

  return cachedValidation;
}

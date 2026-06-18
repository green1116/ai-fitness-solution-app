import { PI_CANONICAL_ID } from "../shared/constants";
import { buildBenchmarkContext } from "../benchmark-layer/benchmark-context";
import { buildPerformanceRegistry } from "../performance-foundation/performance-registry";
import { buildOptimizationOpportunityRegistry } from "./optimization-opportunity-registry";
import { buildOptimizationRecommendationRegistry } from "./optimization-recommendation-registry";
import { buildOptimizationReasoning } from "./optimization-reasoning";
import type { OptimizationContext } from "./optimization-types";

let cachedContext: OptimizationContext | undefined;

export function buildOptimizationContext(): OptimizationContext {
  if (cachedContext) return cachedContext;

  const opportunities = buildOptimizationOpportunityRegistry();
  const recommendations = buildOptimizationRecommendationRegistry();
  const reasoning = buildOptimizationReasoning();

  cachedContext = {
    contextId: "pi-optimization-context-v46-p3",
    performance: buildPerformanceRegistry(),
    benchmark: buildBenchmarkContext(),
    opportunities,
    recommendations,
    reasoning,
    highPriorityCount: opportunities.highPriorityCount,
    averageConfidence: recommendations.averageConfidence,
    mode: PI_CANONICAL_ID,
  };

  return cachedContext;
}

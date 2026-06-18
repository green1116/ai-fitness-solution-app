import { buildBenchmarkContext } from "../benchmark-layer/benchmark-context";
import { buildOptimizationRecommendationRegistry } from "../optimization-layer/optimization-recommendation-registry";
import { buildOptimizationOpportunityRegistry } from "../optimization-layer/optimization-opportunity-registry";
import { buildPerformanceRegistry } from "../performance-foundation/performance-registry";

export interface PerformanceSummary {
  performanceCount: number;
  benchmarkCount: number;
  opportunityCount: number;
  recommendationCount: number;
  averageScore: number;
  averageConfidence: number;
  highPriorityCount: number;
}

let cachedSummary: PerformanceSummary | undefined;

export function buildPerformanceSummary(): PerformanceSummary {
  if (cachedSummary) return cachedSummary;

  const performance = buildPerformanceRegistry();
  const benchmark = buildBenchmarkContext();
  const opportunities = buildOptimizationOpportunityRegistry();
  const recommendations = buildOptimizationRecommendationRegistry();

  cachedSummary = {
    performanceCount: performance.count,
    benchmarkCount:
      benchmark.brandBenchmarks.count +
      benchmark.supplierBenchmarks.count +
      benchmark.productBenchmarks.count +
      benchmark.projectBenchmarks.count,
    opportunityCount: opportunities.count,
    recommendationCount: recommendations.count,
    averageScore: performance.averageScore,
    averageConfidence: recommendations.averageConfidence,
    highPriorityCount: opportunities.highPriorityCount,
  };

  return cachedSummary;
}

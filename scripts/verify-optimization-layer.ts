/**
 * V46 Performance Intelligence — Optimization Layer verification
 */
import {
  buildOptimizationContext,
  buildOptimizationOpportunityRegistry,
  buildOptimizationReasoning,
  buildOptimizationRecommendationRegistry,
  OPTIMIZATION_REASON_CODES,
  PI_MIN_OPTIMIZATION_AVERAGE_CONFIDENCE,
  PI_MIN_OPTIMIZATION_HIGH_PRIORITY_COUNT,
  PI_MIN_OPTIMIZATION_OPPORTUNITY_COUNT,
  PI_MIN_OPTIMIZATION_RECOMMENDATION_COUNT,
  validateOptimizationLayer,
} from "../lib/performance-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const opportunities = buildOptimizationOpportunityRegistry();
assert(opportunities.count >= PI_MIN_OPTIMIZATION_OPPORTUNITY_COUNT, "optimization opportunity count");
assert(
  opportunities.records.every((record) => record.opportunityId && record.type && record.source),
  "opportunity fields",
);

console.log("✓ optimization opportunities");
console.log(`  opportunities=${opportunities.count} highPriority=${opportunities.highPriorityCount}`);

const recommendations = buildOptimizationRecommendationRegistry();
assert(recommendations.count >= PI_MIN_OPTIMIZATION_RECOMMENDATION_COUNT, "optimization recommendation count");
assert(
  recommendations.averageConfidence >= PI_MIN_OPTIMIZATION_AVERAGE_CONFIDENCE,
  "average confidence",
);
assert(
  recommendations.records.every((record) => record.recommendationId && record.opportunityId),
  "recommendation fields",
);

console.log("✓ optimization recommendations");
console.log(
  `  recommendations=${recommendations.count} averageConfidence=${recommendations.averageConfidence}`,
);

const reasoning = buildOptimizationReasoning();
assert(reasoning.length === opportunities.count, "optimization reasoning count");
assert(
  reasoning.every(
    (entry) => entry.reasonCodes.length > 0 && entry.reasonCodes.includes(OPTIMIZATION_REASON_CODES.benchmarkGap) ||
      entry.reasonCodes.includes(OPTIMIZATION_REASON_CODES.lowPerformance) ||
      entry.reasonCodes.includes(OPTIMIZATION_REASON_CODES.highRisk) ||
      entry.reasonCodes.includes(OPTIMIZATION_REASON_CODES.issueOpen),
  ),
  "reasoning codes",
);

console.log("✓ optimization reasoning");
console.log(`  reasoning=${reasoning.length}`);

const context = buildOptimizationContext();
assert(context.opportunities.count === opportunities.count, "optimization context opportunities");
assert(context.recommendations.count === recommendations.count, "optimization context recommendations");

console.log("✓ optimization context");
console.log(
  `  performance=${context.performance.count} benchmarkBrands=${context.benchmark.brandBenchmarks.count}`,
);

const validation = validateOptimizationLayer();
assert(validation.valid, "optimization validation");
assert(validation.highPriorityCount >= PI_MIN_OPTIMIZATION_HIGH_PRIORITY_COUNT, "high priority count");

const topRecommendation = [...recommendations.records].sort(
  (left, right) => right.expectedScoreIncrease - left.expectedScoreIncrease,
)[0]!;

console.log("✓ optimization validation");
console.log(`  valid=${validation.valid} summary=${validation.summary}`);
console.log(
  `  topRecommendation=${topRecommendation.recommendationId} type=${topRecommendation.recommendationType} confidence=${topRecommendation.confidence} expectedIncrease=${topRecommendation.expectedScoreIncrease}`,
);
console.log("OPTIMIZATION LAYER PASS");

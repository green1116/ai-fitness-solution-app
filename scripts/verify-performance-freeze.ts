/**
 * V46 Performance Intelligence — Freeze verification
 */
import {
  buildPerformanceFoundationContext,
  buildPerformanceFreeze,
  buildPerformanceSummary,
  PI_MIN_FREEZE_BENCHMARK_COUNT,
  PI_MIN_FREEZE_RECOMMENDATION_COUNT,
  PI_MIN_PERFORMANCE_COUNT,
  validatePerformanceFreeze,
} from "../lib/performance-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const foundation = buildPerformanceFoundationContext();
assert(foundation.performance.performances.length >= PI_MIN_PERFORMANCE_COUNT, "foundation performance count");
assert(foundation.foundationValid, "foundation valid");

console.log("✓ performance foundation context");
console.log(
  `  performances=${foundation.performance.performances.length} benchmarks=${
    foundation.benchmark.brandBenchmarks.count +
    foundation.benchmark.supplierBenchmarks.count +
    foundation.benchmark.productBenchmarks.count +
    foundation.benchmark.projectBenchmarks.count
  } opportunities=${foundation.opportunity.count} recommendations=${foundation.recommendation.count}`,
);

const summary = buildPerformanceSummary();
assert(summary.performanceCount >= PI_MIN_PERFORMANCE_COUNT, "summary performance count");
assert(summary.benchmarkCount >= PI_MIN_FREEZE_BENCHMARK_COUNT, "summary benchmark count");
assert(summary.recommendationCount >= PI_MIN_FREEZE_RECOMMENDATION_COUNT, "summary recommendation count");

console.log("✓ performance summary");
console.log(
  `  performanceCount=${summary.performanceCount} benchmarkCount=${summary.benchmarkCount} opportunityCount=${summary.opportunityCount} recommendationCount=${summary.recommendationCount} averageScore=${summary.averageScore} averageConfidence=${summary.averageConfidence} highPriorityCount=${summary.highPriorityCount}`,
);

const validation = validatePerformanceFreeze();
assert(validation.valid, "performance freeze validation");
assert(validation.foundationValid, "performance freeze foundation valid");

console.log("✓ performance freeze validation");
console.log(`  valid=${validation.valid} summary=${validation.summary}`);

const freeze = buildPerformanceFreeze();
assert(freeze.validation.valid, "performance freeze aggregation");
assert(freeze.foundation.freezeTag === freeze.freezeTag, "freeze tag");

console.log("✓ performance freeze aggregation");
console.log(
  `  freezeTag=${freeze.freezeTag} foundationValid=${freeze.foundation.foundationValid} recommendations=${freeze.summary.recommendationCount}`,
);
console.log("PERFORMANCE INTELLIGENCE FREEZE PASS");

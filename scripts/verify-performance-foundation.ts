/**
 * V46 Performance Intelligence — Foundation verification
 */
import {
  buildPerformanceContext,
  buildPerformanceRegistry,
  calculatePerformanceMetrics,
  PI_MIN_AVERAGE_PERFORMANCE_SCORE,
  PI_MIN_PERFORMANCE_COUNT,
  buildProjectDeliveryFoundationContext,
  validatePerformanceFoundation,
} from "../lib/performance-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const registry = buildPerformanceRegistry();
assert(registry.count >= PI_MIN_PERFORMANCE_COUNT, "performance count");
assert(registry.averageScore >= PI_MIN_AVERAGE_PERFORMANCE_SCORE, "average performance score");
assert(
  registry.records.every(
    (record) =>
      record.performanceId &&
      record.projectId &&
      record.score >= 0 &&
      record.score <= 100,
  ),
  "performance record fields",
);

console.log("✓ performance registry");
console.log(`  performances=${registry.count} averageScore=${registry.averageScore}`);

const foundation = buildProjectDeliveryFoundationContext();
const sampleProject = foundation.projects.records[0]!;
const metrics = calculatePerformanceMetrics(foundation, sampleProject.projectId);
assert(metrics.totalScore >= 0 && metrics.totalScore <= 100, "performance metrics range");

console.log("✓ performance metrics");
console.log(
  `  sample=${sampleProject.projectId} acceptance=${metrics.acceptanceScore} delivery=${metrics.deliveryScore} risk=${metrics.riskScore} total=${metrics.totalScore}`,
);

const context = buildPerformanceContext();
assert(context.performances.length === registry.count, "performance context count");
assert(context.projects.length >= PI_MIN_PERFORMANCE_COUNT, "performance context projects");

console.log("✓ performance context");
console.log(`  projects=${context.projects.length} performances=${context.performances.length}`);

const validation = validatePerformanceFoundation();
assert(validation.valid, "performance validation");

console.log("✓ performance validation");
console.log(`  valid=${validation.valid} summary=${validation.summary}`);
console.log("PERFORMANCE FOUNDATION PASS");

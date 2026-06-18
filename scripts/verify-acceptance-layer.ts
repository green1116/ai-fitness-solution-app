/**
 * V45 Project Delivery Intelligence — Acceptance Layer verification
 */
import {
  assessDeliveryReadiness,
  buildAcceptanceChecks,
  buildAcceptanceCriteriaRegistry,
  buildProjectDeliveryFoundationContext,
  PDI_MIN_ACCEPTANCE_CRITERIA_COUNT,
  PDI_MIN_ACCEPTANCE_PASS_RATE,
  PDI_MIN_DELIVERY_READINESS_SCORE,
  validateAcceptanceLayer,
} from "../lib/project-delivery-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const criteria = buildAcceptanceCriteriaRegistry();
assert(criteria.count >= PDI_MIN_ACCEPTANCE_CRITERIA_COUNT, "acceptance criteria count");
assert(criteria.records.every((record) => record.criteriaId && record.projectId && record.category), "criteria fields");

console.log("✓ acceptance criteria registry");
console.log(`  criteria=${criteria.count}`);

const checks = buildAcceptanceChecks();
assert(checks.count === criteria.count, "acceptance check count");
assert(checks.passRate >= PDI_MIN_ACCEPTANCE_PASS_RATE, "acceptance pass rate");
assert(checks.records.every((record) => record.checkId && record.status), "check fields");

console.log("✓ acceptance checks");
console.log(
  `  checks=${checks.count} pass=${checks.passCount} warning=${checks.warningCount} fail=${checks.failCount} passRate=${(checks.passRate * 100).toFixed(1)}%`,
);

const readiness = assessDeliveryReadiness();
assert(readiness.readinessScore >= PDI_MIN_DELIVERY_READINESS_SCORE, "delivery readiness score");

console.log("✓ delivery readiness");
console.log(
  `  readinessScore=${readiness.readinessScore} milestone=${(readiness.milestoneCompletionRate * 100).toFixed(1)}% task=${(readiness.taskCompletionRate * 100).toFixed(1)}% riskClosure=${(readiness.riskClosureRate * 100).toFixed(1)}% issueClosure=${(readiness.issueClosureRate * 100).toFixed(1)}%`,
);

const foundation = buildProjectDeliveryFoundationContext();
assert(foundation.foundationValid, "foundation context valid");
assert(foundation.stats.criteriaCount >= PDI_MIN_ACCEPTANCE_CRITERIA_COUNT, "foundation criteria count");

console.log("✓ foundation context");
console.log(
  `  projects=${foundation.stats.projectCount} milestones=${foundation.stats.milestoneCount} tasks=${foundation.stats.taskCount} risks=${foundation.stats.riskCount} issues=${foundation.stats.issueCount} readiness=${foundation.stats.readinessScore}`,
);

const validation = validateAcceptanceLayer();
assert(validation.valid, "acceptance validation");
assert(validation.foundationValid, "foundation valid");

console.log("✓ acceptance validation");
console.log(`  valid=${validation.valid} summary=${validation.summary}`);
console.log("PROJECT DELIVERY FOUNDATION FREEZE PASS");

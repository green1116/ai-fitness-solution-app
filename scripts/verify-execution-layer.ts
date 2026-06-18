/**
 * V45 Project Delivery Intelligence — Execution Layer verification
 */
import {
  analyzeExecutionStatusCoverage,
  buildExecutionDecisionLinks,
  buildExecutionProcurementLinks,
  buildExecutionTaskRegistry,
  PDI_MIN_EXECUTION_DECISION_LINK_COUNT,
  PDI_MIN_EXECUTION_PROCUREMENT_LINK_COUNT,
  PDI_MIN_EXECUTION_STATUS_COVERAGE,
  PDI_MIN_EXECUTION_TASK_COUNT,
  validateExecutionLayer,
} from "../lib/project-delivery-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const tasks = buildExecutionTaskRegistry();
assert(tasks.count >= PDI_MIN_EXECUTION_TASK_COUNT, "execution task count");
assert(tasks.records.every((record) => record.taskId && record.milestoneId && record.name), "task fields");

console.log("✓ execution task registry");
console.log(`  tasks=${tasks.count}`);

const statusCoverage = analyzeExecutionStatusCoverage(tasks.records);
assert(statusCoverage.coverageRatio >= PDI_MIN_EXECUTION_STATUS_COVERAGE, "status coverage");

console.log("✓ execution status registry");
console.log(
  `  coverage=${(statusCoverage.coverageRatio * 100).toFixed(1)}% progress=${statusCoverage.progressPercent}%`,
);

const procurementLinks = buildExecutionProcurementLinks();
assert(procurementLinks.length >= PDI_MIN_EXECUTION_PROCUREMENT_LINK_COUNT, "procurement link count");
assert(procurementLinks.every((link) => link.taskId && link.decisionId), "procurement link fields");

console.log("✓ procurement links");
console.log(`  procurementLinks=${procurementLinks.length}`);

const decisionLinks = buildExecutionDecisionLinks();
assert(decisionLinks.length >= PDI_MIN_EXECUTION_DECISION_LINK_COUNT, "decision link count");
assert(decisionLinks.every((link) => link.taskId && link.decisionId), "decision link fields");

console.log("✓ decision links");
console.log(`  decisionLinks=${decisionLinks.length}`);

const validation = validateExecutionLayer();
assert(validation.valid, "execution validation");

console.log("✓ execution validation");
console.log(`  valid=${validation.valid} summary=${validation.summary}`);
console.log("EXECUTION LAYER PASS");

/**
 * V45 Project Delivery Intelligence — Risk & Issue Layer verification
 */
import {
  buildDeliveryIssueRegistry,
  buildDeliveryRiskRegistry,
  calculateDeliveryIssueSeverity,
  calculateDeliveryRiskScore,
  PDI_MIN_DELIVERY_HIGH_RISK_COUNT,
  PDI_MIN_DELIVERY_ISSUE_COUNT,
  PDI_MIN_DELIVERY_OPEN_ISSUE_COUNT,
  PDI_MIN_DELIVERY_RISK_COUNT,
  RISK_SCORE_REASON_CODES,
  validateRiskIssueLayer,
} from "../lib/project-delivery-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const risks = buildDeliveryRiskRegistry();
assert(risks.count >= PDI_MIN_DELIVERY_RISK_COUNT, "delivery risk count");
assert(risks.records.every((record) => record.riskId && record.projectId && record.riskCategory), "risk fields");

console.log("✓ delivery risk registry");
console.log(`  risks=${risks.count} highRisks=${risks.highRiskCount}`);

const issues = buildDeliveryIssueRegistry();
assert(issues.count >= PDI_MIN_DELIVERY_ISSUE_COUNT, "delivery issue count");
assert(issues.openIssueCount >= PDI_MIN_DELIVERY_OPEN_ISSUE_COUNT, "open issue count");
assert(issues.records.every((record) => record.issueId && record.projectId && record.severity), "issue fields");

console.log("✓ delivery issue registry");
console.log(`  issues=${issues.count} openIssues=${issues.openIssueCount}`);

const riskScore = calculateDeliveryRiskScore([
  RISK_SCORE_REASON_CODES.availability,
  RISK_SCORE_REASON_CODES.leadTime,
  RISK_SCORE_REASON_CODES.execution,
]);
assert(riskScore === 75, "risk scoring");

console.log("✓ risk scoring");
console.log(`  sampleScore=${riskScore}`);

const issueSeverity = calculateDeliveryIssueSeverity(riskScore);
assert(issueSeverity === "critical", "issue scoring");

console.log("✓ issue scoring");
console.log(`  sampleSeverity=${issueSeverity}`);

const validation = validateRiskIssueLayer();
assert(validation.valid, "risk issue validation");
assert(validation.highRiskCount >= PDI_MIN_DELIVERY_HIGH_RISK_COUNT, "high risk count");

console.log("✓ risk issue validation");
console.log(`  valid=${validation.valid} summary=${validation.summary}`);
console.log("RISK ISSUE LAYER PASS");

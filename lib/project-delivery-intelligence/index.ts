/**
 * V45 Project Delivery Intelligence — Phase 1.
 * Read-only extension over V40 Requirement / V41 Tender Knowledge Graph.
 */
export * from "./shared/constants";
export * from "./shared/types";

export { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
export { buildTenderRegistryRecords } from "@/lib/tender-knowledge-graph";

export * from "./project-foundation/project-types";
export { buildProjectRegistry } from "./project-foundation/project-registry";
export { buildMilestoneRegistry } from "./project-foundation/milestone-registry";
export { buildProjectTenderLinks } from "./project-foundation/project-tender-link";
export { buildProjectRequirementLinks } from "./project-foundation/project-requirement-link";
export { validateProjectFoundation } from "./project-foundation/foundation-validation";

export * from "./execution-layer/execution-types";
export { buildExecutionTaskRegistry } from "./execution-layer/execution-task-registry";
export {
  EXECUTION_STATUS,
  buildExecutionStatusRegistry,
  calculateExecutionProgress,
  analyzeExecutionStatusCoverage,
} from "./execution-layer/execution-status-registry";
export { buildExecutionProcurementLinks } from "./execution-layer/execution-procurement-link";
export { buildExecutionDecisionLinks } from "./execution-layer/execution-decision-link";
export { buildExecutionContext } from "./execution-layer/execution-context";
export { validateExecutionLayer } from "./execution-layer/execution-validation";

export * from "./risk-issue-layer/risk-issue-types";
export { buildDeliveryRiskRegistry } from "./risk-issue-layer/delivery-risk-registry";
export { buildDeliveryIssueRegistry } from "./risk-issue-layer/delivery-issue-registry";
export {
  calculateDeliveryRiskScore,
  resolveDeliveryRiskLevel,
  RISK_SCORE_WEIGHTS,
  RISK_SCORE_REASON_CODES,
} from "./risk-issue-layer/risk-scoring";
export {
  calculateDeliveryIssueSeverity,
  calculateDeliveryIssueSeverityFromReasons,
} from "./risk-issue-layer/issue-scoring";
export { buildRiskIssueContext } from "./risk-issue-layer/risk-issue-context";
export { validateRiskIssueLayer } from "./risk-issue-layer/risk-issue-validation";

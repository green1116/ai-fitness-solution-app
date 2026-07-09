/**
 * V71 P5 — Workflow governance entry (read-only)
 */
export {
  ESCALATION_CATALOG,
  FREEZE_GATE_CATALOG,
  GOVERNANCE_AUDIT_TRAIL_CATALOG,
  GOVERNANCE_EXCEPTION_CATALOG,
  GOVERNANCE_RULE_CATALOG,
  REVIEW_CATALOG,
  SIGNOFF_CATALOG,
  buildEscalationManifest,
  buildFreezeGateManifest,
  buildGovernanceAuditTrailManifest,
  buildGovernanceExceptionManifest,
  buildGovernanceRuleManifest,
  buildReviewManifest,
  buildSignoffManifest,
  computeDeclarativeGovernanceRiskBlock,
  getAuditTrailByRuleRef,
  getEscalationByRuleRef,
  getExceptionByRuleRef,
  getFreezeGateByRuleRef,
  getGovernanceRuleById,
  getGovernanceRulesByRiskLevel,
  getGovernanceRulesByScope,
  getReviewByRuleRef,
  getSignoffByRuleRef,
  isWorkflowGovernanceRefsAligned,
} from "./governance.rules";
export { assertWorkflowGovernancePass, buildWorkflowGovernance } from "./governance.builder";
export {
  V71_WORKFLOW_GOVERNANCE_FREEZE_VERSION,
  V71_WORKFLOW_GOVERNANCE_VERSION,
} from "./workflow.governance";
export type {
  ApprovalStatus,
  AuditTrail,
  Escalation,
  FreezeGate,
  GovernanceException,
  GovernanceRule,
  GovernanceScope,
  Review,
  RiskLevel,
  Signoff,
  WorkflowGovernanceReport,
  WorkflowGovernanceSignals,
} from "./workflow.governance";

import { buildWorkflowGovernance } from "./governance.builder";
import type {
  WorkflowGovernanceReport,
  WorkflowGovernanceSignals,
} from "./workflow.governance";

export function runWorkflowGovernance(input?: {
  deploymentId?: string;
  signals?: WorkflowGovernanceSignals;
}): WorkflowGovernanceReport {
  return buildWorkflowGovernance(input);
}

export function formatWorkflowGovernanceSummary(report: WorkflowGovernanceReport): string {
  const lines = [
    "V71 Workflow Governance",
    `  ready: ${report.governanceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  workflow-compatibility: ${report.workflowCompatibilityVersion} (ready=${report.workflowCompatibilityReady})`,
    `  governance rules: ${report.rules.ruleCount}`,
    `  reviews: ${report.reviews.entryCount}`,
    `  exceptions: ${report.exceptions.entryCount}`,
    `  escalations: ${report.escalations.entryCount}`,
    `  audit trails: ${report.auditTrails.entryCount}`,
    `  freeze gates: ${report.freezeGates.entryCount}`,
    `  signoffs: ${report.signoffs.entryCount}`,
  ];
  return lines.join("\n");
}

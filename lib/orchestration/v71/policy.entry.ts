/**
 * V71 P3 — Workflow policy entry (read-only)
 */
export {
  AUDIT_TRAIL_CATALOG,
  POLICY_EXCEPTION_CATALOG,
  POLICY_RULE_CATALOG,
  REQUIRED_CHECK_CATALOG,
  buildAuditTrailManifest,
  buildPolicyExceptionManifest,
  buildPolicyRuleManifest,
  buildRequiredCheckManifest,
  computeDeclarativeEnforcementBlock,
  getAuditTrailByRuleRef,
  getExceptionByRuleRef,
  getPolicyRuleById,
  getPolicyRulesByScope,
  getRequiredCheckByRuleRef,
  isWorkflowPolicyRefsAligned,
} from "./policy.rules";
export { assertWorkflowPolicyPass, buildWorkflowPolicy } from "./policy.builder";
export {
  V71_WORKFLOW_POLICY_FREEZE_VERSION,
  V71_WORKFLOW_POLICY_VERSION,
} from "./workflow.policy";
export type {
  AuditTrail,
  PolicyConstraint,
  PolicyException,
  PolicyRule,
  PolicyScope,
  RequiredCheck,
  WorkflowPolicyReport,
  WorkflowPolicySignals,
} from "./workflow.policy";

import { buildWorkflowPolicy } from "./policy.builder";
import type { WorkflowPolicyReport, WorkflowPolicySignals } from "./workflow.policy";

export function runWorkflowPolicy(input?: {
  deploymentId?: string;
  signals?: WorkflowPolicySignals;
}): WorkflowPolicyReport {
  return buildWorkflowPolicy(input);
}

export function formatWorkflowPolicySummary(report: WorkflowPolicyReport): string {
  const lines = [
    "V71 Workflow Policy",
    `  ready: ${report.policyReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  workflow-dependency: ${report.workflowDependencyVersion} (ready=${report.workflowDependencyReady})`,
    `  rules: ${report.rules.ruleCount}`,
    `  required checks: ${report.requiredChecks.entryCount}`,
    `  exceptions: ${report.exceptions.entryCount}`,
    `  audit trails: ${report.auditTrails.entryCount}`,
  ];
  return lines.join("\n");
}

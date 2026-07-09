/**
 * V71 P7 — Workflow compliance entry (read-only)
 */
export {
  COMPLIANCE_AUDIT_TRAIL_CATALOG,
  COMPLIANCE_EXCEPTION_CATALOG,
  COMPLIANCE_FREEZE_GATE_CATALOG,
  COMPLIANCE_ITEM_CATALOG,
  COMPLIANCE_SIGNOFF_CATALOG,
  buildComplianceAuditTrailManifest,
  buildComplianceChecklistManifest,
  buildComplianceExceptionManifest,
  buildComplianceSignoffManifest,
  buildFreezeGateManifest,
  computeDeclarativeCompliancePass,
  getComplianceItemById,
  getComplianceItemsByOrchestrationRef,
  getFreezeGateByItemRef,
  getSignoffByItemRef,
  isWorkflowComplianceRefsAligned,
} from "./compliance.checklist";
export { assertWorkflowCompliancePass, buildWorkflowCompliance } from "./compliance.builder";
export {
  V71_WORKFLOW_COMPLIANCE_FREEZE_VERSION,
  V71_WORKFLOW_COMPLIANCE_VERSION,
} from "./workflow.compliance";
export type {
  ComplianceAuditTrail,
  ComplianceException,
  ComplianceItem,
  ComplianceSignoff,
  FreezeGate,
  WorkflowComplianceReport,
  WorkflowComplianceSignals,
} from "./workflow.compliance";

import { buildWorkflowCompliance } from "./compliance.builder";
import type {
  WorkflowComplianceReport,
  WorkflowComplianceSignals,
} from "./workflow.compliance";

export function runWorkflowCompliance(input?: {
  deploymentId?: string;
  signals?: WorkflowComplianceSignals;
}): WorkflowComplianceReport {
  return buildWorkflowCompliance(input);
}

export function formatWorkflowComplianceSummary(
  report: WorkflowComplianceReport,
): string {
  const lines = [
    "V71 Workflow Compliance",
    `  ready: ${report.complianceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  workflow-lifecycle: ${report.workflowLifecycleVersion} (ready=${report.workflowLifecycleReady})`,
    `  checklist items: ${report.checklist.itemCount}`,
    `  passed: ${report.checklist.passedCount}`,
    `  freeze gates: ${report.freezeGates.gateCount}`,
    `  signoffs: ${report.signoffs.entryCount}`,
  ];
  return lines.join("\n");
}

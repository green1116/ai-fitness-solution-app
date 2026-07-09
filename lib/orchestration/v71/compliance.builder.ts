/**
 * V71 P7 — Workflow compliance builder (read-only)
 */
import {
  buildComplianceAuditTrailManifest,
  buildComplianceChecklistManifest,
  buildComplianceExceptionManifest,
  buildComplianceSignoffManifest,
  buildFreezeGateManifest,
  isWorkflowComplianceRefsAligned,
} from "./compliance.checklist";
import type {
  WorkflowComplianceReport,
  WorkflowComplianceSignals,
} from "./workflow.compliance";
import {
  V71_WORKFLOW_COMPLIANCE_FREEZE_VERSION,
  V71_WORKFLOW_COMPLIANCE_VERSION,
} from "./workflow.compliance";
import { buildWorkflowLifecycle } from "./lifecycle.builder";
import { V71_WORKFLOW_LIFECYCLE_VERSION } from "./lifecycle.management";

const DEFAULT_SIGNALS: WorkflowComplianceSignals = {
  workflowLifecycleReady: true,
  checklistComplete: true,
  exceptionsComplete: true,
  auditTrailsComplete: true,
  freezeGatesComplete: true,
  signoffsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildWorkflowCompliance(input?: {
  deploymentId?: string;
  signals?: WorkflowComplianceSignals;
}): WorkflowComplianceReport {
  const deploymentId = input?.deploymentId ?? "v71-workflow-compliance-default";

  const workflowLifecycle = buildWorkflowLifecycle({ deploymentId });
  const checklist = buildComplianceChecklistManifest();
  const exceptions = buildComplianceExceptionManifest();
  const auditTrails = buildComplianceAuditTrailManifest();
  const freezeGates = buildFreezeGateManifest();
  const signoffs = buildComplianceSignoffManifest();
  const refsAligned = isWorkflowComplianceRefsAligned();

  const signals: WorkflowComplianceSignals = {
    ...DEFAULT_SIGNALS,
    workflowLifecycleReady: workflowLifecycle.lifecycleReady,
    checklistComplete: checklist.checklistComplete,
    exceptionsComplete: exceptions.catalogComplete,
    auditTrailsComplete: auditTrails.catalogComplete,
    freezeGatesComplete: freezeGates.catalogComplete,
    signoffsComplete: signoffs.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V71_WORKFLOW_COMPLIANCE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const complianceReady =
    workflowLifecycle.lifecycleReady &&
    checklist.checklistComplete &&
    exceptions.catalogComplete &&
    auditTrails.catalogComplete &&
    freezeGates.catalogComplete &&
    signoffs.catalogComplete &&
    refsAligned &&
    signals.workflowLifecycleReady !== false;

  return {
    version: V71_WORKFLOW_COMPLIANCE_VERSION,
    freezeVersion: V71_WORKFLOW_COMPLIANCE_FREEZE_VERSION,
    reportId: `workflow-compliance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    workflowLifecycleVersion: V71_WORKFLOW_LIFECYCLE_VERSION,
    workflowLifecycleReady: workflowLifecycle.lifecycleReady,
    checklist,
    exceptions,
    auditTrails,
    freezeGates,
    signoffs,
    complianceReady,
    readinessScore: complianceReady ? 100 : 0,
    summary: [
      `workflow-compliance ready=${complianceReady}`,
      `items=${checklist.itemCount}`,
      `passed=${checklist.passedCount}`,
      `exceptions=${exceptions.entryCount}`,
      `audits=${auditTrails.entryCount}`,
      `gates=${freezeGates.gateCount}`,
      `signoffs=${signoffs.entryCount}`,
      `refsAligned=${refsAligned}`,
      `lifecycle=${workflowLifecycle.lifecycleReady}`,
    ].join(" "),
  };
}

export function assertWorkflowCompliancePass(
  report: WorkflowComplianceReport,
): asserts report is WorkflowComplianceReport & { complianceReady: true } {
  if (!report.complianceReady) {
    throw new Error(`V71 workflow compliance not ready: ${report.summary}`);
  }
}

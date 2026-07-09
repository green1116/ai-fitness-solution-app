/**
 * V71 P5 — Workflow governance builder (read-only)
 */
import { buildWorkflowCompatibility } from "./compatibility.builder";
import { V71_WORKFLOW_COMPATIBILITY_VERSION } from "./workflow.compatibility";
import {
  buildEscalationManifest,
  buildFreezeGateManifest,
  buildGovernanceAuditTrailManifest,
  buildGovernanceExceptionManifest,
  buildGovernanceRuleManifest,
  buildReviewManifest,
  buildSignoffManifest,
  isWorkflowGovernanceRefsAligned,
} from "./governance.rules";
import type {
  WorkflowGovernanceReport,
  WorkflowGovernanceSignals,
} from "./workflow.governance";
import {
  V71_WORKFLOW_GOVERNANCE_FREEZE_VERSION,
  V71_WORKFLOW_GOVERNANCE_VERSION,
} from "./workflow.governance";

const DEFAULT_SIGNALS: WorkflowGovernanceSignals = {
  workflowCompatibilityReady: true,
  rulesComplete: true,
  reviewsComplete: true,
  exceptionsComplete: true,
  escalationsComplete: true,
  auditTrailsComplete: true,
  freezeGatesComplete: true,
  signoffsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildWorkflowGovernance(input?: {
  deploymentId?: string;
  signals?: WorkflowGovernanceSignals;
}): WorkflowGovernanceReport {
  const deploymentId = input?.deploymentId ?? "v71-workflow-governance-default";

  const workflowCompatibility = buildWorkflowCompatibility({ deploymentId });
  const rules = buildGovernanceRuleManifest();
  const reviews = buildReviewManifest();
  const exceptions = buildGovernanceExceptionManifest();
  const escalations = buildEscalationManifest();
  const auditTrails = buildGovernanceAuditTrailManifest();
  const freezeGates = buildFreezeGateManifest();
  const signoffs = buildSignoffManifest();
  const refsAligned = isWorkflowGovernanceRefsAligned();

  const signals: WorkflowGovernanceSignals = {
    ...DEFAULT_SIGNALS,
    workflowCompatibilityReady: workflowCompatibility.compatibilityReady,
    rulesComplete: rules.catalogComplete,
    reviewsComplete: reviews.catalogComplete,
    exceptionsComplete: exceptions.catalogComplete,
    escalationsComplete: escalations.catalogComplete,
    auditTrailsComplete: auditTrails.catalogComplete,
    freezeGatesComplete: freezeGates.catalogComplete,
    signoffsComplete: signoffs.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V71_WORKFLOW_GOVERNANCE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const governanceReady =
    workflowCompatibility.compatibilityReady &&
    rules.catalogComplete &&
    reviews.catalogComplete &&
    exceptions.catalogComplete &&
    escalations.catalogComplete &&
    auditTrails.catalogComplete &&
    freezeGates.catalogComplete &&
    signoffs.catalogComplete &&
    refsAligned &&
    signals.workflowCompatibilityReady !== false;

  return {
    version: V71_WORKFLOW_GOVERNANCE_VERSION,
    freezeVersion: V71_WORKFLOW_GOVERNANCE_FREEZE_VERSION,
    reportId: `workflow-governance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    workflowCompatibilityVersion: V71_WORKFLOW_COMPATIBILITY_VERSION,
    workflowCompatibilityReady: workflowCompatibility.compatibilityReady,
    rules,
    reviews,
    exceptions,
    escalations,
    auditTrails,
    freezeGates,
    signoffs,
    governanceReady,
    readinessScore: governanceReady ? 100 : 0,
    summary: [
      `workflow-governance ready=${governanceReady}`,
      `rules=${rules.ruleCount}`,
      `reviews=${reviews.entryCount}`,
      `exceptions=${exceptions.entryCount}`,
      `escalations=${escalations.entryCount}`,
      `audits=${auditTrails.entryCount}`,
      `freezeGates=${freezeGates.entryCount}`,
      `signoffs=${signoffs.entryCount}`,
      `refsAligned=${refsAligned}`,
      `compatibility=${workflowCompatibility.compatibilityReady}`,
    ].join(" "),
  };
}

export function assertWorkflowGovernancePass(
  report: WorkflowGovernanceReport,
): asserts report is WorkflowGovernanceReport & { governanceReady: true } {
  if (!report.governanceReady) {
    throw new Error(`V71 workflow governance not ready: ${report.summary}`);
  }
}

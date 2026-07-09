/**
 * V71 P4 — Workflow compatibility builder (read-only)
 */
import {
  buildCompatibilityConstraintManifest,
  buildCompatibilityMatrix,
  buildWorkflowVersionPairManifest,
  isWorkflowCompatibilityRefsAligned,
} from "./compatibility.matrix";
import { buildWorkflowPolicy } from "./policy.builder";
import { V71_WORKFLOW_POLICY_VERSION } from "./workflow.policy";
import type {
  WorkflowCompatibilityReport,
  WorkflowCompatibilitySignals,
} from "./workflow.compatibility";
import {
  V71_WORKFLOW_COMPATIBILITY_FREEZE_VERSION,
  V71_WORKFLOW_COMPATIBILITY_VERSION,
} from "./workflow.compatibility";

const DEFAULT_SIGNALS: WorkflowCompatibilitySignals = {
  workflowPolicyReady: true,
  pairsComplete: true,
  constraintsComplete: true,
  matrixComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildWorkflowCompatibility(input?: {
  deploymentId?: string;
  signals?: WorkflowCompatibilitySignals;
}): WorkflowCompatibilityReport {
  const deploymentId = input?.deploymentId ?? "v71-workflow-compatibility-default";

  const workflowPolicy = buildWorkflowPolicy({ deploymentId });
  const pairs = buildWorkflowVersionPairManifest();
  const constraints = buildCompatibilityConstraintManifest();
  const matrix = buildCompatibilityMatrix();
  const refsAligned = isWorkflowCompatibilityRefsAligned();

  const signals: WorkflowCompatibilitySignals = {
    ...DEFAULT_SIGNALS,
    workflowPolicyReady: workflowPolicy.policyReady,
    pairsComplete: pairs.catalogComplete,
    constraintsComplete: constraints.catalogComplete,
    matrixComplete: matrix.matrixComplete,
    refsAligned,
    freezeVersionDeclared: V71_WORKFLOW_COMPATIBILITY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const compatibilityReady =
    workflowPolicy.policyReady &&
    pairs.catalogComplete &&
    constraints.catalogComplete &&
    matrix.matrixComplete &&
    refsAligned &&
    signals.workflowPolicyReady !== false;

  return {
    version: V71_WORKFLOW_COMPATIBILITY_VERSION,
    freezeVersion: V71_WORKFLOW_COMPATIBILITY_FREEZE_VERSION,
    reportId: `workflow-compatibility-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    workflowPolicyVersion: V71_WORKFLOW_POLICY_VERSION,
    workflowPolicyReady: workflowPolicy.policyReady,
    pairs,
    constraints,
    matrix,
    compatibilityReady,
    readinessScore: compatibilityReady ? 100 : 0,
    summary: [
      `workflow-compatibility ready=${compatibilityReady}`,
      `pairs=${pairs.pairCount}`,
      `constraints=${constraints.entryCount}`,
      `matrix=${matrix.rowCount}`,
      `compatible=${matrix.compatibleCount}`,
      `refsAligned=${refsAligned}`,
      `policy=${workflowPolicy.policyReady}`,
    ].join(" "),
  };
}

export function assertWorkflowCompatibilityPass(
  report: WorkflowCompatibilityReport,
): asserts report is WorkflowCompatibilityReport & { compatibilityReady: true } {
  if (!report.compatibilityReady) {
    throw new Error(`V71 workflow compatibility not ready: ${report.summary}`);
  }
}

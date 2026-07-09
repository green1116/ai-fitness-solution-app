/**
 * V71 P6 — Workflow lifecycle builder (read-only)
 */
import {
  buildLifecycleStateManifest,
  buildLifecycleTransitionManifest,
  buildSupportPolicyManifest,
  isWorkflowLifecycleRefsAligned,
} from "./lifecycle.states";
import type {
  WorkflowLifecycleReport,
  WorkflowLifecycleSignals,
} from "./lifecycle.management";
import {
  V71_WORKFLOW_LIFECYCLE_FREEZE_VERSION,
  V71_WORKFLOW_LIFECYCLE_VERSION,
} from "./lifecycle.management";
import { buildWorkflowGovernance } from "./governance.builder";
import { V71_WORKFLOW_GOVERNANCE_VERSION } from "./workflow.governance";

const DEFAULT_SIGNALS: WorkflowLifecycleSignals = {
  workflowGovernanceReady: true,
  statesComplete: true,
  transitionsComplete: true,
  supportPoliciesComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildWorkflowLifecycle(input?: {
  deploymentId?: string;
  signals?: WorkflowLifecycleSignals;
}): WorkflowLifecycleReport {
  const deploymentId = input?.deploymentId ?? "v71-workflow-lifecycle-default";

  const workflowGovernance = buildWorkflowGovernance({ deploymentId });
  const states = buildLifecycleStateManifest();
  const transitions = buildLifecycleTransitionManifest();
  const supportPolicies = buildSupportPolicyManifest();
  const refsAligned = isWorkflowLifecycleRefsAligned();

  const signals: WorkflowLifecycleSignals = {
    ...DEFAULT_SIGNALS,
    workflowGovernanceReady: workflowGovernance.governanceReady,
    statesComplete: states.catalogComplete,
    transitionsComplete: transitions.catalogComplete,
    supportPoliciesComplete: supportPolicies.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V71_WORKFLOW_LIFECYCLE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const lifecycleReady =
    workflowGovernance.governanceReady &&
    states.catalogComplete &&
    transitions.catalogComplete &&
    supportPolicies.catalogComplete &&
    refsAligned &&
    signals.workflowGovernanceReady !== false;

  return {
    version: V71_WORKFLOW_LIFECYCLE_VERSION,
    freezeVersion: V71_WORKFLOW_LIFECYCLE_FREEZE_VERSION,
    reportId: `workflow-lifecycle-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    workflowGovernanceVersion: V71_WORKFLOW_GOVERNANCE_VERSION,
    workflowGovernanceReady: workflowGovernance.governanceReady,
    states,
    transitions,
    supportPolicies,
    lifecycleReady,
    readinessScore: lifecycleReady ? 100 : 0,
    summary: [
      `workflow-lifecycle ready=${lifecycleReady}`,
      `states=${states.stateCount}`,
      `transitions=${transitions.entryCount}`,
      `supportPolicies=${supportPolicies.entryCount}`,
      `refsAligned=${refsAligned}`,
      `governance=${workflowGovernance.governanceReady}`,
    ].join(" "),
  };
}

export function assertWorkflowLifecyclePass(
  report: WorkflowLifecycleReport,
): asserts report is WorkflowLifecycleReport & { lifecycleReady: true } {
  if (!report.lifecycleReady) {
    throw new Error(`V71 workflow lifecycle not ready: ${report.summary}`);
  }
}

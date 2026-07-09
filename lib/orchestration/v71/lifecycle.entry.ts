/**
 * V71 P6 — Workflow lifecycle entry (read-only)
 */
export {
  LIFECYCLE_STATE_CATALOG,
  LIFECYCLE_TRANSITION_CATALOG,
  SUPPORT_POLICY_CATALOG,
  buildLifecycleStateManifest,
  buildLifecycleTransitionManifest,
  buildSupportPolicyManifest,
  computeDeclarativeLifecycleTerminal,
  getLifecycleStateById,
  getLifecycleStateByOrchestrationRef,
  getLifecycleStatesByKind,
  getSupportPolicyById,
  getTransitionsByOrchestrationRef,
  isWorkflowLifecycleRefsAligned,
} from "./lifecycle.states";
export { assertWorkflowLifecyclePass, buildWorkflowLifecycle } from "./lifecycle.builder";
export {
  V71_WORKFLOW_LIFECYCLE_FREEZE_VERSION,
  V71_WORKFLOW_LIFECYCLE_VERSION,
} from "./lifecycle.management";
export type {
  LifecycleState,
  LifecycleTransition,
  SupportPolicy,
  WorkflowLifecycleReport,
  WorkflowLifecycleSignals,
} from "./lifecycle.management";

import { buildWorkflowLifecycle } from "./lifecycle.builder";
import type {
  WorkflowLifecycleReport,
  WorkflowLifecycleSignals,
} from "./lifecycle.management";

export function runWorkflowLifecycle(input?: {
  deploymentId?: string;
  signals?: WorkflowLifecycleSignals;
}): WorkflowLifecycleReport {
  return buildWorkflowLifecycle(input);
}

export function formatWorkflowLifecycleSummary(report: WorkflowLifecycleReport): string {
  const lines = [
    "V71 Workflow Lifecycle",
    `  ready: ${report.lifecycleReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  workflow-governance: ${report.workflowGovernanceVersion} (ready=${report.workflowGovernanceReady})`,
    `  states: ${report.states.stateCount}`,
    `  transitions: ${report.transitions.entryCount}`,
    `  support policies: ${report.supportPolicies.entryCount}`,
  ];
  return lines.join("\n");
}

/**
 * V71 P4 — Workflow compatibility entry (read-only)
 */
export {
  COMPATIBILITY_CONSTRAINT_CATALOG,
  WORKFLOW_VERSION_PAIR_CATALOG,
  buildCompatibilityConstraintManifest,
  buildCompatibilityMatrix,
  buildWorkflowVersionPairManifest,
  computeDeclarativeCompatibilityPass,
  getCompatibilityConstraintById,
  getWorkflowVersionPairById,
  getWorkflowVersionPairsBySourceRef,
  isWorkflowCompatibilityRefsAligned,
} from "./compatibility.matrix";
export {
  assertWorkflowCompatibilityPass,
  buildWorkflowCompatibility,
} from "./compatibility.builder";
export {
  V71_WORKFLOW_COMPATIBILITY_FREEZE_VERSION,
  V71_WORKFLOW_COMPATIBILITY_VERSION,
} from "./workflow.compatibility";
export type {
  CompatibilityConstraint,
  CompatibilityMatrix,
  WorkflowCompatibilityReport,
  WorkflowCompatibilitySignals,
  WorkflowVersionPair,
} from "./workflow.compatibility";

import { buildWorkflowCompatibility } from "./compatibility.builder";
import type {
  WorkflowCompatibilityReport,
  WorkflowCompatibilitySignals,
} from "./workflow.compatibility";

export function runWorkflowCompatibility(input?: {
  deploymentId?: string;
  signals?: WorkflowCompatibilitySignals;
}): WorkflowCompatibilityReport {
  return buildWorkflowCompatibility(input);
}

export function formatWorkflowCompatibilitySummary(
  report: WorkflowCompatibilityReport,
): string {
  const lines = [
    "V71 Workflow Compatibility",
    `  ready: ${report.compatibilityReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  workflow-policy: ${report.workflowPolicyVersion} (ready=${report.workflowPolicyReady})`,
    `  pairs: ${report.pairs.pairCount}`,
    `  constraints: ${report.constraints.entryCount}`,
    `  matrix rows: ${report.matrix.rowCount}`,
    `  compatible: ${report.matrix.compatibleCount}`,
    `  incompatible: ${report.matrix.incompatibleCount}`,
  ];
  return lines.join("\n");
}

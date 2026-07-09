/**
 * V71 P8 — Workflow sign-off entry (read-only)
 */
export {
  WORKFLOW_GATE_CATALOG,
  buildGateSummary,
  getGateSummaryByPhase,
} from "./release.gate.summary";
export {
  ROLLBACK_SNAPSHOT_INDEX,
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
} from "./rollback.snapshot.index";
export {
  V71_WORKFLOW_LAYER_VERSION_LOCK,
  isWorkflowLayerVersionLockIntact,
  workflowVersionLockMatchesExpected,
} from "./freeze.lock";
export { buildFreezeChecklist, buildFreezeChecklistManifest } from "./freeze.checklist";
export { collectWorkflowPhaseReadiness } from "./readiness.collector";
export { buildWorkflowFreezeManifest } from "./signoff.manifest";
export { assertWorkflowSignoffPass, buildWorkflowSignoff } from "./signoff.builder";
export {
  V71_WORKFLOW_FREEZE_VERSION,
  V71_WORKFLOW_SIGNOFF_VERSION,
} from "./signoff.types";
export type {
  FreezeChecklist,
  GateSummary,
  LockVersion,
  ReadinessReport,
  RollbackSnapshot,
  SignoffState,
  WorkflowSignoffReport,
  WorkflowSignoffSignals,
} from "./signoff.types";

import { buildWorkflowSignoff } from "./signoff.builder";
import type { WorkflowSignoffReport, WorkflowSignoffSignals } from "./signoff.types";

export function runWorkflowSignoff(input?: {
  deploymentId?: string;
  signals?: WorkflowSignoffSignals;
}): WorkflowSignoffReport {
  return buildWorkflowSignoff(input);
}

export function closeV71Orchestration(input?: {
  deploymentId?: string;
  signals?: WorkflowSignoffSignals;
}): WorkflowSignoffReport {
  return buildWorkflowSignoff(input);
}

export function formatWorkflowSignoffSummary(report: WorkflowSignoffReport): string {
  return report.closingSummary;
}

/**
 * V78 P8 — Execution sign-off entry (read-only)
 */
export { buildFreezeChecklist, buildFreezeChecklistManifest } from "./freeze.checklist";
export {
  V78_EXECUTION_LAYER_VERSION_LOCK,
  executionVersionLockMatchesExpected,
  isExecutionLayerVersionLockIntact,
} from "./freeze.lock";
export { collectExecutionPhaseReadiness } from "./readiness.collector";
export {
  EXECUTION_GATE_CATALOG,
  buildGateSummary,
  getGateSummaryByPhase,
} from "./release.gate.summary";
export {
  ROLLBACK_SNAPSHOT_INDEX,
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
} from "./rollback.snapshot.index";
export { buildExecutionFreezeManifest } from "./signoff.manifest";
export { assertExecutionSignoffPass, buildExecutionSignoff } from "./signoff.builder";
export { V78_EXECUTION_FREEZE_VERSION, V78_EXECUTION_SIGNOFF_VERSION } from "./signoff.types";
export type {
  Blocked,
  ExecutionFreezeManifest,
  ExecutionSignoffPhase,
  ExecutionSignoffReport,
  ExecutionSignoffSignals,
  Fail,
  FreezeChecklist,
  FreezeState,
  GateSummary,
  LockVersion,
  Pass,
  ReadinessReport,
  Ready,
  RollbackSnapshot,
  SignoffState,
} from "./signoff.types";

import { buildExecutionSignoff } from "./signoff.builder";
import type { ExecutionSignoffReport, ExecutionSignoffSignals } from "./signoff.types";

export function runExecutionSignoff(input?: {
  deploymentId?: string;
  signals?: ExecutionSignoffSignals;
}): ExecutionSignoffReport {
  return buildExecutionSignoff(input);
}

export function closeV78Execution(input?: {
  deploymentId?: string;
  signals?: ExecutionSignoffSignals;
}): ExecutionSignoffReport {
  return buildExecutionSignoff(input);
}

export function formatExecutionSignoffSummary(report: ExecutionSignoffReport): string {
  return report.closingSummary;
}

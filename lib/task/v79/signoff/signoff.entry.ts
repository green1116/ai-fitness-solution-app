/**
 * V79 P8 — Task sign-off entry (read-only)
 */
export { buildFreezeChecklist, buildFreezeChecklistManifest } from "./freeze.checklist";
export {
  V79_TASK_LAYER_VERSION_LOCK,
  isTaskLayerVersionLockIntact,
  taskVersionLockMatchesExpected,
} from "./freeze.lock";
export { collectTaskPhaseReadiness } from "./readiness.collector";
export {
  TASK_GATE_CATALOG,
  buildGateSummary,
  getGateSummaryByPhase,
} from "./release.gate.summary";
export {
  ROLLBACK_SNAPSHOT_INDEX,
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
} from "./rollback.snapshot.index";
export { buildTaskFreezeManifest } from "./signoff.manifest";
export { assertTaskSignoffPass, buildTaskSignoff } from "./signoff.builder";
export { V79_TASK_FREEZE_VERSION, V79_TASK_SIGNOFF_VERSION } from "./signoff.types";
export type {
  Blocked,
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
  TaskFreezeManifest,
  TaskSignoffPhase,
  TaskSignoffReport,
  TaskSignoffSignals,
} from "./signoff.types";

import { buildTaskSignoff } from "./signoff.builder";
import type { TaskSignoffReport, TaskSignoffSignals } from "./signoff.types";

export function runTaskSignoff(input?: {
  deploymentId?: string;
  signals?: TaskSignoffSignals;
}): TaskSignoffReport {
  return buildTaskSignoff(input);
}

export function closeV79Task(input?: {
  deploymentId?: string;
  signals?: TaskSignoffSignals;
}): TaskSignoffReport {
  return buildTaskSignoff(input);
}

export function formatTaskSignoffSummary(report: TaskSignoffReport): string {
  return report.closingSummary;
}

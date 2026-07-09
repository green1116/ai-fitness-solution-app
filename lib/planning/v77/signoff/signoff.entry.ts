/**
 * V77 P8 — Planning sign-off entry (read-only)
 */
export { buildFreezeChecklist, buildFreezeChecklistManifest } from "./freeze.checklist";
export {
  V77_PLANNING_LAYER_VERSION_LOCK,
  isPlanningLayerVersionLockIntact,
  planningVersionLockMatchesExpected,
} from "./freeze.lock";
export { collectPlanningPhaseReadiness } from "./readiness.collector";
export {
  PLANNING_GATE_CATALOG,
  buildGateSummary,
  getGateSummaryByPhase,
} from "./release.gate.summary";
export {
  ROLLBACK_SNAPSHOT_INDEX,
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
} from "./rollback.snapshot.index";
export { buildPlanningFreezeManifest } from "./signoff.manifest";
export { assertPlanningSignoffPass, buildPlanningSignoff } from "./signoff.builder";
export { V77_PLANNING_FREEZE_VERSION, V77_PLANNING_SIGNOFF_VERSION } from "./signoff.types";
export type {
  Blocked,
  Fail,
  FreezeChecklist,
  FreezeState,
  GateSummary,
  LockVersion,
  Pass,
  PlanningFreezeManifest,
  PlanningSignoffPhase,
  PlanningSignoffReport,
  PlanningSignoffSignals,
  ReadinessReport,
  Ready,
  RollbackSnapshot,
  SignoffState,
} from "./signoff.types";

import { buildPlanningSignoff } from "./signoff.builder";
import type { PlanningSignoffReport, PlanningSignoffSignals } from "./signoff.types";

export function runPlanningSignoff(input?: {
  deploymentId?: string;
  signals?: PlanningSignoffSignals;
}): PlanningSignoffReport {
  return buildPlanningSignoff(input);
}

export function closeV77Planning(input?: {
  deploymentId?: string;
  signals?: PlanningSignoffSignals;
}): PlanningSignoffReport {
  return buildPlanningSignoff(input);
}

export function formatPlanningSignoffSummary(report: PlanningSignoffReport): string {
  return report.closingSummary;
}

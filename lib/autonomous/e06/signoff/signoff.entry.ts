/**
 * E06-P8 — Autonomous Enterprise OS sign-off entry (read-only)
 */

export {
  buildFreezeChecklist,
  buildFreezeChecklistManifest,
} from "./freeze.checklist";
export {
  autonomousVersionLockMatchesExpected,
  E06_AUTONOMOUS_LAYER_VERSION_LOCK,
  isAutonomousLayerVersionLockIntact,
} from "./freeze.lock";
export {
  collectAgentBaseline,
  collectAutonomousPhaseReadiness,
} from "./readiness.collector";
export {
  AUTONOMOUS_GATE_CATALOG,
  buildGateSummary,
  getGateSummaryByPhase,
} from "./release.gate.summary";
export {
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
  ROLLBACK_SNAPSHOT_INDEX,
} from "./rollback.snapshot.index";
export { buildAutonomousFreezeManifest } from "./signoff.manifest";
export {
  assertAutonomousSignoffPass,
  buildAutonomousSignoff,
} from "./signoff.builder";
export {
  E06_AUTONOMOUS_OS_FREEZE_VERSION,
  E06_AUTONOMOUS_SIGNOFF_VERSION,
} from "./signoff.types";
export type {
  AgentBaselineSnapshot,
  AutonomousFreezeManifest,
  AutonomousSignoffPhase,
  AutonomousSignoffReport,
  AutonomousSignoffSignals,
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
} from "./signoff.types";

import { buildAutonomousSignoff } from "./signoff.builder";
import type {
  AutonomousSignoffReport,
  AutonomousSignoffSignals,
} from "./signoff.types";

export function runAutonomousSignoff(input?: {
  deploymentId?: string;
  signals?: AutonomousSignoffSignals;
}): AutonomousSignoffReport {
  return buildAutonomousSignoff(input);
}

export function closeE06AutonomousEnterpriseOS(input?: {
  deploymentId?: string;
  signals?: AutonomousSignoffSignals;
}): AutonomousSignoffReport {
  return buildAutonomousSignoff(input);
}

export function formatAutonomousSignoffSummary(
  report: AutonomousSignoffReport,
): string {
  return report.closingSummary;
}

/**
 * V74 P8 — Decision sign-off entry (read-only)
 */
export { buildFreezeChecklist, buildFreezeChecklistManifest } from "./freeze.checklist";
export {
  V74_DECISION_LAYER_VERSION_LOCK,
  decisionVersionLockMatchesExpected,
  isDecisionLayerVersionLockIntact,
} from "./freeze.lock";
export { collectDecisionPhaseReadiness } from "./readiness.collector";
export {
  DECISION_GATE_CATALOG,
  buildGateSummary,
  getGateSummaryByPhase,
} from "./release.gate.summary";
export {
  ROLLBACK_SNAPSHOT_INDEX,
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
} from "./rollback.snapshot.index";
export { buildDecisionFreezeManifest } from "./signoff.manifest";
export { assertDecisionSignoffPass, buildDecisionSignoff } from "./signoff.builder";
export {
  V74_DECISION_FREEZE_VERSION,
  V74_DECISION_SIGNOFF_VERSION,
} from "./signoff.types";
export type {
  Blocked,
  DecisionSignoffReport,
  DecisionSignoffSignals,
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

import { buildDecisionSignoff } from "./signoff.builder";
import type { DecisionSignoffReport, DecisionSignoffSignals } from "./signoff.types";

export function runDecisionSignoff(input?: {
  deploymentId?: string;
  signals?: DecisionSignoffSignals;
}): DecisionSignoffReport {
  return buildDecisionSignoff(input);
}

export function closeV74Decision(input?: {
  deploymentId?: string;
  signals?: DecisionSignoffSignals;
}): DecisionSignoffReport {
  return buildDecisionSignoff(input);
}

export function formatDecisionSignoffSummary(report: DecisionSignoffReport): string {
  return report.closingSummary;
}

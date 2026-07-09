/**
 * V76 P8 — Collaboration sign-off entry (read-only)
 */
export { buildFreezeChecklist, buildFreezeChecklistManifest } from "./freeze.checklist";
export {
  V76_COLLABORATION_LAYER_VERSION_LOCK,
  collaborationVersionLockMatchesExpected,
  isCollaborationLayerVersionLockIntact,
} from "./freeze.lock";
export { collectCollaborationPhaseReadiness } from "./readiness.collector";
export {
  COLLABORATION_GATE_CATALOG,
  buildGateSummary,
  getGateSummaryByPhase,
} from "./release.gate.summary";
export {
  ROLLBACK_SNAPSHOT_INDEX,
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
} from "./rollback.snapshot.index";
export { buildCollaborationFreezeManifest } from "./signoff.manifest";
export { assertCollaborationSignoffPass, buildCollaborationSignoff } from "./signoff.builder";
export { V76_COLLABORATION_FREEZE_VERSION, V76_COLLABORATION_SIGNOFF_VERSION } from "./signoff.types";
export type {
  CollaborationFreezeManifest,
  CollaborationSignoffPhase,
  CollaborationSignoffReport,
  CollaborationSignoffSignals,
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

import { buildCollaborationSignoff } from "./signoff.builder";
import type { CollaborationSignoffReport, CollaborationSignoffSignals } from "./signoff.types";

export function runCollaborationSignoff(input?: {
  deploymentId?: string;
  signals?: CollaborationSignoffSignals;
}): CollaborationSignoffReport {
  return buildCollaborationSignoff(input);
}

export function closeV76Collaboration(input?: {
  deploymentId?: string;
  signals?: CollaborationSignoffSignals;
}): CollaborationSignoffReport {
  return buildCollaborationSignoff(input);
}

export function formatCollaborationSignoffSummary(report: CollaborationSignoffReport): string {
  return report.closingSummary;
}

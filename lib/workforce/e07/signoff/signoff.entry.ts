/**
 * E07-P8 — Digital Workforce Platform sign-off entry (read-only)
 */

export {
  buildFreezeChecklist,
  buildFreezeChecklistManifest,
} from "./freeze.checklist";
export {
  E07_WORKFORCE_LAYER_VERSION_LOCK,
  isWorkforceLayerVersionLockIntact,
  workforceVersionLockMatchesExpected,
} from "./freeze.lock";
export {
  collectOrganizationBaseline,
  collectWorkforcePhaseReadiness,
} from "./readiness.collector";
export {
  WORKFORCE_GATE_CATALOG,
  buildGateSummary,
  getGateSummaryByPhase,
} from "./release.gate.summary";
export {
  ROLLBACK_SNAPSHOT_INDEX,
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
} from "./rollback.snapshot.index";
export { buildWorkforceFreezeManifest } from "./signoff.manifest";
export {
  assertWorkforceSignoffPass,
  buildWorkforceSignoff,
} from "./signoff.builder";
export {
  E07_WORKFORCE_PLATFORM_FREEZE_VERSION,
  E07_WORKFORCE_SIGNOFF_VERSION,
} from "./signoff.types";
export type {
  Blocked,
  Fail,
  FreezeChecklist,
  FreezeState,
  GateSummary,
  LockVersion,
  OrganizationBaselineSnapshot,
  Pass,
  ReadinessReport,
  Ready,
  RollbackSnapshot,
  SignoffState,
  WorkforceFreezeManifest,
  WorkforceSignoffPhase,
  WorkforceSignoffReport,
  WorkforceSignoffSignals,
} from "./signoff.types";

import { buildWorkforceSignoff } from "./signoff.builder";
import type {
  WorkforceSignoffReport,
  WorkforceSignoffSignals,
} from "./signoff.types";

export function runWorkforceSignoff(input?: {
  deploymentId?: string;
  signals?: WorkforceSignoffSignals;
}): WorkforceSignoffReport {
  return buildWorkforceSignoff(input);
}

export function closeE07DigitalWorkforcePlatform(input?: {
  deploymentId?: string;
  signals?: WorkforceSignoffSignals;
}): WorkforceSignoffReport {
  return buildWorkforceSignoff(input);
}

export function formatWorkforceSignoffSummary(
  report: WorkforceSignoffReport,
): string {
  return report.closingSummary;
}

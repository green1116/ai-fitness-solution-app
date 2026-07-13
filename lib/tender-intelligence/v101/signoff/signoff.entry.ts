/**
 * E01-P8 — Enterprise Tender Intelligence sign-off entry (read-only)
 */

export { buildFreezeChecklist, buildFreezeChecklistManifest } from "./freeze.checklist";
export {
  V101_TENDER_LAYER_VERSION_LOCK,
  isTenderLayerVersionLockIntact,
  tenderVersionLockMatchesExpected,
} from "./freeze.lock";
export {
  collectDeliveryBaseline,
  collectTenderPhaseReadiness,
} from "./readiness.collector";
export {
  TENDER_GATE_CATALOG,
  buildGateSummary,
  getGateSummaryByPhase,
} from "./release.gate.summary";
export {
  ROLLBACK_SNAPSHOT_INDEX,
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
} from "./rollback.snapshot.index";
export { buildTenderFreezeManifest } from "./signoff.manifest";
export { assertTenderSignoffPass, buildTenderSignoff } from "./signoff.builder";
export { V101_TENDER_FREEZE_VERSION, V101_TENDER_SIGNOFF_VERSION } from "./signoff.types";
export type {
  Blocked,
  DeliveryBaselineSnapshot,
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
  TenderFreezeManifest,
  TenderSignoffPhase,
  TenderSignoffReport,
  TenderSignoffSignals,
} from "./signoff.types";

import { buildTenderSignoff } from "./signoff.builder";
import type { TenderSignoffReport, TenderSignoffSignals } from "./signoff.types";

export function runTenderSignoff(input?: {
  deploymentId?: string;
  signals?: TenderSignoffSignals;
}): TenderSignoffReport {
  return buildTenderSignoff(input);
}

export function closeE01TenderIntelligence(input?: {
  deploymentId?: string;
  signals?: TenderSignoffSignals;
}): TenderSignoffReport {
  return buildTenderSignoff(input);
}

export function formatTenderSignoffSummary(report: TenderSignoffReport): string {
  return report.closingSummary;
}

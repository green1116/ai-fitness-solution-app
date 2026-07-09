/**
 * V70 P8 — Delivery sign-off entry (read-only)
 */
export {
  RELEASE_GATE_CATALOG,
  buildGateSummary,
  getGateSummaryByPhase,
} from "./release.gate.summary";
export {
  ROLLBACK_SNAPSHOT_INDEX,
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
} from "./rollback.snapshot.index";
export {
  V70_DELIVERY_LAYER_VERSION_LOCK,
  deliveryVersionLockMatchesExpected,
  isDeliveryLayerVersionLockIntact,
} from "./freeze.lock";
export { buildFreezeChecklist, buildFreezeChecklistManifest } from "./freeze.checklist";
export { collectDeliveryPhaseReadiness } from "./readiness.collector";
export { buildDeliveryFreezeManifest } from "./signoff.manifest";
export { assertDeliverySignoffPass, buildDeliverySignoff } from "./signoff.builder";
export {
  V70_DELIVERY_FREEZE_VERSION,
  V70_DELIVERY_SIGNOFF_VERSION,
} from "./signoff.types";
export type {
  DeliverySignoffReport,
  DeliverySignoffSignals,
  FreezeChecklist,
  GateSummary,
  LockVersion,
  ReadinessReport,
  RollbackSnapshot,
  SignoffState,
} from "./signoff.types";

import { buildDeliverySignoff } from "./signoff.builder";
import type { DeliverySignoffReport, DeliverySignoffSignals } from "./signoff.types";

export function runDeliverySignoff(input?: {
  deploymentId?: string;
  signals?: DeliverySignoffSignals;
}): DeliverySignoffReport {
  return buildDeliverySignoff(input);
}

export function closeV70Delivery(input?: {
  deploymentId?: string;
  signals?: DeliverySignoffSignals;
}): DeliverySignoffReport {
  return buildDeliverySignoff(input);
}

export function formatDeliverySignoffSummary(report: DeliverySignoffReport): string {
  return report.closingSummary;
}

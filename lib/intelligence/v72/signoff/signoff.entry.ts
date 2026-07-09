/**
 * V72 P8 — Intelligence sign-off entry (read-only)
 */
export {
  INTELLIGENCE_GATE_CATALOG,
  buildGateSummary,
  getGateSummaryByPhase,
} from "./release.gate.summary";
export {
  ROLLBACK_SNAPSHOT_INDEX,
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
} from "./rollback.snapshot.index";
export {
  V72_INTELLIGENCE_LAYER_VERSION_LOCK,
  intelligenceVersionLockMatchesExpected,
  isIntelligenceLayerVersionLockIntact,
} from "./freeze.lock";
export { buildFreezeChecklist, buildFreezeChecklistManifest } from "./freeze.checklist";
export { collectIntelligencePhaseReadiness } from "./readiness.collector";
export { buildIntelligenceFreezeManifest } from "./signoff.manifest";
export { assertIntelligenceSignoffPass, buildIntelligenceSignoff } from "./signoff.builder";
export {
  V72_INTELLIGENCE_FREEZE_VERSION,
  V72_INTELLIGENCE_SIGNOFF_VERSION,
} from "./signoff.types";
export type {
  FreezeChecklist,
  FreezeState,
  GateSummary,
  LockVersion,
  ReadinessReport,
  RollbackSnapshot,
  SignoffState,
  IntelligenceSignoffReport,
  IntelligenceSignoffSignals,
} from "./signoff.types";

import { buildIntelligenceSignoff } from "./signoff.builder";
import type {
  IntelligenceSignoffReport,
  IntelligenceSignoffSignals,
} from "./signoff.types";

export function runIntelligenceSignoff(input?: {
  deploymentId?: string;
  signals?: IntelligenceSignoffSignals;
}): IntelligenceSignoffReport {
  return buildIntelligenceSignoff(input);
}

export function closeV72Intelligence(input?: {
  deploymentId?: string;
  signals?: IntelligenceSignoffSignals;
}): IntelligenceSignoffReport {
  return buildIntelligenceSignoff(input);
}

export function formatIntelligenceSignoffSummary(
  report: IntelligenceSignoffReport,
): string {
  return report.closingSummary;
}

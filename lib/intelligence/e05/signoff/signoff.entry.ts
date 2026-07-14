/**
 * E05-P8 — Enterprise Intelligence Layer sign-off entry (read-only)
 */

export {
  buildFreezeChecklist,
  buildFreezeChecklistManifest,
} from "./freeze.checklist";
export {
  E05_INTELLIGENCE_LAYER_VERSION_LOCK,
  intelligenceVersionLockMatchesExpected,
  isIntelligenceLayerVersionLockIntact,
} from "./freeze.lock";
export {
  collectIntelligencePhaseReadiness,
  collectStrategyBaseline,
} from "./readiness.collector";
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
export { buildIntelligenceFreezeManifest } from "./signoff.manifest";
export {
  assertIntelligenceSignoffPass,
  buildIntelligenceSignoff,
} from "./signoff.builder";
export {
  E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION,
  E05_INTELLIGENCE_SIGNOFF_VERSION,
} from "./signoff.types";
export type {
  Blocked,
  Fail,
  FreezeChecklist,
  FreezeState,
  GateSummary,
  IntelligenceFreezeManifest,
  IntelligenceSignoffPhase,
  IntelligenceSignoffReport,
  IntelligenceSignoffSignals,
  LockVersion,
  Pass,
  ReadinessReport,
  Ready,
  RollbackSnapshot,
  SignoffState,
  StrategyBaselineSnapshot,
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

export function closeE05IntelligenceLayer(input?: {
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

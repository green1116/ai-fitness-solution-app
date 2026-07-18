/**
 * E08-P8 — Autonomous Enterprise Ecosystem Platform sign-off entry (read-only)
 */

export {
  buildFreezeChecklist,
  buildFreezeChecklistManifest,
} from "./freeze.checklist";
export {
  E08_ECOSYSTEM_LAYER_VERSION_LOCK,
  ecosystemVersionLockMatchesExpected,
  isEcosystemLayerVersionLockIntact,
} from "./freeze.lock";
export {
  collectEcosystemPhaseReadiness,
  collectNetworkOsBaseline,
} from "./readiness.collector";
export {
  ECOSYSTEM_GATE_CATALOG,
  buildGateSummary,
  getGateSummaryByPhase,
} from "./release.gate.summary";
export {
  ROLLBACK_SNAPSHOT_INDEX,
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
} from "./rollback.snapshot.index";
export { buildEcosystemFreezeManifest } from "./signoff.manifest";
export {
  assertEcosystemSignoffPass,
  buildEcosystemSignoff,
} from "./signoff.builder";
export {
  E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION,
  E08_ECOSYSTEM_SIGNOFF_VERSION,
} from "./signoff.types";
export type {
  Blocked,
  EcosystemFreezeManifest,
  EcosystemSignoffPhase,
  EcosystemSignoffReport,
  EcosystemSignoffSignals,
  Fail,
  FreezeChecklist,
  FreezeState,
  GateSummary,
  LockVersion,
  NetworkOsBaselineSnapshot,
  Pass,
  ReadinessReport,
  Ready,
  RollbackSnapshot,
  SignoffState,
} from "./signoff.types";

import { buildEcosystemSignoff } from "./signoff.builder";
import type {
  EcosystemSignoffReport,
  EcosystemSignoffSignals,
} from "./signoff.types";

export function runEcosystemSignoff(input?: {
  deploymentId?: string;
  signals?: EcosystemSignoffSignals;
}): EcosystemSignoffReport {
  return buildEcosystemSignoff(input);
}

export function closeE08AutonomousEnterpriseEcosystemPlatform(input?: {
  deploymentId?: string;
  signals?: EcosystemSignoffSignals;
}): EcosystemSignoffReport {
  return buildEcosystemSignoff(input);
}

export function formatEcosystemSignoffSummary(
  report: EcosystemSignoffReport,
): string {
  return report.closingSummary;
}

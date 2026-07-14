/**
 * E04-P8 — Enterprise Business Agent Platform sign-off entry (read-only)
 */

export {
  buildFreezeChecklist,
  buildFreezeChecklistManifest,
} from "./freeze.checklist";
export {
  E04_BUSINESS_AGENT_LAYER_VERSION_LOCK,
  businessAgentVersionLockMatchesExpected,
  isBusinessAgentLayerVersionLockIntact,
} from "./freeze.lock";
export {
  collectBusinessAgentPhaseReadiness,
  collectCollaborationBaseline,
} from "./readiness.collector";
export {
  BUSINESS_AGENT_GATE_CATALOG,
  buildGateSummary,
  getGateSummaryByPhase,
} from "./release.gate.summary";
export {
  ROLLBACK_SNAPSHOT_INDEX,
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
} from "./rollback.snapshot.index";
export { buildBusinessAgentFreezeManifest } from "./signoff.manifest";
export {
  assertBusinessAgentSignoffPass,
  buildBusinessAgentSignoff,
} from "./signoff.builder";
export {
  E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION,
  E04_BUSINESS_AGENT_SIGNOFF_VERSION,
} from "./signoff.types";
export type {
  Blocked,
  BusinessAgentFreezeManifest,
  BusinessAgentSignoffPhase,
  BusinessAgentSignoffReport,
  BusinessAgentSignoffSignals,
  CollaborationBaselineSnapshot,
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

import { buildBusinessAgentSignoff } from "./signoff.builder";
import type {
  BusinessAgentSignoffReport,
  BusinessAgentSignoffSignals,
} from "./signoff.types";

export function runBusinessAgentSignoff(input?: {
  deploymentId?: string;
  signals?: BusinessAgentSignoffSignals;
}): BusinessAgentSignoffReport {
  return buildBusinessAgentSignoff(input);
}

export function closeE04BusinessAgentPlatform(input?: {
  deploymentId?: string;
  signals?: BusinessAgentSignoffSignals;
}): BusinessAgentSignoffReport {
  return buildBusinessAgentSignoff(input);
}

export function formatBusinessAgentSignoffSummary(
  report: BusinessAgentSignoffReport,
): string {
  return report.closingSummary;
}

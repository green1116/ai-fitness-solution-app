/**
 * E02-P8 — Enterprise Tender Knowledge Graph sign-off entry (read-only)
 */

export { buildFreezeChecklist, buildFreezeChecklistManifest } from "./freeze.checklist";
export {
  V102_KNOWLEDGE_LAYER_VERSION_LOCK,
  isKnowledgeLayerVersionLockIntact,
  knowledgeVersionLockMatchesExpected,
} from "./freeze.lock";
export {
  collectKnowledgeDeliveryBaseline,
  collectKnowledgePhaseReadiness,
} from "./readiness.collector";
export {
  KNOWLEDGE_GATE_CATALOG,
  buildGateSummary,
  getGateSummaryByPhase,
} from "./release.gate.summary";
export {
  ROLLBACK_SNAPSHOT_INDEX,
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
} from "./rollback.snapshot.index";
export { buildKnowledgeFreezeManifest } from "./signoff.manifest";
export {
  assertKnowledgeSignoffPass,
  buildKnowledgeSignoff,
} from "./signoff.builder";
export {
  V102_KNOWLEDGE_FREEZE_VERSION,
  V102_KNOWLEDGE_SIGNOFF_VERSION,
} from "./signoff.types";
export type {
  Blocked,
  Fail,
  FreezeChecklist,
  FreezeState,
  GateSummary,
  KnowledgeDeliveryBaselineSnapshot,
  KnowledgeFreezeManifest,
  KnowledgeSignoffPhase,
  KnowledgeSignoffReport,
  KnowledgeSignoffSignals,
  LockVersion,
  Pass,
  ReadinessReport,
  Ready,
  RollbackSnapshot,
  SignoffState,
} from "./signoff.types";

import { buildKnowledgeSignoff } from "./signoff.builder";
import type {
  KnowledgeSignoffReport,
  KnowledgeSignoffSignals,
} from "./signoff.types";

export function runKnowledgeSignoff(input?: {
  deploymentId?: string;
  signals?: KnowledgeSignoffSignals;
}): KnowledgeSignoffReport {
  return buildKnowledgeSignoff(input);
}

export function closeE02TenderKnowledgeGraph(input?: {
  deploymentId?: string;
  signals?: KnowledgeSignoffSignals;
}): KnowledgeSignoffReport {
  return buildKnowledgeSignoff(input);
}

export function formatKnowledgeSignoffSummary(
  report: KnowledgeSignoffReport,
): string {
  return report.closingSummary;
}

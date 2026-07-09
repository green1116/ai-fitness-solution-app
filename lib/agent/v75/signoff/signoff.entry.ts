/**
 * V75 P8 — Agent sign-off entry (read-only)
 */
export { buildFreezeChecklist, buildFreezeChecklistManifest } from "./freeze.checklist";
export {
  V75_AGENT_LAYER_VERSION_LOCK,
  agentVersionLockMatchesExpected,
  isAgentLayerVersionLockIntact,
} from "./freeze.lock";
export { collectAgentPhaseReadiness } from "./readiness.collector";
export {
  AGENT_GATE_CATALOG,
  buildGateSummary,
  getGateSummaryByPhase,
} from "./release.gate.summary";
export {
  ROLLBACK_SNAPSHOT_INDEX,
  buildRollbackSnapshotIndex,
  getRollbackSnapshotByLayer,
} from "./rollback.snapshot.index";
export { buildAgentFreezeManifest } from "./signoff.manifest";
export { assertAgentSignoffPass, buildAgentSignoff } from "./signoff.builder";
export { V75_AGENT_FREEZE_VERSION, V75_AGENT_SIGNOFF_VERSION } from "./signoff.types";
export type {
  AgentFreezeManifest,
  AgentSignoffPhase,
  AgentSignoffReport,
  AgentSignoffSignals,
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

import { buildAgentSignoff } from "./signoff.builder";
import type { AgentSignoffReport, AgentSignoffSignals } from "./signoff.types";

export function runAgentSignoff(input?: {
  deploymentId?: string;
  signals?: AgentSignoffSignals;
}): AgentSignoffReport {
  return buildAgentSignoff(input);
}

export function closeV75Agent(input?: {
  deploymentId?: string;
  signals?: AgentSignoffSignals;
}): AgentSignoffReport {
  return buildAgentSignoff(input);
}

export function formatAgentSignoffSummary(report: AgentSignoffReport): string {
  return report.closingSummary;
}

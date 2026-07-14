/**
 * E04-P8 — Business Agent freeze manifest builder (read-only)
 */

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  businessAgentVersionLockMatchesExpected,
  E04_BUSINESS_AGENT_LAYER_VERSION_LOCK,
  isBusinessAgentLayerVersionLockIntact,
} from "./freeze.lock";
import {
  collectBusinessAgentPhaseReadiness,
  collectCollaborationBaseline,
} from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type {
  BusinessAgentFreezeManifest,
  BusinessAgentSignoffSignals,
  FreezeState,
} from "./signoff.types";
import { E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: BusinessAgentSignoffSignals = {
  platformReady: true,
  freezeChecklistPass: true,
  platformGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildBusinessAgentFreezeManifest(input?: {
  deploymentId?: string;
  signals?: BusinessAgentSignoffSignals;
}): BusinessAgentFreezeManifest {
  const deploymentId = input?.deploymentId ?? "e04-business-agent-freeze-default";
  const collaborationBaseline = collectCollaborationBaseline(deploymentId);
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectBusinessAgentPhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk =
    isBusinessAgentLayerVersionLockIntact() &&
    businessAgentVersionLockMatchesExpected();

  const signals: BusinessAgentSignoffSignals = {
    ...DEFAULT_SIGNALS,
    platformReady: collaborationBaseline.ready && readiness.ready,
    versionLockIntact: versionLockOk,
    platformGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk &&
    collaborationBaseline.ready &&
    freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible &&
    rollbackSnapshot.indexComplete &&
    gateSummary.allGatesPass &&
    collaborationBaseline.phase === "closed";

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION,
    freezeId: `business-agent-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...E04_BUSINESS_AGENT_LAYER_VERSION_LOCK },
    versionLockOk,
    collaborationBaseline,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `business-agent-freeze frozen=${frozen}`,
      `collaborationReady=${collaborationBaseline.ready}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

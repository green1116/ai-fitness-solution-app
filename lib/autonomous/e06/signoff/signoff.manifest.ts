/**
 * E06-P8 — Autonomous Enterprise OS freeze manifest builder (read-only)
 */

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  autonomousVersionLockMatchesExpected,
  E06_AUTONOMOUS_LAYER_VERSION_LOCK,
  isAutonomousLayerVersionLockIntact,
} from "./freeze.lock";
import {
  collectAgentBaseline,
  collectAutonomousPhaseReadiness,
} from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type {
  AutonomousFreezeManifest,
  AutonomousSignoffSignals,
  FreezeState,
} from "./signoff.types";
import { E06_AUTONOMOUS_OS_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: AutonomousSignoffSignals = {
  platformReady: true,
  freezeChecklistPass: true,
  platformGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildAutonomousFreezeManifest(input?: {
  deploymentId?: string;
  signals?: AutonomousSignoffSignals;
}): AutonomousFreezeManifest {
  const deploymentId = input?.deploymentId ?? "e06-autonomous-freeze-default";
  const agentBaseline = collectAgentBaseline(deploymentId);
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectAutonomousPhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk =
    isAutonomousLayerVersionLockIntact() &&
    autonomousVersionLockMatchesExpected();

  const signals: AutonomousSignoffSignals = {
    ...DEFAULT_SIGNALS,
    platformReady: agentBaseline.ready && readiness.ready,
    versionLockIntact: versionLockOk,
    platformGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && agentBaseline.ready && freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible &&
    rollbackSnapshot.indexComplete &&
    gateSummary.allGatesPass &&
    agentBaseline.directiveCount === 4;

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: E06_AUTONOMOUS_OS_FREEZE_VERSION,
    freezeId: `autonomous-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...E06_AUTONOMOUS_LAYER_VERSION_LOCK },
    versionLockOk,
    agentBaseline,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `autonomous-freeze frozen=${frozen}`,
      `agentReady=${agentBaseline.ready}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

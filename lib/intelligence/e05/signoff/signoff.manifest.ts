/**
 * E05-P8 — Intelligence freeze manifest builder (read-only)
 */

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  E05_INTELLIGENCE_LAYER_VERSION_LOCK,
  intelligenceVersionLockMatchesExpected,
  isIntelligenceLayerVersionLockIntact,
} from "./freeze.lock";
import {
  collectIntelligencePhaseReadiness,
  collectStrategyBaseline,
} from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type {
  FreezeState,
  IntelligenceFreezeManifest,
  IntelligenceSignoffSignals,
} from "./signoff.types";
import { E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: IntelligenceSignoffSignals = {
  platformReady: true,
  freezeChecklistPass: true,
  platformGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildIntelligenceFreezeManifest(input?: {
  deploymentId?: string;
  signals?: IntelligenceSignoffSignals;
}): IntelligenceFreezeManifest {
  const deploymentId =
    input?.deploymentId ?? "e05-intelligence-freeze-default";
  const strategyBaseline = collectStrategyBaseline(deploymentId);
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectIntelligencePhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk =
    isIntelligenceLayerVersionLockIntact() &&
    intelligenceVersionLockMatchesExpected();

  const signals: IntelligenceSignoffSignals = {
    ...DEFAULT_SIGNALS,
    platformReady: strategyBaseline.ready && readiness.ready,
    versionLockIntact: versionLockOk,
    platformGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && strategyBaseline.ready && freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible &&
    rollbackSnapshot.indexComplete &&
    gateSummary.allGatesPass &&
    strategyBaseline.stepCount === 4;

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION,
    freezeId: `intelligence-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...E05_INTELLIGENCE_LAYER_VERSION_LOCK },
    versionLockOk,
    strategyBaseline,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `intelligence-freeze frozen=${frozen}`,
      `strategyReady=${strategyBaseline.ready}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

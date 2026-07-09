/**
 * V72 P8 — Intelligence freeze manifest builder (read-only)
 */
import { buildIntelligenceCompliance } from "../compliance.builder";

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  intelligenceVersionLockMatchesExpected,
  isIntelligenceLayerVersionLockIntact,
  V72_INTELLIGENCE_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import { collectIntelligencePhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type {
  FreezeState,
  IntelligenceFreezeManifest,
  IntelligenceSignoffSignals,
} from "./signoff.types";
import { V72_INTELLIGENCE_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: IntelligenceSignoffSignals = {
  intelligenceReady: true,
  freezeChecklistPass: true,
  intelligenceGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildIntelligenceFreezeManifest(input?: {
  deploymentId?: string;
  signals?: IntelligenceSignoffSignals;
}): IntelligenceFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v72-intelligence-freeze-default";
  const intelligenceCompliance = buildIntelligenceCompliance({ deploymentId });
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectIntelligencePhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk =
    isIntelligenceLayerVersionLockIntact() && intelligenceVersionLockMatchesExpected();

  const signals: IntelligenceSignoffSignals = {
    ...DEFAULT_SIGNALS,
    intelligenceReady: intelligenceCompliance.complianceReady,
    versionLockIntact: versionLockOk,
    intelligenceGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && intelligenceCompliance.complianceReady && freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible && rollbackSnapshot.indexComplete && gateSummary.allGatesPass;

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: V72_INTELLIGENCE_FREEZE_VERSION,
    freezeId: `intelligence-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...V72_INTELLIGENCE_LAYER_VERSION_LOCK },
    versionLockOk,
    intelligenceCompliance,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `intelligence-freeze frozen=${frozen}`,
      `complianceReady=${intelligenceCompliance.complianceReady}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

/**
 * E08-P8 — Ecosystem freeze manifest builder (read-only)
 */

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  E08_ECOSYSTEM_LAYER_VERSION_LOCK,
  ecosystemVersionLockMatchesExpected,
  isEcosystemLayerVersionLockIntact,
} from "./freeze.lock";
import {
  collectEcosystemPhaseReadiness,
  collectNetworkOsBaseline,
} from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type {
  EcosystemFreezeManifest,
  EcosystemSignoffSignals,
  FreezeState,
} from "./signoff.types";
import { E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: EcosystemSignoffSignals = {
  platformReady: true,
  freezeChecklistPass: true,
  platformGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildEcosystemFreezeManifest(input?: {
  deploymentId?: string;
  signals?: EcosystemSignoffSignals;
}): EcosystemFreezeManifest {
  const deploymentId = input?.deploymentId ?? "e08-ecosystem-freeze-default";
  const networkOsBaseline = collectNetworkOsBaseline(deploymentId);
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectEcosystemPhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk =
    isEcosystemLayerVersionLockIntact() &&
    ecosystemVersionLockMatchesExpected();

  const signals: EcosystemSignoffSignals = {
    ...DEFAULT_SIGNALS,
    platformReady: networkOsBaseline.ready && readiness.ready,
    versionLockIntact: versionLockOk,
    platformGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk &&
    networkOsBaseline.ready &&
    freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible &&
    rollbackSnapshot.indexComplete &&
    gateSummary.allGatesPass &&
    networkOsBaseline.completedSlots === networkOsBaseline.slotCount &&
    networkOsBaseline.slotCount > 0;

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION,
    freezeId: `ecosystem-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...E08_ECOSYSTEM_LAYER_VERSION_LOCK },
    versionLockOk,
    networkOsBaseline,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `ecosystem-freeze frozen=${frozen}`,
      `networkOsReady=${networkOsBaseline.ready}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

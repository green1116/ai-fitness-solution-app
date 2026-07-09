/**
 * V76 P8 — Collaboration freeze manifest builder (read-only)
 */
import { buildCollaborationComplianceCatalog } from "../collaboration.compliance.builder";

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  collaborationVersionLockMatchesExpected,
  isCollaborationLayerVersionLockIntact,
  V76_COLLABORATION_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import { collectCollaborationPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type { CollaborationFreezeManifest, CollaborationSignoffSignals, FreezeState } from "./signoff.types";
import { V76_COLLABORATION_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: CollaborationSignoffSignals = {
  collaborationReady: true,
  freezeChecklistPass: true,
  collaborationGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildCollaborationFreezeManifest(input?: {
  deploymentId?: string;
  signals?: CollaborationSignoffSignals;
}): CollaborationFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v76-collaboration-freeze-default";
  const collaborationCompliance = buildCollaborationComplianceCatalog({ deploymentId });
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectCollaborationPhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk =
    isCollaborationLayerVersionLockIntact() && collaborationVersionLockMatchesExpected();

  const signals: CollaborationSignoffSignals = {
    ...DEFAULT_SIGNALS,
    collaborationReady: collaborationCompliance.catalogReady,
    versionLockIntact: versionLockOk,
    collaborationGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && collaborationCompliance.catalogReady && freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible && rollbackSnapshot.indexComplete && gateSummary.allGatesPass;

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: V76_COLLABORATION_FREEZE_VERSION,
    freezeId: `collaboration-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...V76_COLLABORATION_LAYER_VERSION_LOCK },
    versionLockOk,
    collaborationCompliance,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `collaboration-freeze frozen=${frozen}`,
      `complianceReady=${collaborationCompliance.catalogReady}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

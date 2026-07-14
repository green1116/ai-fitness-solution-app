/**
 * E02-P8 — Knowledge Graph freeze manifest builder (read-only)
 */

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  isKnowledgeLayerVersionLockIntact,
  knowledgeVersionLockMatchesExpected,
  V102_KNOWLEDGE_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import {
  collectKnowledgeDeliveryBaseline,
  collectKnowledgePhaseReadiness,
} from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type {
  FreezeState,
  KnowledgeFreezeManifest,
  KnowledgeSignoffSignals,
} from "./signoff.types";
import { V102_KNOWLEDGE_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: KnowledgeSignoffSignals = {
  knowledgeReady: true,
  freezeChecklistPass: true,
  knowledgeGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildKnowledgeFreezeManifest(input?: {
  deploymentId?: string;
  signals?: KnowledgeSignoffSignals;
}): KnowledgeFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v102-knowledge-freeze-default";
  const deliveryBaseline = collectKnowledgeDeliveryBaseline(deploymentId);
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectKnowledgePhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk =
    isKnowledgeLayerVersionLockIntact() && knowledgeVersionLockMatchesExpected();

  const signals: KnowledgeSignoffSignals = {
    ...DEFAULT_SIGNALS,
    knowledgeReady: deliveryBaseline.ready && readiness.ready,
    versionLockIntact: versionLockOk,
    knowledgeGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && deliveryBaseline.ready && freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible &&
    rollbackSnapshot.indexComplete &&
    gateSummary.allGatesPass &&
    deliveryBaseline.sealHash !== null;

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: V102_KNOWLEDGE_FREEZE_VERSION,
    freezeId: `knowledge-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...V102_KNOWLEDGE_LAYER_VERSION_LOCK },
    versionLockOk,
    deliveryBaseline,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `knowledge-freeze frozen=${frozen}`,
      `deliveryReady=${deliveryBaseline.ready}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

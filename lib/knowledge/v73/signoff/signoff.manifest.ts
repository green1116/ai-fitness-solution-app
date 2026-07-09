/**
 * V73 P8 — Knowledge freeze manifest builder (read-only)
 */
import { buildKnowledgeCompliance } from "../compliance.builder";

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  isKnowledgeLayerVersionLockIntact,
  knowledgeVersionLockMatchesExpected,
  V73_KNOWLEDGE_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import { collectKnowledgePhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type {
  FreezeState,
  KnowledgeFreezeManifest,
  KnowledgeSignoffSignals,
} from "./signoff.types";
import { V73_KNOWLEDGE_FREEZE_VERSION } from "./signoff.types";

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
  const deploymentId = input?.deploymentId ?? "v73-knowledge-freeze-default";
  const knowledgeCompliance = buildKnowledgeCompliance({ deploymentId });
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectKnowledgePhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk =
    isKnowledgeLayerVersionLockIntact() && knowledgeVersionLockMatchesExpected();

  const signals: KnowledgeSignoffSignals = {
    ...DEFAULT_SIGNALS,
    knowledgeReady: knowledgeCompliance.complianceReady,
    versionLockIntact: versionLockOk,
    knowledgeGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && knowledgeCompliance.complianceReady && freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible && rollbackSnapshot.indexComplete && gateSummary.allGatesPass;

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: V73_KNOWLEDGE_FREEZE_VERSION,
    freezeId: `knowledge-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...V73_KNOWLEDGE_LAYER_VERSION_LOCK },
    versionLockOk,
    knowledgeCompliance,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `knowledge-freeze frozen=${frozen}`,
      `complianceReady=${knowledgeCompliance.complianceReady}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

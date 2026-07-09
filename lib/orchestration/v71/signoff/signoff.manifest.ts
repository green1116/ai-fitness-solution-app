/**
 * V71 P8 — Workflow freeze manifest builder (read-only)
 */
import { buildWorkflowCompliance } from "../compliance.builder";

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  isWorkflowLayerVersionLockIntact,
  V71_WORKFLOW_LAYER_VERSION_LOCK,
  workflowVersionLockMatchesExpected,
} from "./freeze.lock";
import { collectWorkflowPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type {
  FreezeState,
  WorkflowFreezeManifest,
  WorkflowSignoffSignals,
} from "./signoff.types";
import { V71_WORKFLOW_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: WorkflowSignoffSignals = {
  workflowReady: true,
  freezeChecklistPass: true,
  workflowGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildWorkflowFreezeManifest(input?: {
  deploymentId?: string;
  signals?: WorkflowSignoffSignals;
}): WorkflowFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v71-workflow-freeze-default";
  const workflowCompliance = buildWorkflowCompliance({ deploymentId });
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectWorkflowPhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk =
    isWorkflowLayerVersionLockIntact() && workflowVersionLockMatchesExpected();

  const signals: WorkflowSignoffSignals = {
    ...DEFAULT_SIGNALS,
    workflowReady: workflowCompliance.complianceReady,
    versionLockIntact: versionLockOk,
    workflowGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && workflowCompliance.complianceReady && freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible && rollbackSnapshot.indexComplete && gateSummary.allGatesPass;

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: V71_WORKFLOW_FREEZE_VERSION,
    freezeId: `workflow-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...V71_WORKFLOW_LAYER_VERSION_LOCK },
    versionLockOk,
    workflowCompliance,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `workflow-freeze frozen=${frozen}`,
      `complianceReady=${workflowCompliance.complianceReady}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

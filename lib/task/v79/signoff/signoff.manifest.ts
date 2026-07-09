/**
 * V79 P8 — Task freeze manifest builder (read-only)
 */
import { buildTaskComplianceCatalog } from "../task.compliance.builder";

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  isTaskLayerVersionLockIntact,
  taskVersionLockMatchesExpected,
  V79_TASK_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import { collectTaskPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type { FreezeState, TaskFreezeManifest, TaskSignoffSignals } from "./signoff.types";
import { V79_TASK_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: TaskSignoffSignals = {
  taskReady: true,
  freezeChecklistPass: true,
  taskGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildTaskFreezeManifest(input?: {
  deploymentId?: string;
  signals?: TaskSignoffSignals;
}): TaskFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v79-task-freeze-default";
  const taskCompliance = buildTaskComplianceCatalog({ deploymentId });
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectTaskPhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk = isTaskLayerVersionLockIntact() && taskVersionLockMatchesExpected();

  const signals: TaskSignoffSignals = {
    ...DEFAULT_SIGNALS,
    taskReady: taskCompliance.catalogReady,
    versionLockIntact: versionLockOk,
    taskGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && taskCompliance.catalogReady && freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible && rollbackSnapshot.indexComplete && gateSummary.allGatesPass;

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: V79_TASK_FREEZE_VERSION,
    freezeId: `task-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...V79_TASK_LAYER_VERSION_LOCK },
    versionLockOk,
    taskCompliance,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `task-freeze frozen=${frozen}`,
      `complianceReady=${taskCompliance.catalogReady}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

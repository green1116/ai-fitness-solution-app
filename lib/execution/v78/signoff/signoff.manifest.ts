/**
 * V78 P8 — Execution freeze manifest builder (read-only)
 */
import { buildExecutionComplianceCatalog } from "../execution.compliance.builder";

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  executionVersionLockMatchesExpected,
  isExecutionLayerVersionLockIntact,
  V78_EXECUTION_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import { collectExecutionPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type { ExecutionSignoffSignals, ExecutionFreezeManifest, FreezeState } from "./signoff.types";
import { V78_EXECUTION_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: ExecutionSignoffSignals = {
  executionReady: true,
  freezeChecklistPass: true,
  executionGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildExecutionFreezeManifest(input?: {
  deploymentId?: string;
  signals?: ExecutionSignoffSignals;
}): ExecutionFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v78-execution-freeze-default";
  const executionCompliance = buildExecutionComplianceCatalog({ deploymentId });
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectExecutionPhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk =
    isExecutionLayerVersionLockIntact() && executionVersionLockMatchesExpected();

  const signals: ExecutionSignoffSignals = {
    ...DEFAULT_SIGNALS,
    executionReady: executionCompliance.catalogReady,
    versionLockIntact: versionLockOk,
    executionGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && executionCompliance.catalogReady && freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible && rollbackSnapshot.indexComplete && gateSummary.allGatesPass;

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: V78_EXECUTION_FREEZE_VERSION,
    freezeId: `execution-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...V78_EXECUTION_LAYER_VERSION_LOCK },
    versionLockOk,
    executionCompliance,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `execution-freeze frozen=${frozen}`,
      `complianceReady=${executionCompliance.catalogReady}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

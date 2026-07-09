/**
 * V77 P8 — Planning freeze manifest builder (read-only)
 */
import { buildPlanningComplianceCatalog } from "../planning.compliance.builder";

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  isPlanningLayerVersionLockIntact,
  planningVersionLockMatchesExpected,
  V77_PLANNING_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import { collectPlanningPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type { FreezeState, PlanningFreezeManifest, PlanningSignoffSignals } from "./signoff.types";
import { V77_PLANNING_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: PlanningSignoffSignals = {
  planningReady: true,
  freezeChecklistPass: true,
  planningGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildPlanningFreezeManifest(input?: {
  deploymentId?: string;
  signals?: PlanningSignoffSignals;
}): PlanningFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v77-planning-freeze-default";
  const planningCompliance = buildPlanningComplianceCatalog({ deploymentId });
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectPlanningPhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk =
    isPlanningLayerVersionLockIntact() && planningVersionLockMatchesExpected();

  const signals: PlanningSignoffSignals = {
    ...DEFAULT_SIGNALS,
    planningReady: planningCompliance.catalogReady,
    versionLockIntact: versionLockOk,
    planningGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && planningCompliance.catalogReady && freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible && rollbackSnapshot.indexComplete && gateSummary.allGatesPass;

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: V77_PLANNING_FREEZE_VERSION,
    freezeId: `planning-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...V77_PLANNING_LAYER_VERSION_LOCK },
    versionLockOk,
    planningCompliance,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `planning-freeze frozen=${frozen}`,
      `complianceReady=${planningCompliance.catalogReady}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

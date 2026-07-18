/**
 * E07-P8 — Digital Workforce freeze manifest builder (read-only)
 */

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  E07_WORKFORCE_LAYER_VERSION_LOCK,
  isWorkforceLayerVersionLockIntact,
  workforceVersionLockMatchesExpected,
} from "./freeze.lock";
import {
  collectOrganizationBaseline,
  collectWorkforcePhaseReadiness,
} from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type {
  FreezeState,
  WorkforceFreezeManifest,
  WorkforceSignoffSignals,
} from "./signoff.types";
import { E07_WORKFORCE_PLATFORM_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: WorkforceSignoffSignals = {
  platformReady: true,
  freezeChecklistPass: true,
  platformGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildWorkforceFreezeManifest(input?: {
  deploymentId?: string;
  signals?: WorkforceSignoffSignals;
}): WorkforceFreezeManifest {
  const deploymentId = input?.deploymentId ?? "e07-workforce-freeze-default";
  const organizationBaseline = collectOrganizationBaseline(deploymentId);
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectWorkforcePhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk =
    isWorkforceLayerVersionLockIntact() &&
    workforceVersionLockMatchesExpected();

  const signals: WorkforceSignoffSignals = {
    ...DEFAULT_SIGNALS,
    platformReady: organizationBaseline.ready && readiness.ready,
    versionLockIntact: versionLockOk,
    platformGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk &&
    organizationBaseline.ready &&
    freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible &&
    rollbackSnapshot.indexComplete &&
    gateSummary.allGatesPass &&
    organizationBaseline.completedUnits === organizationBaseline.unitCount &&
    organizationBaseline.unitCount > 0;

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: E07_WORKFORCE_PLATFORM_FREEZE_VERSION,
    freezeId: `workforce-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...E07_WORKFORCE_LAYER_VERSION_LOCK },
    versionLockOk,
    organizationBaseline,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `workforce-freeze frozen=${frozen}`,
      `organizationReady=${organizationBaseline.ready}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

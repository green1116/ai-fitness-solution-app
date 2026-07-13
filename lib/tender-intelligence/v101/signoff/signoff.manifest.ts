/**
 * E01-P8 — Tender Intelligence freeze manifest builder (read-only)
 */

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  isTenderLayerVersionLockIntact,
  tenderVersionLockMatchesExpected,
  V101_TENDER_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import {
  collectDeliveryBaseline,
  collectTenderPhaseReadiness,
} from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type {
  FreezeState,
  TenderFreezeManifest,
  TenderSignoffSignals,
} from "./signoff.types";
import { V101_TENDER_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: TenderSignoffSignals = {
  tenderReady: true,
  freezeChecklistPass: true,
  tenderGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildTenderFreezeManifest(input?: {
  deploymentId?: string;
  signals?: TenderSignoffSignals;
}): TenderFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v101-tender-freeze-default";
  const deliveryBaseline = collectDeliveryBaseline(deploymentId);
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectTenderPhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk =
    isTenderLayerVersionLockIntact() && tenderVersionLockMatchesExpected();

  const signals: TenderSignoffSignals = {
    ...DEFAULT_SIGNALS,
    tenderReady: deliveryBaseline.ready && readiness.ready,
    versionLockIntact: versionLockOk,
    tenderGatesPass: gateSummary.allGatesPass,
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
    version: V101_TENDER_FREEZE_VERSION,
    freezeId: `tender-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...V101_TENDER_LAYER_VERSION_LOCK },
    versionLockOk,
    deliveryBaseline,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `tender-freeze frozen=${frozen}`,
      `deliveryReady=${deliveryBaseline.ready}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

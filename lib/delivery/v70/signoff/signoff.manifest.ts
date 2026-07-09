/**
 * V70 P8 — Delivery freeze manifest builder (read-only)
 */
import { buildDeliveryCompliance } from "../compliance.builder";

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  deliveryVersionLockMatchesExpected,
  isDeliveryLayerVersionLockIntact,
  V70_DELIVERY_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import { collectDeliveryPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type {
  DeliveryFreezeManifest,
  DeliverySignoffSignals,
  FreezeState,
} from "./signoff.types";
import { V70_DELIVERY_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: DeliverySignoffSignals = {
  deliveryReady: true,
  freezeChecklistPass: true,
  releaseGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildDeliveryFreezeManifest(input?: {
  deploymentId?: string;
  signals?: DeliverySignoffSignals;
}): DeliveryFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v70-delivery-freeze-default";
  const deliveryCompliance = buildDeliveryCompliance({ deploymentId });
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectDeliveryPhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk =
    isDeliveryLayerVersionLockIntact() && deliveryVersionLockMatchesExpected();

  const signals: DeliverySignoffSignals = {
    ...DEFAULT_SIGNALS,
    deliveryReady: deliveryCompliance.complianceReady,
    versionLockIntact: versionLockOk,
    releaseGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && deliveryCompliance.complianceReady && freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible && rollbackSnapshot.indexComplete && gateSummary.allGatesPass;

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: V70_DELIVERY_FREEZE_VERSION,
    freezeId: `delivery-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...V70_DELIVERY_LAYER_VERSION_LOCK },
    versionLockOk,
    deliveryCompliance,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `delivery-freeze frozen=${frozen}`,
      `complianceReady=${deliveryCompliance.complianceReady}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

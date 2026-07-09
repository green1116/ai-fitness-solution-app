/**
 * V66 P8 — Deployment freeze manifest builder (read-only)
 */
import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  deploymentVersionLockMatchesExpected,
  isDeploymentLayerVersionLockIntact,
  V66_DEPLOYMENT_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import { buildDeploymentOpsReport } from "./ops.builder";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type { DeploymentFreezeManifest, DeploymentSignoffSignals } from "./signoff.types";
import { V66_DEPLOYMENT_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: DeploymentSignoffSignals = {
  opsReady: true,
  freezeChecklistPass: true,
  releaseGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildDeploymentFreezeManifest(input?: {
  deploymentId?: string;
  signals?: DeploymentSignoffSignals;
}): DeploymentFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v66-deployment-freeze-default";
  const ops = buildDeploymentOpsReport({ deploymentId });
  const rollbackSnapshot = buildRollbackSnapshotIndex();

  const versionLockOk =
    isDeploymentLayerVersionLockIntact() && deploymentVersionLockMatchesExpected();

  const signals: DeploymentSignoffSignals = {
    ...DEFAULT_SIGNALS,
    opsReady: ops.opsReady,
    versionLockIntact: versionLockOk,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible = versionLockOk && ops.opsReady && freezeChecklist.checklistPass;
  const frozen = backwardCompatible && rollbackSnapshot.indexComplete;

  return {
    version: V66_DEPLOYMENT_FREEZE_VERSION,
    freezeId: `deployment-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    layerVersionLock: { ...V66_DEPLOYMENT_LAYER_VERSION_LOCK },
    versionLockOk,
    ops,
    freezeChecklist,
    rollbackSnapshot,
    backwardCompatible,
    frozen,
    summary: [
      `deployment-freeze frozen=${frozen}`,
      `opsReady=${ops.opsReady}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
    ].join(" "),
  };
}

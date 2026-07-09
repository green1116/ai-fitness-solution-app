/**
 * V67 P8 — Monitoring freeze manifest builder (read-only)
 */
import { buildPostmortemFoundationReport } from "../postmortem/governance.builder";

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  isMonitoringLayerVersionLockIntact,
  monitoringVersionLockMatchesExpected,
  V67_MONITORING_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import { collectMonitoringPhaseReadiness } from "./readiness.collector";
import { buildReleaseGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type { MonitoringFreezeManifest, MonitoringSignoffSignals } from "./signoff.types";
import { V67_MONITORING_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: MonitoringSignoffSignals = {
  monitoringReady: true,
  freezeChecklistPass: true,
  releaseGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildMonitoringFreezeManifest(input?: {
  deploymentId?: string;
  signals?: MonitoringSignoffSignals;
}): MonitoringFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v67-monitoring-freeze-default";
  const postmortem = buildPostmortemFoundationReport({ deploymentId });
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectMonitoringPhaseReadiness(deploymentId);
  const releaseGates = buildReleaseGateSummary(readiness);

  const versionLockOk =
    isMonitoringLayerVersionLockIntact() && monitoringVersionLockMatchesExpected();

  const signals: MonitoringSignoffSignals = {
    ...DEFAULT_SIGNALS,
    monitoringReady: postmortem.foundationReady,
    versionLockIntact: versionLockOk,
    releaseGatesPass: releaseGates.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && postmortem.foundationReady && freezeChecklist.checklistPass;
  const frozen = backwardCompatible && rollbackSnapshot.indexComplete && releaseGates.allGatesPass;

  return {
    version: V67_MONITORING_FREEZE_VERSION,
    freezeId: `monitoring-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    layerVersionLock: { ...V67_MONITORING_LAYER_VERSION_LOCK },
    versionLockOk,
    postmortem,
    freezeChecklist,
    rollbackSnapshot,
    backwardCompatible,
    frozen,
    summary: [
      `monitoring-freeze frozen=${frozen}`,
      `postmortemReady=${postmortem.foundationReady}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
    ].join(" "),
  };
}

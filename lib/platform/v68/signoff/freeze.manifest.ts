/**
 * V68 P8 — Platform freeze manifest builder (read-only)
 */
import { buildObservabilityPolicyReport } from "../observability-policy/governance.builder";

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  isPlatformLayerVersionLockIntact,
  platformVersionLockMatchesExpected,
  V68_PLATFORM_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import { collectPlatformPhaseReadiness } from "./readiness.collector";
import { buildReleaseGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type { PlatformFreezeManifest, PlatformSignoffSignals } from "./signoff.types";
import { V68_PLATFORM_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: PlatformSignoffSignals = {
  platformReady: true,
  freezeChecklistPass: true,
  releaseGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildPlatformFreezeManifest(input?: {
  deploymentId?: string;
  signals?: PlatformSignoffSignals;
}): PlatformFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v68-platform-freeze-default";
  const observabilityPolicy = buildObservabilityPolicyReport({ deploymentId });
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectPlatformPhaseReadiness(deploymentId);
  const releaseGates = buildReleaseGateSummary(readiness);

  const versionLockOk =
    isPlatformLayerVersionLockIntact() && platformVersionLockMatchesExpected();

  const signals: PlatformSignoffSignals = {
    ...DEFAULT_SIGNALS,
    platformReady: observabilityPolicy.policyReady,
    versionLockIntact: versionLockOk,
    releaseGatesPass: releaseGates.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && observabilityPolicy.policyReady && freezeChecklist.checklistPass;
  const frozen = backwardCompatible && rollbackSnapshot.indexComplete && releaseGates.allGatesPass;

  return {
    version: V68_PLATFORM_FREEZE_VERSION,
    freezeId: `platform-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    layerVersionLock: { ...V68_PLATFORM_LAYER_VERSION_LOCK },
    versionLockOk,
    observabilityPolicy,
    freezeChecklist,
    rollbackSnapshot,
    backwardCompatible,
    frozen,
    summary: [
      `platform-freeze frozen=${frozen}`,
      `observabilityReady=${observabilityPolicy.policyReady}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
    ].join(" "),
  };
}

/**
 * V69 P8 — Technical governance freeze manifest builder (read-only)
 */
import { buildArchitectureComplianceReport } from "../architecture-compliance/compliance.builder";

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  isTechnicalLayerVersionLockIntact,
  technicalVersionLockMatchesExpected,
  V69_TECHNICAL_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import { collectTechnicalPhaseReadiness } from "./readiness.collector";
import { buildReleaseGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type { TechnicalFreezeManifest, TechnicalSignoffSignals } from "./signoff.types";
import { V69_TECHNICAL_GOVERNANCE_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: TechnicalSignoffSignals = {
  governanceReady: true,
  freezeChecklistPass: true,
  releaseGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildTechnicalFreezeManifest(input?: {
  deploymentId?: string;
  signals?: TechnicalSignoffSignals;
}): TechnicalFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v69-technical-governance-freeze-default";
  const architectureCompliance = buildArchitectureComplianceReport({ deploymentId });
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectTechnicalPhaseReadiness(deploymentId);
  const releaseGates = buildReleaseGateSummary(readiness);

  const versionLockOk =
    isTechnicalLayerVersionLockIntact() && technicalVersionLockMatchesExpected();

  const signals: TechnicalSignoffSignals = {
    ...DEFAULT_SIGNALS,
    governanceReady: architectureCompliance.complianceReady,
    versionLockIntact: versionLockOk,
    releaseGatesPass: releaseGates.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && architectureCompliance.complianceReady && freezeChecklist.checklistPass;
  const frozen = backwardCompatible && rollbackSnapshot.indexComplete && releaseGates.allGatesPass;

  return {
    version: V69_TECHNICAL_GOVERNANCE_FREEZE_VERSION,
    freezeId: `technical-governance-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    layerVersionLock: { ...V69_TECHNICAL_LAYER_VERSION_LOCK },
    versionLockOk,
    architectureCompliance,
    freezeChecklist,
    rollbackSnapshot,
    backwardCompatible,
    frozen,
    summary: [
      `technical-governance-freeze frozen=${frozen}`,
      `complianceReady=${architectureCompliance.complianceReady}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
    ].join(" "),
  };
}

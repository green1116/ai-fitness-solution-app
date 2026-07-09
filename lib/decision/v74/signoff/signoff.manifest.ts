/**
 * V74 P8 — Decision freeze manifest builder (read-only)
 */
import { buildDecisionComplianceCatalog } from "../decision.compliance.builder";

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  decisionVersionLockMatchesExpected,
  isDecisionLayerVersionLockIntact,
  V74_DECISION_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import { collectDecisionPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type {
  DecisionFreezeManifest,
  DecisionSignoffSignals,
  FreezeState,
} from "./signoff.types";
import { V74_DECISION_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: DecisionSignoffSignals = {
  decisionReady: true,
  freezeChecklistPass: true,
  decisionGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildDecisionFreezeManifest(input?: {
  deploymentId?: string;
  signals?: DecisionSignoffSignals;
}): DecisionFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v74-decision-freeze-default";
  const decisionCompliance = buildDecisionComplianceCatalog({ deploymentId });
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectDecisionPhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk =
    isDecisionLayerVersionLockIntact() && decisionVersionLockMatchesExpected();

  const signals: DecisionSignoffSignals = {
    ...DEFAULT_SIGNALS,
    decisionReady: decisionCompliance.catalogReady,
    versionLockIntact: versionLockOk,
    decisionGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && decisionCompliance.catalogReady && freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible && rollbackSnapshot.indexComplete && gateSummary.allGatesPass;

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: V74_DECISION_FREEZE_VERSION,
    freezeId: `decision-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...V74_DECISION_LAYER_VERSION_LOCK },
    versionLockOk,
    decisionCompliance,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `decision-freeze frozen=${frozen}`,
      `complianceReady=${decisionCompliance.catalogReady}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

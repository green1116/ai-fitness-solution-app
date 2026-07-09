/**
 * V75 P8 — Agent freeze manifest builder (read-only)
 */
import { buildAgentComplianceCatalog } from "../agent.compliance.builder";

import { buildFreezeChecklistManifest } from "./freeze.checklist";
import {
  agentVersionLockMatchesExpected,
  isAgentLayerVersionLockIntact,
  V75_AGENT_LAYER_VERSION_LOCK,
} from "./freeze.lock";
import { collectAgentPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildRollbackSnapshotIndex } from "./rollback.snapshot.index";
import type { AgentFreezeManifest, AgentSignoffSignals, FreezeState } from "./signoff.types";
import { V75_AGENT_FREEZE_VERSION } from "./signoff.types";

const DEFAULT_SIGNALS: AgentSignoffSignals = {
  agentReady: true,
  freezeChecklistPass: true,
  agentGatesPass: true,
  rollbackSnapshotComplete: true,
  versionLockIntact: true,
};

export function buildAgentFreezeManifest(input?: {
  deploymentId?: string;
  signals?: AgentSignoffSignals;
}): AgentFreezeManifest {
  const deploymentId = input?.deploymentId ?? "v75-agent-freeze-default";
  const agentCompliance = buildAgentComplianceCatalog({ deploymentId });
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const readiness = collectAgentPhaseReadiness(deploymentId);
  const gateSummary = buildGateSummary(readiness);

  const versionLockOk = isAgentLayerVersionLockIntact() && agentVersionLockMatchesExpected();

  const signals: AgentSignoffSignals = {
    ...DEFAULT_SIGNALS,
    agentReady: agentCompliance.catalogReady,
    versionLockIntact: versionLockOk,
    agentGatesPass: gateSummary.allGatesPass,
    rollbackSnapshotComplete: rollbackSnapshot.indexComplete,
    ...input?.signals,
  };

  const freezeChecklist = buildFreezeChecklistManifest(signals);

  const backwardCompatible =
    versionLockOk && agentCompliance.catalogReady && freezeChecklist.checklistPass;
  const frozen =
    backwardCompatible && rollbackSnapshot.indexComplete && gateSummary.allGatesPass;

  const freezeState: FreezeState = {
    frozen,
    backwardCompatible,
    versionLockOk,
    state: frozen ? "frozen" : backwardCompatible ? "unfrozen" : "blocked",
  };

  return {
    version: V75_AGENT_FREEZE_VERSION,
    freezeId: `agent-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    lockVersion: { ...V75_AGENT_LAYER_VERSION_LOCK },
    versionLockOk,
    agentCompliance,
    freezeChecklist,
    rollbackSnapshot,
    freezeState,
    summary: [
      `agent-freeze frozen=${frozen}`,
      `complianceReady=${agentCompliance.catalogReady}`,
      `versionLock=${versionLockOk}`,
      `rollbackIndex=${rollbackSnapshot.indexComplete}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

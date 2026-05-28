import { GOVERNANCE_SNAPSHOT_VERSION, type GovernancePersistenceRuntimeInput, type GovernanceSnapshot } from "./persistence.types";

export function buildGovernancePersistenceSnapshot(
  input: GovernancePersistenceRuntimeInput,
): GovernanceSnapshot {
  return {
    snapshotId: `gps-${input.inputSnapshot.deploymentId.slice(0, 10)}-${Date.now()}`,
    snapshotVersion: GOVERNANCE_SNAPSHOT_VERSION,
    runtimeName: input.runtimeName,
    runtimeVersion: input.runtimeVersion,
    inputSnapshot: input.inputSnapshot,
    intelligenceSnapshot: input.inputSnapshot.intelligenceSummary,
    rulebookSnapshot: input.rulebookVersion,
    policyPackSnapshot: `${input.policyPackVersion}:${input.policyPackMode}`,
    orchestrationSnapshot: {
      planId: input.orchestration.plan.planId,
      state: input.orchestration.state.status,
      queueSize: input.orchestration.queue.length,
    },
    lifecycleSnapshot: {
      lifecycleId: input.lifecycle.state.lifecycleId,
      status: input.lifecycle.state.status,
      transitionCount: input.lifecycle.transitions.length,
    },
    summarySnapshot: input.summaryText,
    timestamp: new Date().toISOString(),
  };
}

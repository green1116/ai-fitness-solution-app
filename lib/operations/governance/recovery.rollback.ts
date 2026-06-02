import type { GovernanceRecoveryRollback, GovernanceRecoveryRuntimeInput } from "./recovery.types";

export function buildGovernanceRecoveryRollback(
  input: GovernanceRecoveryRuntimeInput,
): GovernanceRecoveryRollback {
  return {
    rollbackId: `rollback-${input.deploymentId.slice(0, 10)}-${Date.now()}`,
    executed: input.persistence.checkpoint.checkpointStatus === "restorable",
    checkpointId: input.persistence.checkpoint.checkpointId,
    snapshotId: input.persistence.snapshot.snapshotId,
    stableLifecycleStatus: input.lifecycle.state.status,
    reason: "Rollback references latest restorable checkpoint and snapshot.",
  };
}

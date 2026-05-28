import type {
  GovernanceCheckpoint,
  GovernancePersistenceRuntimeInput,
  GovernanceRestoreResult,
  GovernanceSnapshot,
} from "./persistence.types";

export function restoreGovernanceFromCheckpoint(input: {
  snapshot: GovernanceSnapshot;
  checkpoint: GovernanceCheckpoint;
  runtime: GovernancePersistenceRuntimeInput;
}): GovernanceRestoreResult {
  return {
    restored: input.checkpoint.checkpointStatus === "restorable",
    restoreId: `restore-${input.checkpoint.checkpointId}`,
    restoredLifecycleStatus: input.snapshot.lifecycleSnapshot.status,
    restoredQueueSize: input.snapshot.orchestrationSnapshot.queueSize,
    restoredPolicyPackMode: input.runtime.policyPackMode,
    restoredRulebookVersion: input.runtime.rulebookVersion,
    auditNote: `restore-from=${input.checkpoint.checkpointId} hash=${input.checkpoint.checkpointHash}`,
  };
}

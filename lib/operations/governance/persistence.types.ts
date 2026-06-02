import type { GovernanceOrchestrationRuntimeResult } from "./orchestration.types";
import type { GovernanceLifecycleRuntimeResult } from "./lifecycle.types";

export const GOVERNANCE_PERSISTENCE_VERSION = "v4-a3-r6-persistence-1" as const;
export type GovernancePersistenceVersion = typeof GOVERNANCE_PERSISTENCE_VERSION;

export const GOVERNANCE_SNAPSHOT_VERSION = "v4-a3-r6-snapshot-1" as const;
export type GovernanceSnapshotVersion = typeof GOVERNANCE_SNAPSHOT_VERSION;

export const GOVERNANCE_CHECKPOINT_VERSION = "v4-a3-r6-checkpoint-1" as const;
export type GovernanceCheckpointVersion = typeof GOVERNANCE_CHECKPOINT_VERSION;

export type GovernancePersistenceStatus =
  | "snapshotCreated"
  | "checkpointCreated"
  | "restored"
  | "replayed"
  | "ready";

export type GovernanceSnapshot = {
  snapshotId: string;
  snapshotVersion: GovernanceSnapshotVersion;
  runtimeName: string;
  runtimeVersion: string;
  inputSnapshot: {
    deploymentId: string;
    intelligenceRuntimeId: string;
    intelligenceSummary: string;
  };
  intelligenceSnapshot: string;
  rulebookSnapshot: string;
  policyPackSnapshot: string;
  orchestrationSnapshot: {
    planId: string;
    state: string;
    queueSize: number;
  };
  lifecycleSnapshot: {
    lifecycleId: string;
    status: string;
    transitionCount: number;
  };
  summarySnapshot: string;
  timestamp: string;
};

export type GovernanceCheckpoint = {
  checkpointId: string;
  checkpointVersion: GovernanceCheckpointVersion;
  checkpointReason: string;
  checkpointStatus: "active" | "restorable";
  checkpointSource: "runtime-memory";
  checkpointHash: string;
  checkpointCreatedAt: string;
};

export type GovernanceRestoreResult = {
  restored: boolean;
  restoreId: string;
  restoredLifecycleStatus: string;
  restoredQueueSize: number;
  restoredPolicyPackMode: string;
  restoredRulebookVersion: string;
  auditNote: string;
};

export type GovernanceReplayResult = {
  replayId: string;
  replayable: boolean;
  source: "snapshot" | "checkpoint";
  events: GovernanceLifecycleRuntimeResult["timeline"];
  reason: string;
};

export type GovernancePersistenceMetadata = {
  immutableAuditSnapshot: boolean;
  schemaVersion: GovernancePersistenceVersion;
  snapshotVersion: GovernanceSnapshotVersion;
  checkpointVersion: GovernanceCheckpointVersion;
  versionDriftDetected: boolean;
  generatedAt: string;
};

export type GovernancePersistenceSummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernancePersistenceRuntimeInput = {
  runtimeName: string;
  runtimeVersion: string;
  inputSnapshot: {
    deploymentId: string;
    intelligenceRuntimeId: string;
    intelligenceSummary: string;
  };
  rulebookVersion: string;
  policyPackVersion: string;
  policyPackMode: string;
  orchestration: GovernanceOrchestrationRuntimeResult;
  lifecycle: GovernanceLifecycleRuntimeResult;
  summaryText: string;
};

export type GovernancePersistenceRuntimeResult = {
  version: GovernancePersistenceVersion;
  status: GovernancePersistenceStatus;
  snapshot: GovernanceSnapshot;
  checkpoint: GovernanceCheckpoint;
  restore: GovernanceRestoreResult;
  replay: GovernanceReplayResult;
  metadata: GovernancePersistenceMetadata;
  summary: GovernancePersistenceSummary;
};

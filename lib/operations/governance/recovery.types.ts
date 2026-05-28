import type { GovernanceLifecycleRuntimeResult } from "./lifecycle.types";
import type { GovernancePersistenceRuntimeResult } from "./persistence.types";
import type { GovernanceStoreRuntimeResult } from "./store.types";

export const GOVERNANCE_RECOVERY_VERSION = "v4-a3-r8-recovery-1" as const;
export type GovernanceRecoveryVersion = typeof GOVERNANCE_RECOVERY_VERSION;

export type GovernanceRecoveryStrategy =
  | "retry"
  | "rollback"
  | "replay"
  | "degraded"
  | "partial"
  | "restart"
  | "manualIntervention";

export type GovernanceRecoveryStatus =
  | "notNeeded"
  | "recovering"
  | "recovered"
  | "degraded"
  | "manualInterventionRequired";

export type GovernanceRecoveryRollback = {
  rollbackId: string;
  executed: boolean;
  checkpointId: string;
  snapshotId: string;
  stableLifecycleStatus: string;
  reason: string;
};

export type GovernanceRecoveryReplay = {
  replayId: string;
  executed: boolean;
  basedOn: "timeline" | "snapshot" | "checkpoint";
  replayEventCount: number;
  reason: string;
};

export type GovernanceRecoveryPartial = {
  partialId: string;
  executed: boolean;
  scope: ("lifecycle" | "orchestration" | "audit" | "store")[];
  reason: string;
};

export type GovernanceRecoveryDegraded = {
  degradedId: string;
  active: boolean;
  mode: "read-only" | "audit-only" | "manual-review-only" | "limited-orchestration" | "none";
  reason: string;
};

export type GovernanceRecoveryAudit = {
  auditId: string;
  actions: {
    actionId: string;
    strategy: GovernanceRecoveryStrategy;
    success: boolean;
    reason: string;
    timestamp: string;
  }[];
};

export type GovernanceRecoverySummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernanceRecoveryRuntimeInput = {
  deploymentId: string;
  lifecycle: GovernanceLifecycleRuntimeResult;
  persistence: GovernancePersistenceRuntimeResult;
  store: GovernanceStoreRuntimeResult;
};

export type GovernanceRecoveryRuntimeResult = {
  version: GovernanceRecoveryVersion;
  status: GovernanceRecoveryStatus;
  strategy: GovernanceRecoveryStrategy;
  rollback: GovernanceRecoveryRollback;
  replay: GovernanceRecoveryReplay;
  partial: GovernanceRecoveryPartial;
  degraded: GovernanceRecoveryDegraded;
  audit: GovernanceRecoveryAudit;
  summary: GovernanceRecoverySummary;
  trace: string[];
};

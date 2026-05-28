import type {
  GovernanceActionQueueItem,
  GovernanceOrchestrationRuntimeResult,
  GovernanceOrchestrationTimeline,
} from "./orchestration.types";

export const GOVERNANCE_LIFECYCLE_VERSION = "v4-a3-r5-lifecycle-1" as const;
export type GovernanceLifecycleVersion = typeof GOVERNANCE_LIFECYCLE_VERSION;

export type GovernanceLifecycleStatus =
  | "created"
  | "pending"
  | "queued"
  | "running"
  | "waitingApproval"
  | "escalated"
  | "suspended"
  | "retrying"
  | "resumed"
  | "completed"
  | "archived"
  | "failed";

export type GovernanceLifecycleState = {
  lifecycleId: string;
  status: GovernanceLifecycleStatus;
  stepIndex: number;
  isComplete: boolean;
  isFailed: boolean;
  canReplay: boolean;
};

export type GovernanceLifecycleTransition = {
  transitionId: string;
  from: GovernanceLifecycleStatus;
  to: GovernanceLifecycleStatus;
  reason: string;
  timestamp: string;
};

export type GovernanceLifecycleRetry = {
  retryId: string;
  attempt: number;
  delayMs: number;
  reason: string;
  escalated: boolean;
  timestamp: string;
};

export type GovernanceLifecycleArchive = {
  archiveId: string;
  archived: boolean;
  archivedAt: string | null;
  reason: string;
};

export type GovernanceLifecycleSnapshot = {
  snapshotId: string;
  status: GovernanceLifecycleStatus;
  queueSize: number;
  timelineSize: number;
  capturedAt: string;
};

export type GovernanceLifecycleReplay = {
  replayId: string;
  supported: boolean;
  events: GovernanceOrchestrationTimeline["entries"];
  reason: string;
};

export type GovernanceLifecycleSummary = {
  summaryId: string;
  text: string;
  traceId: string;
};

export type GovernanceLifecycleRuntimeInput = {
  deploymentId: string;
  observedAt: string;
  orchestration: GovernanceOrchestrationRuntimeResult;
};

export type GovernanceLifecycleRuntimeResult = {
  version: GovernanceLifecycleVersion;
  state: GovernanceLifecycleState;
  transitions: GovernanceLifecycleTransition[];
  timeline: GovernanceOrchestrationTimeline["entries"];
  retries: GovernanceLifecycleRetry[];
  replay: GovernanceLifecycleReplay;
  archive: GovernanceLifecycleArchive;
  snapshots: GovernanceLifecycleSnapshot[];
  summary: GovernanceLifecycleSummary;
  queue: GovernanceActionQueueItem[];
};

/**
 * PL-4 — Release Operations types.
 * In-memory release core only — no IO / persistence / providers.
 */

export const RELEASE_OPERATIONS_ID = "pl-4-release-operations-v1" as const;

export const RELEASE_VERSION_CHANNELS = [
  "canary",
  "beta",
  "stable",
  "lts",
] as const;

export type ReleaseVersionChannel =
  (typeof RELEASE_VERSION_CHANNELS)[number];

export const RELEASE_STATES = [
  "draft",
  "approved",
  "rolling_out",
  "rolled_out",
  "paused",
  "aborted",
  "completed",
] as const;

export type ReleaseState = (typeof RELEASE_STATES)[number];

/** Deterministic release policy. */
export type ReleasePolicy = Readonly<{
  /** Maximum concurrent rolling_out releases. */
  maxConcurrentRollouts: number;
  /** Whether draft → rolling_out requires approval first. */
  requireApproval: boolean;
  /** Channels allowed for rollout. */
  allowedChannels: readonly ReleaseVersionChannel[];
  /** Maximum rollout percent (1–100). */
  maxRolloutPercent: number;
  /** Whether aborted releases may be restarted as draft. */
  allowRestart: boolean;
}>;

export const DEFAULT_RELEASE_POLICY: ReleasePolicy = {
  maxConcurrentRollouts: 3,
  requireApproval: true,
  allowedChannels: ["canary", "beta", "stable", "lts"],
  maxRolloutPercent: 100,
  allowRestart: true,
};

export type ReleaseRecord = Readonly<{
  releaseId: string;
  version: string;
  channel: ReleaseVersionChannel;
  state: ReleaseState;
  rolloutPercent: number;
  createdAt: number;
  updatedAt: number;
  approvedAt?: number;
  startedAt?: number;
  completedAt?: number;
  abortedAt?: number;
}>;

export type CreateReleaseInput = Readonly<{
  version: string;
  channel: ReleaseVersionChannel;
  /** Optional stable id — when omitted, manager assigns sequential id. */
  releaseId?: string;
}>;

export type ApproveReleaseInput = Readonly<{
  releaseId: string;
}>;

export type StartRolloutInput = Readonly<{
  releaseId: string;
  /** Initial rollout percent (default 1). */
  percent?: number;
}>;

export type AdvanceRolloutInput = Readonly<{
  releaseId: string;
  /** Absolute target percent. */
  percent: number;
}>;

export type PauseRolloutInput = Readonly<{
  releaseId: string;
}>;

export type ResumeRolloutInput = Readonly<{
  releaseId: string;
}>;

export type AbortReleaseInput = Readonly<{
  releaseId: string;
}>;

export type CompleteReleaseInput = Readonly<{
  releaseId: string;
}>;

export type RestartReleaseInput = Readonly<{
  releaseId: string;
}>;

export type RolloutSnapshot = Readonly<{
  at: number;
  releaseCount: number;
  draftCount: number;
  approvedCount: number;
  rollingOutCount: number;
  rolledOutCount: number;
  pausedCount: number;
  abortedCount: number;
  completedCount: number;
  policy: ReleasePolicy;
  releases: readonly ReleaseRecord[];
}>;

export type ReleaseManagerStatus = "idle" | "running" | "stopped";

export type ReleaseManagerSnapshot = Readonly<{
  managerId: string;
  layerId: typeof RELEASE_OPERATIONS_ID;
  status: ReleaseManagerStatus;
  clock: number;
  releaseCount: number;
  rollingOutCount: number;
}>;

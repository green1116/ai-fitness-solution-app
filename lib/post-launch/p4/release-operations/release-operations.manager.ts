/**
 * PL-4 — Release Operations Manager.
 * Minimal deterministic in-memory core — no IO / timers / providers.
 */

import {
  DEFAULT_RELEASE_POLICY,
  RELEASE_OPERATIONS_ID,
  RELEASE_STATES,
  RELEASE_VERSION_CHANNELS,
  type AbortReleaseInput,
  type AdvanceRolloutInput,
  type ApproveReleaseInput,
  type CompleteReleaseInput,
  type CreateReleaseInput,
  type PauseRolloutInput,
  type ReleaseManagerSnapshot,
  type ReleaseManagerStatus,
  type ReleasePolicy,
  type ReleaseRecord,
  type ReleaseState,
  type ReleaseVersionChannel,
  type RestartReleaseInput,
  type ResumeRolloutInput,
  type RolloutSnapshot,
  type StartRolloutInput,
} from "./release-operations.types";

function isChannel(value: string): value is ReleaseVersionChannel {
  return (RELEASE_VERSION_CHANNELS as readonly string[]).includes(value);
}

function isState(value: string): value is ReleaseState {
  return (RELEASE_STATES as readonly string[]).includes(value);
}

function cloneRelease(record: ReleaseRecord): ReleaseRecord {
  return { ...record };
}

function clonePolicy(policy: ReleasePolicy): ReleasePolicy {
  return {
    ...policy,
    allowedChannels: [...policy.allowedChannels],
  };
}

function assertPercent(name: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error(`${name} must be an integer between 0 and 100`);
  }
}

export type ReleaseOperationsManager = {
  readonly layerId: typeof RELEASE_OPERATIONS_ID;
  start: () => ReleaseManagerSnapshot;
  stop: () => ReleaseManagerSnapshot;
  status: () => ReleaseManagerSnapshot;
  getPolicy: () => ReleasePolicy;
  setPolicy: (policy: ReleasePolicy) => ReleasePolicy;
  createRelease: (input: CreateReleaseInput) => ReleaseRecord;
  getRelease: (releaseId: string) => ReleaseRecord | undefined;
  listReleases: (filter?: {
    channel?: ReleaseVersionChannel;
    state?: ReleaseState;
  }) => ReleaseRecord[];
  approve: (input: ApproveReleaseInput) => ReleaseRecord;
  startRollout: (input: StartRolloutInput) => ReleaseRecord;
  advanceRollout: (input: AdvanceRolloutInput) => ReleaseRecord;
  pauseRollout: (input: PauseRolloutInput) => ReleaseRecord;
  resumeRollout: (input: ResumeRolloutInput) => ReleaseRecord;
  abort: (input: AbortReleaseInput) => ReleaseRecord;
  complete: (input: CompleteReleaseInput) => ReleaseRecord;
  restart: (input: RestartReleaseInput) => ReleaseRecord;
  snapshot: () => RolloutSnapshot;
  reset: () => void;
};

/**
 * Create a deterministic in-memory release operations manager.
 * Logical clock + sequential ids — no wall clock / RNG / timers.
 */
export function createReleaseOperationsManager(
  managerId = "rel-mgr-1",
): ReleaseOperationsManager {
  let statusState: ReleaseManagerStatus = "idle";
  let clock = 0;
  let seq = 0;
  let policy: ReleasePolicy = clonePolicy(DEFAULT_RELEASE_POLICY);

  const releases = new Map<string, ReleaseRecord>();

  function tick(): number {
    clock += 1;
    return clock;
  }

  function nextId(prefix: string): string {
    seq += 1;
    return `${prefix}-${seq}`;
  }

  function rollingOutCount(): number {
    let count = 0;
    for (const release of releases.values()) {
      if (release.state === "rolling_out") count += 1;
    }
    return count;
  }

  function snapshotStatus(): ReleaseManagerSnapshot {
    return {
      managerId,
      layerId: RELEASE_OPERATIONS_ID,
      status: statusState,
      clock,
      releaseCount: releases.size,
      rollingOutCount: rollingOutCount(),
    };
  }

  function requireRunning(): void {
    if (statusState !== "running") {
      throw new Error(
        `release operations manager is not running: ${statusState}`,
      );
    }
  }

  function requireRelease(releaseId: string): ReleaseRecord {
    const id = releaseId.trim();
    const record = releases.get(id);
    if (!record) throw new Error(`release not found: ${id}`);
    return record;
  }

  return {
    layerId: RELEASE_OPERATIONS_ID,

    start(): ReleaseManagerSnapshot {
      if (statusState === "running") {
        throw new Error("release operations manager already running");
      }
      statusState = "running";
      tick();
      return snapshotStatus();
    },

    stop(): ReleaseManagerSnapshot {
      if (statusState !== "running") {
        throw new Error(
          `release operations manager cannot stop from: ${statusState}`,
        );
      }
      statusState = "stopped";
      tick();
      return snapshotStatus();
    },

    status(): ReleaseManagerSnapshot {
      return snapshotStatus();
    },

    getPolicy(): ReleasePolicy {
      return clonePolicy(policy);
    },

    setPolicy(next: ReleasePolicy): ReleasePolicy {
      requireRunning();
      if (
        !Number.isInteger(next.maxConcurrentRollouts) ||
        next.maxConcurrentRollouts < 1
      ) {
        throw new Error("maxConcurrentRollouts must be an integer >= 1");
      }
      assertPercent("maxRolloutPercent", next.maxRolloutPercent);
      if (next.maxRolloutPercent < 1) {
        throw new Error("maxRolloutPercent must be >= 1");
      }
      if (!Array.isArray(next.allowedChannels) || next.allowedChannels.length < 1) {
        throw new Error("allowedChannels must be a non-empty array");
      }
      for (const channel of next.allowedChannels) {
        if (!isChannel(channel)) {
          throw new Error(`invalid allowed channel: ${channel}`);
        }
      }
      policy = clonePolicy({
        ...next,
        allowedChannels: [...next.allowedChannels],
      });
      tick();
      return clonePolicy(policy);
    },

    createRelease(input: CreateReleaseInput): ReleaseRecord {
      requireRunning();
      const version = input.version.trim();
      if (!version) throw new Error("version is required");
      if (!isChannel(input.channel)) {
        throw new Error(`invalid channel: ${input.channel}`);
      }
      if (!policy.allowedChannels.includes(input.channel)) {
        throw new Error(`channel not allowed by policy: ${input.channel}`);
      }
      const releaseId =
        (input.releaseId ?? "").trim() || nextId("rel");
      if (releases.has(releaseId)) {
        throw new Error(`release already exists: ${releaseId}`);
      }
      const at = tick();
      const record: ReleaseRecord = {
        releaseId,
        version,
        channel: input.channel,
        state: "draft",
        rolloutPercent: 0,
        createdAt: at,
        updatedAt: at,
      };
      releases.set(releaseId, record);
      return cloneRelease(record);
    },

    getRelease(releaseId: string): ReleaseRecord | undefined {
      const record = releases.get(releaseId.trim());
      return record ? cloneRelease(record) : undefined;
    },

    listReleases(filter?: {
      channel?: ReleaseVersionChannel;
      state?: ReleaseState;
    }): ReleaseRecord[] {
      let result = [...releases.values()];
      if (filter?.channel) {
        if (!isChannel(filter.channel)) {
          throw new Error(`invalid channel filter: ${filter.channel}`);
        }
        result = result.filter((r) => r.channel === filter.channel);
      }
      if (filter?.state) {
        if (!isState(filter.state)) {
          throw new Error(`invalid state filter: ${filter.state}`);
        }
        result = result.filter((r) => r.state === filter.state);
      }
      return result
        .sort(
          (a, b) =>
            a.createdAt - b.createdAt ||
            a.releaseId.localeCompare(b.releaseId),
        )
        .map(cloneRelease);
    },

    approve(input: ApproveReleaseInput): ReleaseRecord {
      requireRunning();
      const current = requireRelease(input.releaseId);
      if (current.state !== "draft") {
        throw new Error(`cannot approve release in state: ${current.state}`);
      }
      const at = tick();
      const next: ReleaseRecord = {
        ...current,
        state: "approved",
        updatedAt: at,
        approvedAt: at,
      };
      releases.set(current.releaseId, next);
      return cloneRelease(next);
    },

    startRollout(input: StartRolloutInput): ReleaseRecord {
      requireRunning();
      const current = requireRelease(input.releaseId);
      const allowedFrom = policy.requireApproval
        ? current.state === "approved"
        : current.state === "draft" || current.state === "approved";
      if (!allowedFrom) {
        throw new Error(
          `cannot start rollout from state: ${current.state}`,
        );
      }
      if (rollingOutCount() >= policy.maxConcurrentRollouts) {
        throw new Error(
          `max concurrent rollouts reached: ${policy.maxConcurrentRollouts}`,
        );
      }
      const percent = input.percent ?? 1;
      assertPercent("percent", percent);
      if (percent < 1) throw new Error("percent must be >= 1");
      if (percent > policy.maxRolloutPercent) {
        throw new Error(
          `percent exceeds maxRolloutPercent: ${policy.maxRolloutPercent}`,
        );
      }
      const at = tick();
      const next: ReleaseRecord = {
        ...current,
        state: percent >= 100 ? "rolled_out" : "rolling_out",
        rolloutPercent: percent,
        updatedAt: at,
        startedAt: at,
      };
      releases.set(current.releaseId, next);
      return cloneRelease(next);
    },

    advanceRollout(input: AdvanceRolloutInput): ReleaseRecord {
      requireRunning();
      const current = requireRelease(input.releaseId);
      if (current.state !== "rolling_out" && current.state !== "paused") {
        throw new Error(
          `cannot advance rollout in state: ${current.state}`,
        );
      }
      assertPercent("percent", input.percent);
      if (input.percent < current.rolloutPercent) {
        throw new Error("percent cannot decrease via advanceRollout");
      }
      if (input.percent > policy.maxRolloutPercent) {
        throw new Error(
          `percent exceeds maxRolloutPercent: ${policy.maxRolloutPercent}`,
        );
      }
      if (input.percent < 1) throw new Error("percent must be >= 1");
      const at = tick();
      const nextState: ReleaseState =
        input.percent >= 100
          ? "rolled_out"
          : current.state === "paused"
            ? "paused"
            : "rolling_out";
      const next: ReleaseRecord = {
        ...current,
        state: nextState,
        rolloutPercent: input.percent,
        updatedAt: at,
      };
      releases.set(current.releaseId, next);
      return cloneRelease(next);
    },

    pauseRollout(input: PauseRolloutInput): ReleaseRecord {
      requireRunning();
      const current = requireRelease(input.releaseId);
      if (current.state !== "rolling_out") {
        throw new Error(`cannot pause release in state: ${current.state}`);
      }
      const at = tick();
      const next: ReleaseRecord = {
        ...current,
        state: "paused",
        updatedAt: at,
      };
      releases.set(current.releaseId, next);
      return cloneRelease(next);
    },

    resumeRollout(input: ResumeRolloutInput): ReleaseRecord {
      requireRunning();
      const current = requireRelease(input.releaseId);
      if (current.state !== "paused") {
        throw new Error(`cannot resume release in state: ${current.state}`);
      }
      if (rollingOutCount() >= policy.maxConcurrentRollouts) {
        throw new Error(
          `max concurrent rollouts reached: ${policy.maxConcurrentRollouts}`,
        );
      }
      const at = tick();
      const next: ReleaseRecord = {
        ...current,
        state: current.rolloutPercent >= 100 ? "rolled_out" : "rolling_out",
        updatedAt: at,
      };
      releases.set(current.releaseId, next);
      return cloneRelease(next);
    },

    abort(input: AbortReleaseInput): ReleaseRecord {
      requireRunning();
      const current = requireRelease(input.releaseId);
      if (
        current.state === "completed" ||
        current.state === "aborted" ||
        current.state === "draft"
      ) {
        throw new Error(`cannot abort release in state: ${current.state}`);
      }
      const at = tick();
      const next: ReleaseRecord = {
        ...current,
        state: "aborted",
        updatedAt: at,
        abortedAt: at,
      };
      releases.set(current.releaseId, next);
      return cloneRelease(next);
    },

    complete(input: CompleteReleaseInput): ReleaseRecord {
      requireRunning();
      const current = requireRelease(input.releaseId);
      if (current.state !== "rolled_out") {
        throw new Error(
          `cannot complete release in state: ${current.state}`,
        );
      }
      if (current.rolloutPercent < 100) {
        throw new Error("cannot complete until rolloutPercent is 100");
      }
      const at = tick();
      const next: ReleaseRecord = {
        ...current,
        state: "completed",
        updatedAt: at,
        completedAt: at,
      };
      releases.set(current.releaseId, next);
      return cloneRelease(next);
    },

    restart(input: RestartReleaseInput): ReleaseRecord {
      requireRunning();
      if (!policy.allowRestart) {
        throw new Error("restart is disabled by policy");
      }
      const current = requireRelease(input.releaseId);
      if (current.state !== "aborted" && current.state !== "completed") {
        throw new Error(`cannot restart release in state: ${current.state}`);
      }
      const at = tick();
      const next: ReleaseRecord = {
        releaseId: current.releaseId,
        version: current.version,
        channel: current.channel,
        state: "draft",
        rolloutPercent: 0,
        createdAt: current.createdAt,
        updatedAt: at,
      };
      releases.set(current.releaseId, next);
      return cloneRelease(next);
    },

    snapshot(): RolloutSnapshot {
      const list = this.listReleases();
      let draftCount = 0;
      let approvedCount = 0;
      let rollingOutCount = 0;
      let rolledOutCount = 0;
      let pausedCount = 0;
      let abortedCount = 0;
      let completedCount = 0;
      for (const release of list) {
        if (release.state === "draft") draftCount += 1;
        else if (release.state === "approved") approvedCount += 1;
        else if (release.state === "rolling_out") rollingOutCount += 1;
        else if (release.state === "rolled_out") rolledOutCount += 1;
        else if (release.state === "paused") pausedCount += 1;
        else if (release.state === "aborted") abortedCount += 1;
        else if (release.state === "completed") completedCount += 1;
      }
      return {
        at: clock,
        releaseCount: list.length,
        draftCount,
        approvedCount,
        rollingOutCount,
        rolledOutCount,
        pausedCount,
        abortedCount,
        completedCount,
        policy: clonePolicy(policy),
        releases: list,
      };
    },

    reset(): void {
      statusState = "idle";
      clock = 0;
      seq = 0;
      policy = clonePolicy(DEFAULT_RELEASE_POLICY);
      releases.clear();
    },
  };
}

/** Public enum surfaces for stable consumer imports. */
export const RELEASE_OPERATIONS_PUBLIC_ENUMS = {
  channel: RELEASE_VERSION_CHANNELS,
  state: RELEASE_STATES,
} as const;

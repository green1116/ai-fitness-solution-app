/**
 * PL-5 — Maintenance Manager.
 * Minimal deterministic in-memory core — no IO / timers / providers.
 */

import {
  DEFAULT_MAINTENANCE_POLICY,
  MAINTENANCE_ID,
  MAINTENANCE_STATES,
  type ActivateMaintenanceInput,
  type CancelMaintenanceInput,
  type CompleteMaintenanceInput,
  type ExtendMaintenanceInput,
  type MaintenanceManagerSnapshot,
  type MaintenanceManagerStatus,
  type MaintenancePolicy,
  type MaintenanceSchedule,
  type MaintenanceSnapshot,
  type MaintenanceState,
  type MaintenanceWindow,
  type PauseMaintenanceInput,
  type RescheduleMaintenanceInput,
  type ResumeMaintenanceInput,
  type ScheduleMaintenanceInput,
} from "./maintenance.types";

function isState(value: string): value is MaintenanceState {
  return (MAINTENANCE_STATES as readonly string[]).includes(value);
}

function cloneWindow(record: MaintenanceWindow): MaintenanceWindow {
  return { ...record };
}

function clonePolicy(policy: MaintenancePolicy): MaintenancePolicy {
  return { ...policy };
}

function assertLogicalTime(name: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be an integer >= 0`);
  }
}

function assertDuration(
  startAt: number,
  endAt: number,
  policy: MaintenancePolicy,
): void {
  if (endAt <= startAt) {
    throw new Error("endAt must be greater than startAt");
  }
  const duration = endAt - startAt;
  if (duration < policy.minDuration) {
    throw new Error(`duration below minDuration: ${policy.minDuration}`);
  }
  if (duration > policy.maxDuration) {
    throw new Error(`duration above maxDuration: ${policy.maxDuration}`);
  }
}

export type MaintenanceManager = {
  readonly layerId: typeof MAINTENANCE_ID;
  start: () => MaintenanceManagerSnapshot;
  stop: () => MaintenanceManagerSnapshot;
  status: () => MaintenanceManagerSnapshot;
  getPolicy: () => MaintenancePolicy;
  setPolicy: (policy: MaintenancePolicy) => MaintenancePolicy;
  scheduleWindow: (input: ScheduleMaintenanceInput) => MaintenanceWindow;
  getWindow: (maintenanceId: string) => MaintenanceWindow | undefined;
  listWindows: (filter?: {
    state?: MaintenanceState;
    serviceId?: string;
  }) => MaintenanceWindow[];
  getSchedule: () => MaintenanceSchedule;
  activate: (input: ActivateMaintenanceInput) => MaintenanceWindow;
  pause: (input: PauseMaintenanceInput) => MaintenanceWindow;
  resume: (input: ResumeMaintenanceInput) => MaintenanceWindow;
  complete: (input: CompleteMaintenanceInput) => MaintenanceWindow;
  cancel: (input: CancelMaintenanceInput) => MaintenanceWindow;
  extend: (input: ExtendMaintenanceInput) => MaintenanceWindow;
  reschedule: (input: RescheduleMaintenanceInput) => MaintenanceWindow;
  snapshot: () => MaintenanceSnapshot;
  reset: () => void;
};

/**
 * Create a deterministic in-memory maintenance manager.
 * Logical clock + sequential ids — no wall clock / RNG / timers.
 */
export function createMaintenanceManager(
  managerId = "mnt-mgr-1",
): MaintenanceManager {
  let statusState: MaintenanceManagerStatus = "idle";
  let clock = 0;
  let seq = 0;
  let policy: MaintenancePolicy = clonePolicy(DEFAULT_MAINTENANCE_POLICY);

  const windows = new Map<string, MaintenanceWindow>();

  function tick(): number {
    clock += 1;
    return clock;
  }

  function nextId(prefix: string): string {
    seq += 1;
    return `${prefix}-${seq}`;
  }

  function activeCount(): number {
    let count = 0;
    for (const window of windows.values()) {
      if (window.state === "active") count += 1;
    }
    return count;
  }

  function snapshotStatus(): MaintenanceManagerSnapshot {
    return {
      managerId,
      layerId: MAINTENANCE_ID,
      status: statusState,
      clock,
      windowCount: windows.size,
      activeCount: activeCount(),
    };
  }

  function requireRunning(): void {
    if (statusState !== "running") {
      throw new Error(`maintenance manager is not running: ${statusState}`);
    }
  }

  function requireWindow(maintenanceId: string): MaintenanceWindow {
    const id = maintenanceId.trim();
    const record = windows.get(id);
    if (!record) throw new Error(`maintenance window not found: ${id}`);
    return record;
  }

  function listSorted(filter?: {
    state?: MaintenanceState;
    serviceId?: string;
  }): MaintenanceWindow[] {
    let result = [...windows.values()];
    if (filter?.state) {
      if (!isState(filter.state)) {
        throw new Error(`invalid state filter: ${filter.state}`);
      }
      result = result.filter((w) => w.state === filter.state);
    }
    if (filter?.serviceId) {
      const sid = filter.serviceId.trim();
      result = result.filter((w) => w.serviceId === sid);
    }
    return result
      .sort(
        (a, b) =>
          a.startAt - b.startAt ||
          a.createdAt - b.createdAt ||
          a.maintenanceId.localeCompare(b.maintenanceId),
      )
      .map(cloneWindow);
  }

  return {
    layerId: MAINTENANCE_ID,

    start(): MaintenanceManagerSnapshot {
      if (statusState === "running") {
        throw new Error("maintenance manager already running");
      }
      statusState = "running";
      tick();
      return snapshotStatus();
    },

    stop(): MaintenanceManagerSnapshot {
      if (statusState !== "running") {
        throw new Error(
          `maintenance manager cannot stop from: ${statusState}`,
        );
      }
      statusState = "stopped";
      tick();
      return snapshotStatus();
    },

    status(): MaintenanceManagerSnapshot {
      return snapshotStatus();
    },

    getPolicy(): MaintenancePolicy {
      return clonePolicy(policy);
    },

    setPolicy(next: MaintenancePolicy): MaintenancePolicy {
      requireRunning();
      if (
        !Number.isInteger(next.maxConcurrentActive) ||
        next.maxConcurrentActive < 1
      ) {
        throw new Error("maxConcurrentActive must be an integer >= 1");
      }
      assertLogicalTime("minDuration", next.minDuration);
      assertLogicalTime("maxDuration", next.maxDuration);
      if (next.minDuration < 1) {
        throw new Error("minDuration must be >= 1");
      }
      if (next.maxDuration < next.minDuration) {
        throw new Error("maxDuration must be >= minDuration");
      }
      policy = clonePolicy(next);
      tick();
      return clonePolicy(policy);
    },

    scheduleWindow(input: ScheduleMaintenanceInput): MaintenanceWindow {
      requireRunning();
      const title = input.title.trim();
      if (!title) throw new Error("title is required");
      assertLogicalTime("startAt", input.startAt);
      assertLogicalTime("endAt", input.endAt);
      assertDuration(input.startAt, input.endAt, policy);
      const maintenanceId =
        (input.maintenanceId ?? "").trim() || nextId("mnt");
      if (windows.has(maintenanceId)) {
        throw new Error(`maintenance window already exists: ${maintenanceId}`);
      }
      const serviceId = input.serviceId?.trim() || undefined;
      const at = tick();
      const record: MaintenanceWindow = {
        maintenanceId,
        title,
        state: "scheduled",
        startAt: input.startAt,
        endAt: input.endAt,
        serviceId,
        createdAt: at,
        updatedAt: at,
      };
      windows.set(maintenanceId, record);
      return cloneWindow(record);
    },

    getWindow(maintenanceId: string): MaintenanceWindow | undefined {
      const record = windows.get(maintenanceId.trim());
      return record ? cloneWindow(record) : undefined;
    },

    listWindows(filter?: {
      state?: MaintenanceState;
      serviceId?: string;
    }): MaintenanceWindow[] {
      return listSorted(filter);
    },

    getSchedule(): MaintenanceSchedule {
      const scheduled = listSorted().filter(
        (w) =>
          w.state === "scheduled" ||
          w.state === "active" ||
          w.state === "paused",
      );
      return {
        at: clock,
        windowCount: scheduled.length,
        windows: scheduled,
      };
    },

    activate(input: ActivateMaintenanceInput): MaintenanceWindow {
      requireRunning();
      const current = requireWindow(input.maintenanceId);
      if (current.state !== "scheduled") {
        throw new Error(
          `cannot activate maintenance in state: ${current.state}`,
        );
      }
      if (activeCount() >= policy.maxConcurrentActive) {
        throw new Error(
          `max concurrent active reached: ${policy.maxConcurrentActive}`,
        );
      }
      const at = tick();
      const next: MaintenanceWindow = {
        ...current,
        state: "active",
        updatedAt: at,
        activatedAt: at,
      };
      windows.set(current.maintenanceId, next);
      return cloneWindow(next);
    },

    pause(input: PauseMaintenanceInput): MaintenanceWindow {
      requireRunning();
      const current = requireWindow(input.maintenanceId);
      if (current.state !== "active") {
        throw new Error(`cannot pause maintenance in state: ${current.state}`);
      }
      const at = tick();
      const next: MaintenanceWindow = {
        ...current,
        state: "paused",
        updatedAt: at,
      };
      windows.set(current.maintenanceId, next);
      return cloneWindow(next);
    },

    resume(input: ResumeMaintenanceInput): MaintenanceWindow {
      requireRunning();
      const current = requireWindow(input.maintenanceId);
      if (current.state !== "paused") {
        throw new Error(`cannot resume maintenance in state: ${current.state}`);
      }
      if (activeCount() >= policy.maxConcurrentActive) {
        throw new Error(
          `max concurrent active reached: ${policy.maxConcurrentActive}`,
        );
      }
      const at = tick();
      const next: MaintenanceWindow = {
        ...current,
        state: "active",
        updatedAt: at,
      };
      windows.set(current.maintenanceId, next);
      return cloneWindow(next);
    },

    complete(input: CompleteMaintenanceInput): MaintenanceWindow {
      requireRunning();
      const current = requireWindow(input.maintenanceId);
      if (current.state !== "active" && current.state !== "paused") {
        throw new Error(
          `cannot complete maintenance in state: ${current.state}`,
        );
      }
      const at = tick();
      const next: MaintenanceWindow = {
        ...current,
        state: "completed",
        updatedAt: at,
        completedAt: at,
      };
      windows.set(current.maintenanceId, next);
      return cloneWindow(next);
    },

    cancel(input: CancelMaintenanceInput): MaintenanceWindow {
      requireRunning();
      const current = requireWindow(input.maintenanceId);
      if (
        current.state === "completed" ||
        current.state === "cancelled"
      ) {
        throw new Error(
          `cannot cancel maintenance in state: ${current.state}`,
        );
      }
      const at = tick();
      const next: MaintenanceWindow = {
        ...current,
        state: "cancelled",
        updatedAt: at,
        cancelledAt: at,
      };
      windows.set(current.maintenanceId, next);
      return cloneWindow(next);
    },

    extend(input: ExtendMaintenanceInput): MaintenanceWindow {
      requireRunning();
      if (!policy.allowExtend) {
        throw new Error("extend is disabled by policy");
      }
      const current = requireWindow(input.maintenanceId);
      if (current.state !== "active" && current.state !== "paused") {
        throw new Error(`cannot extend maintenance in state: ${current.state}`);
      }
      assertLogicalTime("endAt", input.endAt);
      if (input.endAt <= current.endAt) {
        throw new Error("endAt must be greater than current endAt");
      }
      assertDuration(current.startAt, input.endAt, policy);
      const at = tick();
      const next: MaintenanceWindow = {
        ...current,
        endAt: input.endAt,
        updatedAt: at,
      };
      windows.set(current.maintenanceId, next);
      return cloneWindow(next);
    },

    reschedule(input: RescheduleMaintenanceInput): MaintenanceWindow {
      requireRunning();
      if (!policy.allowReschedule) {
        throw new Error("reschedule is disabled by policy");
      }
      const current = requireWindow(input.maintenanceId);
      if (current.state !== "cancelled" && current.state !== "scheduled") {
        throw new Error(
          `cannot reschedule maintenance in state: ${current.state}`,
        );
      }
      assertLogicalTime("startAt", input.startAt);
      assertLogicalTime("endAt", input.endAt);
      assertDuration(input.startAt, input.endAt, policy);
      const at = tick();
      const next: MaintenanceWindow = {
        ...current,
        state: "scheduled",
        startAt: input.startAt,
        endAt: input.endAt,
        updatedAt: at,
        activatedAt: undefined,
        completedAt: undefined,
        cancelledAt: undefined,
      };
      windows.set(current.maintenanceId, next);
      return cloneWindow(next);
    },

    snapshot(): MaintenanceSnapshot {
      const list = listSorted();
      let scheduledCount = 0;
      let activeCount = 0;
      let pausedCount = 0;
      let completedCount = 0;
      let cancelledCount = 0;
      for (const window of list) {
        if (window.state === "scheduled") scheduledCount += 1;
        else if (window.state === "active") activeCount += 1;
        else if (window.state === "paused") pausedCount += 1;
        else if (window.state === "completed") completedCount += 1;
        else if (window.state === "cancelled") cancelledCount += 1;
      }
      const schedule = this.getSchedule();
      return {
        at: clock,
        windowCount: list.length,
        scheduledCount,
        activeCount,
        pausedCount,
        completedCount,
        cancelledCount,
        policy: clonePolicy(policy),
        windows: list,
        schedule,
      };
    },

    reset(): void {
      statusState = "idle";
      clock = 0;
      seq = 0;
      policy = clonePolicy(DEFAULT_MAINTENANCE_POLICY);
      windows.clear();
    },
  };
}

/** Public enum surfaces for stable consumer imports. */
export const MAINTENANCE_PUBLIC_ENUMS = {
  state: MAINTENANCE_STATES,
} as const;

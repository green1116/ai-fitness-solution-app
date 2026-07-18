/**
 * E09-P2 — Regional Hub Runtime
 * Instance-based runtime: initialize → start → stop + status
 */

import {
  E09_REGIONAL_ID,
  E09_REGIONAL_VERSION,
} from "./regional.constants";
import type { Region } from "./regional.types";
import {
  attachRegion,
  clearHubs,
  createHub,
  detachHub,
  getHub,
  listHubs,
  type CreateRegionalHubInput,
  type RegionalHub,
} from "./regional.hub";

export const REGIONAL_RUNTIME_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;

export type RegionalRuntimeStatus =
  (typeof REGIONAL_RUNTIME_STATUSES)[number];

export type RegionalRuntimeSnapshot = {
  runtimeId: string;
  status: RegionalRuntimeStatus;
  regionalId: typeof E09_REGIONAL_ID;
  version: typeof E09_REGIONAL_VERSION;
  hubCount: number;
  regionAttachmentCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type RegionalRuntime = {
  initialize: () => RegionalRuntimeSnapshot;
  start: () => RegionalRuntimeSnapshot;
  stop: () => RegionalRuntimeSnapshot;
  status: () => RegionalRuntimeSnapshot;
  createHub: (input: CreateRegionalHubInput) => RegionalHub;
  attachRegion: (hubId: string, region: Region) => RegionalHub;
  getHub: (id: string) => RegionalHub | undefined;
  detachHub: (id: string) => boolean;
  listHubs: () => RegionalHub[];
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function attachmentCount(): number {
  return listHubs().reduce((sum, hub) => sum + hub.regionIds.length, 0);
}

export function createRegionalRuntime(options?: {
  runtimeId?: string;
}): RegionalRuntime {
  const runtimeId = options?.runtimeId?.trim() || createId("reg-runtime");
  let state: RegionalRuntimeStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): RegionalRuntimeSnapshot {
    return {
      runtimeId,
      status: state,
      regionalId: E09_REGIONAL_ID,
      version: E09_REGIONAL_VERSION,
      hubCount: listHubs().length,
      regionAttachmentCount: attachmentCount(),
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): RegionalRuntimeSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }

    clearHubs();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): RegionalRuntimeSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(
        `start requires READY or STOPPED (current=${state})`,
      );
    }

    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): RegionalRuntimeSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }

    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    createHub: (input) => {
      assertRunning("createHub");
      return createHub(input);
    },
    attachRegion: (hubId, region) => {
      assertRunning("attachRegion");
      return attachRegion(hubId, region);
    },
    getHub: (id) => getHub(id),
    detachHub: (id) => {
      assertRunning("detachHub");
      return detachHub(id);
    },
    listHubs: () => listHubs(),
  };
}

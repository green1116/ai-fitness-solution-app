/**
 * E10-P1 — Platform Runtime Stub
 * Instance-based runtime: initialize → start → stop + status
 * Kernel only — no event bus / gateway / scheduler / policy engine
 */

import {
  E10_PLATFORM_ID,
  E10_PLATFORM_VERSION,
  PLATFORM_RUNTIME_STATUSES,
} from "./platform.constants";
import { clearLifecycles } from "./platform.lifecycle";
import {
  clearModules,
  listModules,
} from "./platform.registry";
import type { PlatformRuntimeStatus } from "./platform.types";

export type PlatformRuntimeSnapshot = {
  runtimeId: string;
  status: PlatformRuntimeStatus;
  platformId: typeof E10_PLATFORM_ID;
  version: typeof E10_PLATFORM_VERSION;
  moduleCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type PlatformRuntime = {
  initialize: () => PlatformRuntimeSnapshot;
  start: () => PlatformRuntimeSnapshot;
  stop: () => PlatformRuntimeSnapshot;
  status: () => PlatformRuntimeSnapshot;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createPlatformRuntime(options?: {
  runtimeId?: string;
}): PlatformRuntime {
  const runtimeId =
    options?.runtimeId?.trim() || createId("e10-runtime");
  let state: PlatformRuntimeStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): PlatformRuntimeSnapshot {
    return {
      runtimeId,
      status: state,
      platformId: E10_PLATFORM_ID,
      version: E10_PLATFORM_VERSION,
      moduleCount: listModules().length,
      startedAt,
      stoppedAt,
    };
  }

  function initialize(): PlatformRuntimeSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }

    clearLifecycles();
    clearModules();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): PlatformRuntimeSnapshot {
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

  function stop(): PlatformRuntimeSnapshot {
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
  };
}

export { PLATFORM_RUNTIME_STATUSES };

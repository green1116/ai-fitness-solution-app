/**
 * E11-P1 — Cloud Runtime Manager
 * Orchestrates registry, lifecycle, execution context, health
 */

import {
  E11_CLOUD_RUNTIME_ID,
  E11_CLOUD_RUNTIME_VERSION,
} from "../core/cloud.constants";
import {
  clearRuntimes,
  getRuntime,
  listRuntimes,
} from "../registry/cloud.registry";
import type {
  CloudExecutionContext,
  CloudHealthReport,
  CloudManagerStatus,
  CloudRuntimeRecord,
  CloudStatusSnapshot,
  OpenCloudContextInput,
  RegisterCloudRuntimeInput,
} from "../types/cloud.types";
import {
  activateContext,
  clearContexts,
  closeContext,
  getContext,
  listContexts,
  openContext,
} from "./cloud.context";
import {
  clearLifecycles,
  createRuntime,
  failRuntime,
  getRuntimeLifecycle,
  registerCreatedRuntime,
  removeCreatedRuntime,
  startRuntime,
  stopRuntime,
} from "./cloud.lifecycle";
import {
  checkAllRuntimeHealth,
  checkRuntimeHealth,
  captureCloudStatusSnapshot,
} from "./cloud.health";

export type CloudRuntimeManagerSnapshot = {
  managerId: string;
  status: CloudManagerStatus;
  layerId: typeof E11_CLOUD_RUNTIME_ID;
  version: typeof E11_CLOUD_RUNTIME_VERSION;
  runtimeCount: number;
  activeCount: number;
  contextCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type CloudRuntimeManager = {
  initialize: () => CloudRuntimeManagerSnapshot;
  start: () => CloudRuntimeManagerSnapshot;
  stop: () => CloudRuntimeManagerSnapshot;
  status: () => CloudRuntimeManagerSnapshot;
  createRuntime: (input: RegisterCloudRuntimeInput) => CloudRuntimeRecord;
  registerRuntime: (runtime: CloudRuntimeRecord) => CloudRuntimeRecord;
  startRuntime: (id: string) => CloudRuntimeRecord;
  stopRuntime: (id: string) => CloudRuntimeRecord;
  failRuntime: (id: string, note?: string) => CloudRuntimeRecord;
  removeRuntime: (id: string) => boolean;
  getRuntime: typeof getRuntime;
  listRuntimes: typeof listRuntimes;
  getLifecycle: typeof getRuntimeLifecycle;
  openContext: (input: OpenCloudContextInput) => CloudExecutionContext;
  activateContext: (contextId: string) => CloudExecutionContext;
  closeContext: (contextId: string) => CloudExecutionContext;
  getContext: typeof getContext;
  listContexts: typeof listContexts;
  checkHealth: (runtimeId: string) => CloudHealthReport;
  checkAllHealth: () => CloudHealthReport[];
  snapshot: () => CloudStatusSnapshot;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createCloudRuntimeManager(options?: {
  managerId?: string;
}): CloudRuntimeManager {
  const managerId =
    options?.managerId?.trim() || createId("e11-cloud-mgr");
  let state: CloudManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): CloudRuntimeManagerSnapshot {
    const runtimes = listRuntimes();
    return {
      managerId,
      status: state,
      layerId: E11_CLOUD_RUNTIME_ID,
      version: E11_CLOUD_RUNTIME_VERSION,
      runtimeCount: runtimes.length,
      activeCount: runtimes.filter((r) => r.status === "ACTIVE").length,
      contextCount: listContexts().length,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): CloudRuntimeManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearContexts();
    clearLifecycles();
    clearRuntimes();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): CloudRuntimeManagerSnapshot {
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

  function stop(): CloudRuntimeManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    for (const ctx of listContexts({ status: "ACTIVE" })) {
      closeContext(ctx.contextId);
    }
    for (const ctx of listContexts({ status: "OPEN" })) {
      closeContext(ctx.contextId);
    }
    for (const runtime of listRuntimes({ status: "ACTIVE" })) {
      try {
        stopRuntime(runtime.id);
      } catch {
        // ignore stop errors on shutdown
      }
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
    createRuntime: (input) => {
      assertRunning("createRuntime");
      return createRuntime(input);
    },
    registerRuntime: (runtime) => {
      assertRunning("registerRuntime");
      return registerCreatedRuntime(runtime);
    },
    startRuntime: (id) => {
      assertRunning("startRuntime");
      return startRuntime(id);
    },
    stopRuntime: (id) => {
      assertRunning("stopRuntime");
      return stopRuntime(id);
    },
    failRuntime: (id, note) => {
      assertRunning("failRuntime");
      return failRuntime(id, note);
    },
    removeRuntime: (id) => {
      assertRunning("removeRuntime");
      return removeCreatedRuntime(id);
    },
    getRuntime,
    listRuntimes,
    getLifecycle: getRuntimeLifecycle,
    openContext: (input) => {
      assertRunning("openContext");
      return openContext(input);
    },
    activateContext: (contextId) => {
      assertRunning("activateContext");
      return activateContext(contextId);
    },
    closeContext: (contextId) => {
      assertRunning("closeContext");
      return closeContext(contextId);
    },
    getContext,
    listContexts,
    checkHealth: checkRuntimeHealth,
    checkAllHealth: checkAllRuntimeHealth,
    snapshot: () => captureCloudStatusSnapshot(state),
  };
}

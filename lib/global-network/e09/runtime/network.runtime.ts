/**
 * E09-P1 — Global Network Runtime Kernel
 * Instance-based runtime: initialize → start → stop + status
 */

import {
  E09_GLOBAL_NETWORK_PLATFORM_ID,
  E09_GLOBAL_NETWORK_VERSION,
} from "../core/global.constants";
import { createNetworkGraph, type NetworkGraph } from "../network/network.graph";
import {
  createNetworkExecutor,
  type NetworkAction,
  type NetworkExecutionResult,
  type NetworkExecutor,
} from "./network.executor";
import {
  createNetworkTraceStore,
  type NetworkRuntimeTrace,
  type NetworkRuntimeTraceEvent,
  type NetworkRuntimeTraceKind,
  type NetworkTraceStore,
} from "./network.trace";

export const NETWORK_RUNTIME_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;

export type NetworkRuntimeStatus =
  (typeof NETWORK_RUNTIME_STATUSES)[number];

export type NetworkRuntimeSnapshot = {
  runtimeId: string;
  status: NetworkRuntimeStatus;
  platformId: typeof E09_GLOBAL_NETWORK_PLATFORM_ID;
  version: typeof E09_GLOBAL_NETWORK_VERSION;
  nodeCount: number;
  edgeCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type NetworkRuntime = {
  initialize: () => NetworkRuntimeSnapshot;
  start: () => NetworkRuntimeSnapshot;
  stop: () => NetworkRuntimeSnapshot;
  status: () => NetworkRuntimeSnapshot;
  execute: (action: NetworkAction) => NetworkExecutionResult;
  getGraph: () => NetworkGraph;
  getExecutor: () => NetworkExecutor;
  getTraces: (filter?: {
    kind?: NetworkRuntimeTraceKind;
  }) => NetworkRuntimeTraceEvent[];
  getTrace: () => NetworkRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createNetworkRuntime(options?: {
  runtimeId?: string;
}): NetworkRuntime {
  const runtimeId = options?.runtimeId?.trim() || createId("gn-runtime");
  let state: NetworkRuntimeStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  const graph = createNetworkGraph();
  const traces: NetworkTraceStore = createNetworkTraceStore({ runtimeId });
  const executor = createNetworkExecutor({
    graph,
    traces,
    isRunning: () => state === "RUNNING",
  });

  function snapshot(): NetworkRuntimeSnapshot {
    return {
      runtimeId,
      status: state,
      platformId: E09_GLOBAL_NETWORK_PLATFORM_ID,
      version: E09_GLOBAL_NETWORK_VERSION,
      nodeCount: graph.nodeCount(),
      edgeCount: graph.edgeCount(),
      startedAt,
      stoppedAt,
    };
  }

  function initialize(): NetworkRuntimeSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }

    graph.clear();
    traces.clear();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";

    traces.record("ready", `runtime ${runtimeId} initialized`, {
      status: state,
    });

    return snapshot();
  }

  function start(): NetworkRuntimeSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(
        `start requires READY or STOPPED (current=${state})`,
      );
    }

    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;

    traces.record("start", `runtime ${runtimeId} started`, {
      status: state,
    });

    return snapshot();
  }

  function stop(): NetworkRuntimeSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }

    state = "STOPPED";
    stoppedAt = nowIso();

    traces.record("stop", `runtime ${runtimeId} stopped`, {
      status: state,
      nodeCount: String(graph.nodeCount()),
      edgeCount: String(graph.edgeCount()),
    });

    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    execute: (action) => executor.execute(action),
    getGraph: () => graph,
    getExecutor: () => executor,
    getTraces: (filter) => traces.getTraces(filter),
    getTrace: () => traces.getTrace(),
  };
}

/**
 * E09-P4 — Federation Runtime
 * Instance-based runtime: initialize → start → stop + status
 */

import {
  E09_FEDERATION_ID,
  E09_FEDERATION_VERSION,
} from "./federation.constants";
import {
  createFederationExecutor,
  type FederationAction,
  type FederationExecutionResult,
  type FederationExecutor,
} from "./federation.executor";
import {
  buildTrustGraph,
  clearTrustGraph,
} from "./federation.graph";
import {
  clearFederations,
  listFederations,
} from "./federation.registry";

export const FEDERATION_RUNTIME_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;

export type FederationRuntimeStatus =
  (typeof FEDERATION_RUNTIME_STATUSES)[number];

export type FederationRuntimeSnapshot = {
  runtimeId: string;
  status: FederationRuntimeStatus;
  federationId: typeof E09_FEDERATION_ID;
  version: typeof E09_FEDERATION_VERSION;
  federationCount: number;
  trustEdgeCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type FederationRuntime = {
  initialize: () => FederationRuntimeSnapshot;
  start: () => FederationRuntimeSnapshot;
  stop: () => FederationRuntimeSnapshot;
  status: () => FederationRuntimeSnapshot;
  execute: (action: FederationAction) => FederationExecutionResult;
  getExecutor: () => FederationExecutor;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createFederationRuntime(options?: {
  runtimeId?: string;
}): FederationRuntime {
  const runtimeId = options?.runtimeId?.trim() || createId("fed-runtime");
  let state: FederationRuntimeStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  const executor = createFederationExecutor({
    isRunning: () => state === "RUNNING",
  });

  function snapshot(): FederationRuntimeSnapshot {
    const graph = buildTrustGraph();
    return {
      runtimeId,
      status: state,
      federationId: E09_FEDERATION_ID,
      version: E09_FEDERATION_VERSION,
      federationCount: listFederations().length,
      trustEdgeCount: graph.edgeCount,
      startedAt,
      stoppedAt,
    };
  }

  function initialize(): FederationRuntimeSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }

    clearFederations();
    clearTrustGraph();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): FederationRuntimeSnapshot {
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

  function stop(): FederationRuntimeSnapshot {
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
    execute: (action) => executor.execute(action),
    getExecutor: () => executor,
  };
}

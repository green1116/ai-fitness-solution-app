/**
 * E09-P5 — Economy Runtime
 * Instance-based runtime: initialize → start → stop + status
 */

import {
  E09_ECONOMY_ID,
  E09_ECONOMY_VERSION,
  ECONOMY_RUNTIME_STATUSES,
} from "./economy.constants";
import {
  clearValueFlows,
  createValueFlow,
  getFlowPaths,
  linkFlow,
  listFlowLinks,
  listValueFlows,
  settleFlow,
} from "./economy.flow";
import {
  clearEconomicNodes,
  getEconomicNode,
  listEconomicNodes,
  registerEconomicNode,
  removeEconomicNode,
} from "./economy.registry";
import type {
  CreateValueFlowInput,
  EconomicNode,
  FlowLink,
  FlowPath,
  RegisterEconomicNodeInput,
  ValueFlow,
} from "./economy.types";

export type EconomyRuntimeStatus =
  (typeof ECONOMY_RUNTIME_STATUSES)[number];

export type EconomyRuntimeSnapshot = {
  runtimeId: string;
  status: EconomyRuntimeStatus;
  economyId: typeof E09_ECONOMY_ID;
  version: typeof E09_ECONOMY_VERSION;
  nodeCount: number;
  flowCount: number;
  linkCount: number;
  settledCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type EconomyRuntime = {
  initialize: () => EconomyRuntimeSnapshot;
  start: () => EconomyRuntimeSnapshot;
  stop: () => EconomyRuntimeSnapshot;
  status: () => EconomyRuntimeSnapshot;
  registerEconomicNode: (input: RegisterEconomicNodeInput) => EconomicNode;
  getEconomicNode: (id: string) => EconomicNode | undefined;
  listEconomicNodes: typeof listEconomicNodes;
  removeEconomicNode: (id: string) => boolean;
  createValueFlow: (input: CreateValueFlowInput) => ValueFlow;
  linkFlow: (input: {
    flowId: string;
    fromId: string;
    toId: string;
    capacity?: number;
  }) => FlowLink;
  getFlowPaths: (
    sourceId: string,
    targetId: string,
    options?: { maxDepth?: number; flowId?: string },
  ) => FlowPath[];
  settleFlow: (flowId: string) => ValueFlow;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createEconomyRuntime(options?: {
  runtimeId?: string;
}): EconomyRuntime {
  const runtimeId = options?.runtimeId?.trim() || createId("eco-runtime");
  let state: EconomyRuntimeStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): EconomyRuntimeSnapshot {
    const flows = listValueFlows();
    return {
      runtimeId,
      status: state,
      economyId: E09_ECONOMY_ID,
      version: E09_ECONOMY_VERSION,
      nodeCount: listEconomicNodes().length,
      flowCount: flows.length,
      linkCount: listFlowLinks().length,
      settledCount: flows.filter((f) => f.status === "SETTLED").length,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): EconomyRuntimeSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }

    clearValueFlows();
    clearEconomicNodes();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): EconomyRuntimeSnapshot {
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

  function stop(): EconomyRuntimeSnapshot {
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
    registerEconomicNode: (input) => {
      assertRunning("registerEconomicNode");
      return registerEconomicNode(input);
    },
    getEconomicNode: (id) => getEconomicNode(id),
    listEconomicNodes,
    removeEconomicNode: (id) => {
      assertRunning("removeEconomicNode");
      return removeEconomicNode(id);
    },
    createValueFlow: (input) => {
      assertRunning("createValueFlow");
      return createValueFlow(input);
    },
    linkFlow: (input) => {
      assertRunning("linkFlow");
      return linkFlow(input);
    },
    getFlowPaths: (sourceId, targetId, pathOptions) => {
      assertRunning("getFlowPaths");
      return getFlowPaths(sourceId, targetId, pathOptions);
    },
    settleFlow: (flowId) => {
      assertRunning("settleFlow");
      return settleFlow(flowId);
    },
  };
}

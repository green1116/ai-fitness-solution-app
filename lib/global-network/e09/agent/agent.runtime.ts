/**
 * E09-P6 — Global Agent Runtime
 * Instance-based runtime: initialize → start → stop + status
 */

import {
  E09_AGENT_ID,
  E09_AGENT_VERSION,
  AGENT_RUNTIME_STATUSES,
} from "./agent.constants";
import {
  clearCoordinatorState,
  coordinateAgents,
  dispatchTask,
  executeTask,
  listCoordinationPlans,
  listTasks,
} from "./agent.coordinator";
import {
  clearAgents,
  getAgent,
  listAgents,
  registerAgent,
  removeAgent,
} from "./agent.registry";
import type {
  AgentTask,
  CoordinationPlan,
  DispatchTaskInput,
  GlobalAgent,
  RegisterAgentInput,
} from "./agent.types";

export type AgentRuntimeStatus =
  (typeof AGENT_RUNTIME_STATUSES)[number];

export type AgentRuntimeSnapshot = {
  runtimeId: string;
  status: AgentRuntimeStatus;
  agentLayerId: typeof E09_AGENT_ID;
  version: typeof E09_AGENT_VERSION;
  agentCount: number;
  taskCount: number;
  completedTaskCount: number;
  planCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type AgentRuntime = {
  initialize: () => AgentRuntimeSnapshot;
  start: () => AgentRuntimeSnapshot;
  stop: () => AgentRuntimeSnapshot;
  status: () => AgentRuntimeSnapshot;
  registerAgent: (input: RegisterAgentInput) => GlobalAgent;
  getAgent: (id: string) => GlobalAgent | undefined;
  listAgents: typeof listAgents;
  removeAgent: (id: string) => boolean;
  coordinateAgents: (
    agentIds: string[],
    options?: { strategy?: CoordinationPlan["strategy"] },
  ) => CoordinationPlan;
  dispatchTask: (input: DispatchTaskInput) => AgentTask;
  executeTask: (taskId: string) => AgentTask;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createAgentRuntime(options?: {
  runtimeId?: string;
}): AgentRuntime {
  const runtimeId = options?.runtimeId?.trim() || createId("agent-runtime");
  let state: AgentRuntimeStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): AgentRuntimeSnapshot {
    const tasks = listTasks();
    return {
      runtimeId,
      status: state,
      agentLayerId: E09_AGENT_ID,
      version: E09_AGENT_VERSION,
      agentCount: listAgents().length,
      taskCount: tasks.length,
      completedTaskCount: tasks.filter((t) => t.status === "COMPLETED").length,
      planCount: listCoordinationPlans().length,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): AgentRuntimeSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }

    clearCoordinatorState();
    clearAgents();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): AgentRuntimeSnapshot {
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

  function stop(): AgentRuntimeSnapshot {
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
    registerAgent: (input) => {
      assertRunning("registerAgent");
      return registerAgent(input);
    },
    getAgent: (id) => getAgent(id),
    listAgents,
    removeAgent: (id) => {
      assertRunning("removeAgent");
      return removeAgent(id);
    },
    coordinateAgents: (agentIds, coordOptions) => {
      assertRunning("coordinateAgents");
      return coordinateAgents(agentIds, coordOptions);
    },
    dispatchTask: (input) => {
      assertRunning("dispatchTask");
      return dispatchTask(input);
    },
    executeTask: (taskId) => {
      assertRunning("executeTask");
      return executeTask(taskId);
    },
  };
}

/**
 * E11-P2 — Execution Manager
 * Orchestrates task create / queue / execute / result / trace
 */

import {
  E11_EXECUTION_BASE,
  E11_EXECUTION_FREEZE_VERSION,
  E11_EXECUTION_ID,
  E11_EXECUTION_VERSION,
} from "./execution.constants";
import {
  executeNext,
  executeTask,
  queueExecution,
} from "./execution.executor";
import {
  cancelQueuedTask,
  clearExecutionQueue,
  createTask,
  getTask,
  listTasks,
  peekQueue,
  queueDepth,
} from "./execution.queue";
import {
  clearExecutionResults,
  getExecutionResult,
  listExecutionResults,
} from "./execution.result";
import {
  clearExecutionTraces,
  getExecutionTrace,
  listExecutionTraces,
} from "./execution.trace";
import type {
  CreateExecutionTaskInput,
  ExecutionBundle,
  ExecutionManagerStatus,
  ExecutionRegistryManifest,
  ExecutionTask,
} from "./execution.types";

export type ExecutionManagerSnapshot = {
  managerId: string;
  status: ExecutionManagerStatus;
  layerId: typeof E11_EXECUTION_ID;
  version: typeof E11_EXECUTION_VERSION;
  taskCount: number;
  queuedCount: number;
  resultCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ExecutionManager = {
  initialize: () => ExecutionManagerSnapshot;
  start: () => ExecutionManagerSnapshot;
  stop: () => ExecutionManagerSnapshot;
  status: () => ExecutionManagerSnapshot;
  createTask: (input: CreateExecutionTaskInput) => ExecutionTask;
  queue: (taskId: string) => ExecutionTask;
  execute: (taskId: string, options?: {
    handler?: (task: ExecutionTask) => { output?: Record<string, unknown> };
  }) => ExecutionBundle;
  executeNext: (options?: {
    handler?: (task: ExecutionTask) => { output?: Record<string, unknown> };
  }) => ExecutionBundle | undefined;
  cancel: (taskId: string) => ExecutionTask;
  getTask: typeof getTask;
  listTasks: typeof listTasks;
  peekQueue: typeof peekQueue;
  getResult: typeof getExecutionResult;
  listResults: typeof listExecutionResults;
  getTrace: typeof getExecutionTrace;
  listTraces: typeof listExecutionTraces;
  manifest: () => ExecutionRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createExecutionManager(options?: {
  managerId?: string;
}): ExecutionManager {
  const managerId =
    options?.managerId?.trim() || createId("e11-exec-mgr");
  let state: ExecutionManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ExecutionManagerSnapshot {
    return {
      managerId,
      status: state,
      layerId: E11_EXECUTION_ID,
      version: E11_EXECUTION_VERSION,
      taskCount: listTasks().length,
      queuedCount: queueDepth(),
      resultCount: listExecutionResults().length,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): ExecutionManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearExecutionTraces();
    clearExecutionResults();
    clearExecutionQueue();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ExecutionManagerSnapshot {
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

  function stop(): ExecutionManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    for (const task of peekQueue()) {
      try {
        cancelQueuedTask(task.id);
      } catch {
        // ignore
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
    createTask: (input) => {
      assertRunning("createTask");
      return createTask(input);
    },
    queue: (taskId) => {
      assertRunning("queue");
      return queueExecution(taskId);
    },
    execute: (taskId, opts) => {
      assertRunning("execute");
      return executeTask(taskId, opts);
    },
    executeNext: (opts) => {
      assertRunning("executeNext");
      return executeNext(opts);
    },
    cancel: (taskId) => {
      assertRunning("cancel");
      const cancelled = cancelQueuedTask(taskId);
      return cancelled;
    },
    getTask,
    listTasks,
    peekQueue,
    getResult: getExecutionResult,
    listResults: listExecutionResults,
    getTrace: getExecutionTrace,
    listTraces: listExecutionTraces,
    manifest: () => ({
      executionId: E11_EXECUTION_ID,
      version: E11_EXECUTION_VERSION,
      freezeVersion: E11_EXECUTION_FREEZE_VERSION,
      base: E11_EXECUTION_BASE,
      taskCount: listTasks().length,
      queuedCount: queueDepth(),
      resultCount: listExecutionResults().length,
    }),
  };
}

export function getExecutionRegistryManifest(): ExecutionRegistryManifest {
  return {
    executionId: E11_EXECUTION_ID,
    version: E11_EXECUTION_VERSION,
    freezeVersion: E11_EXECUTION_FREEZE_VERSION,
    base: E11_EXECUTION_BASE,
    taskCount: listTasks().length,
    queuedCount: queueDepth(),
    resultCount: listExecutionResults().length,
  };
}

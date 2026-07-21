/**
 * E11-P2 — Cloud Runtime Executor
 * Integrates registry / lifecycle / context; maintains runtime state
 */

import { getRuntime } from "../registry/cloud.registry";
import { getContext } from "../runtime/cloud.context";
import {
  failRuntime,
  getRuntimeLifecycle,
  startRuntime,
} from "../runtime/cloud.lifecycle";
import {
  dequeueTask,
  enqueueTask,
  getTask,
  removeFromQueue,
  updateTask,
} from "./execution.queue";
import {
  buildExecutionResult,
  storeExecutionResult,
} from "./execution.result";
import {
  appendExecutionTraceEvent,
  createExecutionTrace,
  getExecutionTrace,
  storeExecutionTrace,
} from "./execution.trace";
import type {
  ExecutionBundle,
  ExecutionTask,
  ExecutionTrace,
} from "./execution.types";

function nowIso(): string {
  return new Date().toISOString();
}

function ensureRuntimeReady(runtimeId: string): void {
  const runtime = getRuntime(runtimeId);
  if (!runtime) {
    throw new Error(`cloud runtime not found: ${runtimeId}`);
  }

  const lifecycle = getRuntimeLifecycle(runtimeId);
  if (runtime.status === "REGISTERED" || runtime.status === "STOPPED") {
    if (
      lifecycle &&
      (lifecycle.current === "registered" || lifecycle.current === "stopped")
    ) {
      startRuntime(runtimeId);
    } else if (!lifecycle) {
      throw new Error(
        `runtime lifecycle missing for start transition: ${runtimeId}`,
      );
    }
  }

  const after = getRuntime(runtimeId);
  if (!after || after.status !== "ACTIVE") {
    throw new Error(
      `execution requires ACTIVE runtime (current=${after?.status ?? "missing"})`,
    );
  }
}

function resolveContextId(task: ExecutionTask): string | undefined {
  if (!task.contextId) return undefined;
  const ctx = getContext(task.contextId);
  if (!ctx) {
    throw new Error(`execution context not found: ${task.contextId}`);
  }
  if (ctx.runtimeId !== task.runtimeId) {
    throw new Error(
      `context runtime mismatch: context=${ctx.runtimeId} task=${task.runtimeId}`,
    );
  }
  if (ctx.status !== "ACTIVE" && ctx.status !== "OPEN") {
    throw new Error(
      `context must be OPEN or ACTIVE (current=${ctx.status})`,
    );
  }
  return ctx.contextId;
}

function loadOrCreateTrace(task: ExecutionTask): ExecutionTrace {
  return (
    getExecutionTrace(task.id) ??
    createExecutionTrace({
      taskId: task.id,
      runtimeId: task.runtimeId,
    })
  );
}

/** Enqueue a PENDING task (trace: created → enqueued). */
export function queueExecution(taskId: string): ExecutionTask {
  const before = getTask(taskId);
  if (!before) throw new Error(`execution task not found: ${taskId}`);

  let trace = loadOrCreateTrace(before);
  if (trace.events.length === 0) {
    trace = appendExecutionTraceEvent(
      trace,
      "created",
      `task ${before.id} created`,
      { kind: before.kind, priority: before.priority },
    );
  }

  const queued = enqueueTask(taskId);
  trace = appendExecutionTraceEvent(
    trace,
    "enqueued",
    `task ${queued.id} enqueued`,
    { priority: queued.priority },
  );
  storeExecutionTrace(trace);
  return queued;
}

/**
 * Dequeue next task and execute synchronously.
 * On failure: task → FAILED; runtime ACTIVE → failed when lifecycle allows.
 */
export function executeNext(options?: {
  handler?: (task: ExecutionTask) => {
    output?: Record<string, unknown>;
  };
}): ExecutionBundle | undefined {
  const task = dequeueTask();
  if (!task) return undefined;
  return runExecution(task, options, true);
}

/** Execute a specific PENDING or QUEUED task by id. */
export function executeTask(
  taskId: string,
  options?: {
    handler?: (task: ExecutionTask) => {
      output?: Record<string, unknown>;
    };
  },
): ExecutionBundle {
  const existing = getTask(taskId);
  if (!existing) throw new Error(`execution task not found: ${taskId}`);

  if (existing.status === "PENDING") {
    enqueueTask(existing.id);
    removeFromQueue(existing.id);
  } else if (existing.status === "QUEUED") {
    removeFromQueue(existing.id);
  } else {
    throw new Error(
      `execute requires PENDING or QUEUED (current=${existing.status})`,
    );
  }

  const task = getTask(existing.id)!;
  return runExecution(task, options, false);
}

function runExecution(
  existing: ExecutionTask,
  options: {
    handler?: (task: ExecutionTask) => {
      output?: Record<string, unknown>;
    };
  } | undefined,
  alreadyDequeued: boolean,
): ExecutionBundle {
  let trace = loadOrCreateTrace(existing);

  if (!alreadyDequeued) {
    const hasEnqueue = trace.events.some((e) => e.type === "enqueued");
    if (!hasEnqueue) {
      trace = appendExecutionTraceEvent(
        trace,
        "enqueued",
        `task ${existing.id} enqueued`,
        { priority: existing.priority },
      );
    }
  }

  trace = appendExecutionTraceEvent(
    trace,
    "dequeued",
    `task ${existing.id} dequeued`,
  );

  const startedAtMs = Date.now();
  const startedAt = nowIso();

  try {
    ensureRuntimeReady(existing.runtimeId);
    const contextId = resolveContextId(existing);

    updateTask(existing.id, {
      status: "RUNNING",
      startedAt,
      contextId,
    });
    trace = appendExecutionTraceEvent(
      trace,
      "started",
      `task ${existing.id} started on ${existing.runtimeId}`,
      { contextId },
    );

    const current = getTask(existing.id)!;
    const handlerResult = options?.handler
      ? options.handler(current)
      : {
          output: {
            echo: current.payload,
            kind: current.kind,
            runtimeId: current.runtimeId,
          },
        };

    const finishedAt = nowIso();
    const durationMs = Date.now() - startedAtMs;
    const completed = updateTask(existing.id, {
      status: "COMPLETED",
      finishedAt,
    });

    const result = storeExecutionResult(
      buildExecutionResult({
        taskId: completed.id,
        runtimeId: completed.runtimeId,
        contextId: completed.contextId,
        status: "OK",
        output: handlerResult.output ?? {},
        durationMs,
      }),
    );

    trace = appendExecutionTraceEvent(
      trace,
      "completed",
      `task ${completed.id} completed`,
      { durationMs },
    );
    storeExecutionTrace(trace);

    return { task: completed, result, trace };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "execution failed";
    const finishedAt = nowIso();
    const durationMs = Date.now() - startedAtMs;

    const failed = updateTask(existing.id, {
      status: "FAILED",
      finishedAt,
      error: message,
    });

    try {
      const runtime = getRuntime(existing.runtimeId);
      const lifecycle = getRuntimeLifecycle(existing.runtimeId);
      if (runtime?.status === "ACTIVE" && lifecycle?.current === "started") {
        failRuntime(existing.runtimeId, message);
      }
    } catch {
      // do not mask original error
    }

    const result = storeExecutionResult(
      buildExecutionResult({
        taskId: failed.id,
        runtimeId: failed.runtimeId,
        contextId: failed.contextId,
        status: "ERROR",
        output: {},
        durationMs,
        error: message,
      }),
    );

    trace = appendExecutionTraceEvent(
      trace,
      "failed",
      `task ${failed.id} failed: ${message}`,
    );
    storeExecutionTrace(trace);

    return { task: failed, result, trace };
  }
}

/**
 * E11-P2 — Execution Trace
 */

import type {
  CloudMetadata,
  ExecutionTrace,
  ExecutionTraceEvent,
  ExecutionTraceEventType,
} from "./execution.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function createExecutionTrace(input: {
  taskId: string;
  runtimeId: string;
}): ExecutionTrace {
  return {
    taskId: input.taskId,
    runtimeId: input.runtimeId,
    events: [],
    createdAt: nowIso(),
  };
}

export function appendExecutionTraceEvent(
  trace: ExecutionTrace,
  type: ExecutionTraceEventType,
  message: string,
  detail?: CloudMetadata,
): ExecutionTrace {
  const event: ExecutionTraceEvent = {
    type,
    at: nowIso(),
    message,
    detail: detail ? { ...detail } : undefined,
  };
  return {
    ...trace,
    events: [...trace.events, event],
  };
}

const traces = new Map<string, ExecutionTrace>();

export function storeExecutionTrace(trace: ExecutionTrace): ExecutionTrace {
  const cloned: ExecutionTrace = {
    ...trace,
    events: trace.events.map((e) => ({
      ...e,
      detail: e.detail ? { ...e.detail } : undefined,
    })),
  };
  traces.set(trace.taskId, cloned);
  return {
    ...cloned,
    events: cloned.events.map((e) => ({
      ...e,
      detail: e.detail ? { ...e.detail } : undefined,
    })),
  };
}

export function getExecutionTrace(
  taskId: string,
): ExecutionTrace | undefined {
  const trace = traces.get(taskId.trim());
  if (!trace) return undefined;
  return {
    ...trace,
    events: trace.events.map((e) => ({
      ...e,
      detail: e.detail ? { ...e.detail } : undefined,
    })),
  };
}

export function listExecutionTraces(filter?: {
  runtimeId?: string;
}): ExecutionTrace[] {
  let list = [...traces.values()];
  if (filter?.runtimeId) {
    const rid = filter.runtimeId.trim();
    list = list.filter((t) => t.runtimeId === rid);
  }
  return list
    .slice()
    .sort((a, b) => a.taskId.localeCompare(b.taskId))
    .map((t) => ({
      ...t,
      events: t.events.map((e) => ({
        ...e,
        detail: e.detail ? { ...e.detail } : undefined,
      })),
    }));
}

export function clearExecutionTraces(): void {
  traces.clear();
}

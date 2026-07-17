/**
 * E06-P5 — Self Optimization Trace
 */

import { OPTIMIZATION_TRACE_EVENT_KINDS } from "./optimization.constants";

export type OptimizationTraceEventKind =
  (typeof OPTIMIZATION_TRACE_EVENT_KINDS)[number];

export type OptimizationTraceEvent = {
  id: string;
  kind: OptimizationTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type OptimizationRuntimeTrace = {
  traceId: string;
  instanceId: string;
  optimizationId: string;
  taskId: string;
  events: OptimizationTraceEvent[];
  eventCount: number;
  startedAt: string;
  finishedAt?: string;
  readOnly: true;
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function createOptimizationRuntimeTrace(input: {
  instanceId: string;
  optimizationId: string;
  taskId: string;
  traceId?: string;
}): OptimizationRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("opt-trace"),
    instanceId: input.instanceId,
    optimizationId: input.optimizationId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendOptimizationTraceEvent(
  trace: OptimizationRuntimeTrace,
  kind: OptimizationTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): OptimizationRuntimeTrace {
  const event: OptimizationTraceEvent = {
    id: createId("opt-evt"),
    kind,
    at: nowIso(),
    message,
    data: data ? Object.freeze({ ...data }) : undefined,
    readOnly: true,
  };

  const events = [...trace.events, event];
  const finishedAt =
    kind === "result" || kind === "error" ? event.at : trace.finishedAt;

  return {
    ...trace,
    events,
    eventCount: events.length,
    finishedAt,
    readOnly: true,
  };
}

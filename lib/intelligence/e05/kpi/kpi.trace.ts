/**
 * E05-P3 — KPI Trace
 */

import { KPI_TRACE_EVENT_KINDS } from "./kpi.constants";

export type KpiTraceEventKind = (typeof KPI_TRACE_EVENT_KINDS)[number];

export type KpiTraceEvent = {
  id: string;
  kind: KpiTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type KpiRuntimeTrace = {
  traceId: string;
  instanceId: string;
  kpiId: string;
  taskId: string;
  events: KpiTraceEvent[];
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

export function createKpiRuntimeTrace(input: {
  instanceId: string;
  kpiId: string;
  taskId: string;
  traceId?: string;
}): KpiRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("kpi-trace"),
    instanceId: input.instanceId,
    kpiId: input.kpiId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendKpiTraceEvent(
  trace: KpiRuntimeTrace,
  kind: KpiTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): KpiRuntimeTrace {
  const event: KpiTraceEvent = {
    id: createId("kpi-evt"),
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

/**
 * E05-P4 — Forecast Trace
 */

import { FORECAST_TRACE_EVENT_KINDS } from "./forecast.constants";

export type ForecastTraceEventKind =
  (typeof FORECAST_TRACE_EVENT_KINDS)[number];

export type ForecastTraceEvent = {
  id: string;
  kind: ForecastTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type ForecastRuntimeTrace = {
  traceId: string;
  instanceId: string;
  forecastId: string;
  taskId: string;
  events: ForecastTraceEvent[];
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

export function createForecastRuntimeTrace(input: {
  instanceId: string;
  forecastId: string;
  taskId: string;
  traceId?: string;
}): ForecastRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("fc-trace"),
    instanceId: input.instanceId,
    forecastId: input.forecastId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendForecastTraceEvent(
  trace: ForecastRuntimeTrace,
  kind: ForecastTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): ForecastRuntimeTrace {
  const event: ForecastTraceEvent = {
    id: createId("fc-evt"),
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

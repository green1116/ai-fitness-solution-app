/**
 * E05-P2 — Business Analytics Trace
 */

import { ANALYTICS_TRACE_EVENT_KINDS } from "./analytics.constants";

export type AnalyticsTraceEventKind =
  (typeof ANALYTICS_TRACE_EVENT_KINDS)[number];

export type AnalyticsTraceEvent = {
  id: string;
  kind: AnalyticsTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type AnalyticsRuntimeTrace = {
  traceId: string;
  instanceId: string;
  analyticsId: string;
  taskId: string;
  events: AnalyticsTraceEvent[];
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

export function createAnalyticsRuntimeTrace(input: {
  instanceId: string;
  analyticsId: string;
  taskId: string;
  traceId?: string;
}): AnalyticsRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("ana-trace"),
    instanceId: input.instanceId,
    analyticsId: input.analyticsId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendAnalyticsTraceEvent(
  trace: AnalyticsRuntimeTrace,
  kind: AnalyticsTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): AnalyticsRuntimeTrace {
  const event: AnalyticsTraceEvent = {
    id: createId("ana-evt"),
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

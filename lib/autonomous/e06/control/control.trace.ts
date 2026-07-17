/**
 * E06-P4 — Enterprise Control Trace
 */

import { CONTROL_TRACE_EVENT_KINDS } from "./control.constants";

export type ControlTraceEventKind =
  (typeof CONTROL_TRACE_EVENT_KINDS)[number];

export type ControlTraceEvent = {
  id: string;
  kind: ControlTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type ControlRuntimeTrace = {
  traceId: string;
  planId: string;
  taskId: string;
  events: ControlTraceEvent[];
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

export function createControlRuntimeTrace(input: {
  planId: string;
  taskId: string;
  traceId?: string;
}): ControlRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("ctl-trace"),
    planId: input.planId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendControlTraceEvent(
  trace: ControlRuntimeTrace,
  kind: ControlTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): ControlRuntimeTrace {
  const event: ControlTraceEvent = {
    id: createId("ctl-evt"),
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

/**
 * E06-P6 — Enterprise Digital Twin Trace
 */

import { TWIN_TRACE_EVENT_KINDS } from "./twin.constants";

export type TwinTraceEventKind = (typeof TWIN_TRACE_EVENT_KINDS)[number];

export type TwinTraceEvent = {
  id: string;
  kind: TwinTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type TwinRuntimeTrace = {
  traceId: string;
  instanceId: string;
  twinId: string;
  taskId: string;
  events: TwinTraceEvent[];
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

export function createTwinRuntimeTrace(input: {
  instanceId: string;
  twinId: string;
  taskId: string;
  traceId?: string;
}): TwinRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("twin-trace"),
    instanceId: input.instanceId,
    twinId: input.twinId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendTwinTraceEvent(
  trace: TwinRuntimeTrace,
  kind: TwinTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): TwinRuntimeTrace {
  const event: TwinTraceEvent = {
    id: createId("twin-evt"),
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

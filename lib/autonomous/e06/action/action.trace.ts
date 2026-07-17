/**
 * E06-P2 — Business Action Trace
 */

import { ACTION_TRACE_EVENT_KINDS } from "./action.constants";

export type ActionTraceEventKind = (typeof ACTION_TRACE_EVENT_KINDS)[number];

export type ActionTraceEvent = {
  id: string;
  kind: ActionTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type ActionRuntimeTrace = {
  traceId: string;
  instanceId: string;
  actionId: string;
  taskId: string;
  events: ActionTraceEvent[];
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

export function createActionRuntimeTrace(input: {
  instanceId: string;
  actionId: string;
  taskId: string;
  traceId?: string;
}): ActionRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("act-trace"),
    instanceId: input.instanceId,
    actionId: input.actionId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendActionTraceEvent(
  trace: ActionRuntimeTrace,
  kind: ActionTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): ActionRuntimeTrace {
  const event: ActionTraceEvent = {
    id: createId("act-evt"),
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

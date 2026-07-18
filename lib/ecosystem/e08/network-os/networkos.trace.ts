/**
 * E08-P7 — Enterprise Network OS Trace
 */

import { NETWORK_OS_TRACE_EVENT_KINDS } from "./networkos.constants";

export type NetworkOsTraceEventKind =
  (typeof NETWORK_OS_TRACE_EVENT_KINDS)[number];

export type NetworkOsTraceEvent = {
  id: string;
  kind: NetworkOsTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type NetworkOsRuntimeTrace = {
  traceId: string;
  instanceId: string;
  networkOsId: string;
  taskId: string;
  events: NetworkOsTraceEvent[];
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

export function createNetworkOsRuntimeTrace(input: {
  instanceId: string;
  networkOsId: string;
  taskId: string;
  traceId?: string;
}): NetworkOsRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("nos-trace"),
    instanceId: input.instanceId,
    networkOsId: input.networkOsId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendNetworkOsTraceEvent(
  trace: NetworkOsRuntimeTrace,
  kind: NetworkOsTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): NetworkOsRuntimeTrace {
  const event: NetworkOsTraceEvent = {
    id: createId("nos-evt"),
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

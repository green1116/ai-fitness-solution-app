/**
 * E08-P2 — Multi Organization Network Trace
 */

import { NETWORK_TRACE_EVENT_KINDS } from "./network.constants";

export type NetworkTraceEventKind =
  (typeof NETWORK_TRACE_EVENT_KINDS)[number];

export type NetworkTraceEvent = {
  id: string;
  kind: NetworkTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type NetworkRuntimeTrace = {
  traceId: string;
  instanceId: string;
  networkId: string;
  taskId: string;
  events: NetworkTraceEvent[];
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

export function createNetworkRuntimeTrace(input: {
  instanceId: string;
  networkId: string;
  taskId: string;
  traceId?: string;
}): NetworkRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("net-trace"),
    instanceId: input.instanceId,
    networkId: input.networkId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendNetworkTraceEvent(
  trace: NetworkRuntimeTrace,
  kind: NetworkTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): NetworkRuntimeTrace {
  const event: NetworkTraceEvent = {
    id: createId("net-evt"),
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

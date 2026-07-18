/**
 * E08-P3 — AI Partner Exchange Trace
 */

import { EXCHANGE_TRACE_EVENT_KINDS } from "./exchange.constants";

export type ExchangeTraceEventKind =
  (typeof EXCHANGE_TRACE_EVENT_KINDS)[number];

export type ExchangeTraceEvent = {
  id: string;
  kind: ExchangeTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type ExchangeRuntimeTrace = {
  traceId: string;
  instanceId: string;
  listingId: string;
  taskId: string;
  events: ExchangeTraceEvent[];
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

export function createExchangeRuntimeTrace(input: {
  instanceId: string;
  listingId: string;
  taskId: string;
  traceId?: string;
}): ExchangeRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("xchg-trace"),
    instanceId: input.instanceId,
    listingId: input.listingId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendExchangeTraceEvent(
  trace: ExchangeRuntimeTrace,
  kind: ExchangeTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): ExchangeRuntimeTrace {
  const event: ExchangeTraceEvent = {
    id: createId("xchg-evt"),
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

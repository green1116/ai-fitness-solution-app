/**
 * E08-P6 — Autonomous Market Agent Trace
 */

import { MARKET_TRACE_EVENT_KINDS } from "./market.constants";

export type MarketTraceEventKind =
  (typeof MARKET_TRACE_EVENT_KINDS)[number];

export type MarketTraceEvent = {
  id: string;
  kind: MarketTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type MarketRuntimeTrace = {
  traceId: string;
  instanceId: string;
  agentId: string;
  taskId: string;
  events: MarketTraceEvent[];
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

export function createMarketRuntimeTrace(input: {
  instanceId: string;
  agentId: string;
  taskId: string;
  traceId?: string;
}): MarketRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("mkt-trace"),
    instanceId: input.instanceId,
    agentId: input.agentId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendMarketTraceEvent(
  trace: MarketRuntimeTrace,
  kind: MarketTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): MarketRuntimeTrace {
  const event: MarketTraceEvent = {
    id: createId("mkt-evt"),
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

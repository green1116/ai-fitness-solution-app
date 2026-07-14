/**
 * E05-P7 — Strategy Trace
 */

import { STRATEGY_TRACE_EVENT_KINDS } from "./strategy.constants";

export type StrategyTraceEventKind =
  (typeof STRATEGY_TRACE_EVENT_KINDS)[number];

export type StrategyTraceEvent = {
  id: string;
  kind: StrategyTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type StrategyRuntimeTrace = {
  traceId: string;
  instanceId: string;
  strategyId: string;
  taskId: string;
  events: StrategyTraceEvent[];
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

export function createStrategyRuntimeTrace(input: {
  instanceId: string;
  strategyId: string;
  taskId: string;
  traceId?: string;
}): StrategyRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("str-trace"),
    instanceId: input.instanceId,
    strategyId: input.strategyId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendStrategyTraceEvent(
  trace: StrategyRuntimeTrace,
  kind: StrategyTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): StrategyRuntimeTrace {
  const event: StrategyTraceEvent = {
    id: createId("str-evt"),
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

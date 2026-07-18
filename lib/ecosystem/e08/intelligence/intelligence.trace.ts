/**
 * E08-P5 — Ecosystem Intelligence Trace
 */

import { INTELLIGENCE_TRACE_EVENT_KINDS } from "./intelligence.constants";

export type IntelligenceTraceEventKind =
  (typeof INTELLIGENCE_TRACE_EVENT_KINDS)[number];

export type IntelligenceTraceEvent = {
  id: string;
  kind: IntelligenceTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type IntelligenceRuntimeTrace = {
  traceId: string;
  instanceId: string;
  intelligenceId: string;
  taskId: string;
  events: IntelligenceTraceEvent[];
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

export function createIntelligenceRuntimeTrace(input: {
  instanceId: string;
  intelligenceId: string;
  taskId: string;
  traceId?: string;
}): IntelligenceRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("intel-trace"),
    instanceId: input.instanceId,
    intelligenceId: input.intelligenceId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendIntelligenceTraceEvent(
  trace: IntelligenceRuntimeTrace,
  kind: IntelligenceTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): IntelligenceRuntimeTrace {
  const event: IntelligenceTraceEvent = {
    id: createId("intel-evt"),
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

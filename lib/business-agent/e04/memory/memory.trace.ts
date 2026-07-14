/**
 * E04-P5 — Business Memory Trace
 */

import type { MemoryTraceEventKind } from "./memory.types";

export type MemoryTraceEvent = {
  id: string;
  kind: MemoryTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type MemoryRuntimeTrace = {
  traceId: string;
  operationId: string;
  events: MemoryTraceEvent[];
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

export function createMemoryRuntimeTrace(input?: {
  operationId?: string;
  traceId?: string;
}): MemoryRuntimeTrace {
  return {
    traceId: input?.traceId?.trim() || createId("mem-trace"),
    operationId: input?.operationId?.trim() || createId("mem-op"),
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendMemoryTraceEvent(
  trace: MemoryRuntimeTrace,
  kind: MemoryTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): MemoryRuntimeTrace {
  const event: MemoryTraceEvent = {
    id: createId("mem-evt"),
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

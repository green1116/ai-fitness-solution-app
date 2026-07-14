/**
 * E04-P6 — Business Knowledge Trace
 */

import type { KnowledgeTraceEventKind } from "./knowledge.types";

export type KnowledgeTraceEvent = {
  id: string;
  kind: KnowledgeTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type KnowledgeRuntimeTrace = {
  traceId: string;
  operationId: string;
  events: KnowledgeTraceEvent[];
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

export function createKnowledgeRuntimeTrace(input?: {
  operationId?: string;
  traceId?: string;
}): KnowledgeRuntimeTrace {
  return {
    traceId: input?.traceId?.trim() || createId("know-trace"),
    operationId: input?.operationId?.trim() || createId("know-op"),
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendKnowledgeTraceEvent(
  trace: KnowledgeRuntimeTrace,
  kind: KnowledgeTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): KnowledgeRuntimeTrace {
  const event: KnowledgeTraceEvent = {
    id: createId("know-evt"),
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

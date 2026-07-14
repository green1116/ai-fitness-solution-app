/**
 * E04-P7 — Collaboration Trace
 */

import type { CollaborationTraceEventKind } from "./collaboration.types";

export type CollaborationTraceEvent = {
  id: string;
  kind: CollaborationTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type CollaborationRuntimeTrace = {
  traceId: string;
  sessionId: string;
  collaborationId: string;
  taskId: string;
  events: CollaborationTraceEvent[];
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

export function createCollaborationRuntimeTrace(input: {
  sessionId: string;
  collaborationId: string;
  taskId: string;
  traceId?: string;
}): CollaborationRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("collab-trace"),
    sessionId: input.sessionId,
    collaborationId: input.collaborationId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendCollaborationTraceEvent(
  trace: CollaborationRuntimeTrace,
  kind: CollaborationTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): CollaborationRuntimeTrace {
  const event: CollaborationTraceEvent = {
    id: createId("collab-evt"),
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

/**
 * E04-P4 — Business Decision Trace
 */

import type { DecisionTraceEventKind } from "./decision.types";

export type DecisionTraceEvent = {
  id: string;
  kind: DecisionTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type DecisionRuntimeTrace = {
  traceId: string;
  executionId: string;
  decisionId: string;
  taskId: string;
  events: DecisionTraceEvent[];
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

export function createDecisionRuntimeTrace(input: {
  executionId: string;
  decisionId: string;
  taskId: string;
  traceId?: string;
}): DecisionRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("dec-trace"),
    executionId: input.executionId,
    decisionId: input.decisionId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendDecisionTraceEvent(
  trace: DecisionRuntimeTrace,
  kind: DecisionTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): DecisionRuntimeTrace {
  const event: DecisionTraceEvent = {
    id: createId("dec-evt"),
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

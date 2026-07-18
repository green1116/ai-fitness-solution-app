/**
 * E07-P6 — Workforce Learning Trace
 */

import { LEARNING_TRACE_EVENT_KINDS } from "./learning.constants";

export type LearningTraceEventKind =
  (typeof LEARNING_TRACE_EVENT_KINDS)[number];

export type LearningTraceEvent = {
  id: string;
  kind: LearningTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type LearningRuntimeTrace = {
  traceId: string;
  instanceId: string;
  learningId: string;
  taskId: string;
  events: LearningTraceEvent[];
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

export function createLearningRuntimeTrace(input: {
  instanceId: string;
  learningId: string;
  taskId: string;
  traceId?: string;
}): LearningRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("learn-trace"),
    instanceId: input.instanceId,
    learningId: input.learningId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendLearningTraceEvent(
  trace: LearningRuntimeTrace,
  kind: LearningTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): LearningRuntimeTrace {
  const event: LearningTraceEvent = {
    id: createId("learn-evt"),
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

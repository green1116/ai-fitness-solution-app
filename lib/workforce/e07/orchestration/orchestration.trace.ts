/**
 * E07-P4 — Workforce Orchestration Trace
 */

import { ORCHESTRATION_TRACE_EVENT_KINDS } from "./orchestration.constants";

export type OrchestrationTraceEventKind =
  (typeof ORCHESTRATION_TRACE_EVENT_KINDS)[number];

export type OrchestrationTraceEvent = {
  id: string;
  kind: OrchestrationTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type OrchestrationRuntimeTrace = {
  traceId: string;
  instanceId: string;
  orchestrationId: string;
  taskId: string;
  events: OrchestrationTraceEvent[];
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

export function createOrchestrationRuntimeTrace(input: {
  instanceId: string;
  orchestrationId: string;
  taskId: string;
  traceId?: string;
}): OrchestrationRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("orch-trace"),
    instanceId: input.instanceId,
    orchestrationId: input.orchestrationId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendOrchestrationTraceEvent(
  trace: OrchestrationRuntimeTrace,
  kind: OrchestrationTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): OrchestrationRuntimeTrace {
  const event: OrchestrationTraceEvent = {
    id: createId("orch-evt"),
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

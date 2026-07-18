/**
 * E08-P4 — Cross Enterprise Workflow Trace
 */

import { WORKFLOW_TRACE_EVENT_KINDS } from "./workflow.constants";

export type WorkflowTraceEventKind =
  (typeof WORKFLOW_TRACE_EVENT_KINDS)[number];

export type WorkflowTraceEvent = {
  id: string;
  kind: WorkflowTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type WorkflowRuntimeTrace = {
  traceId: string;
  instanceId: string;
  workflowId: string;
  taskId: string;
  events: WorkflowTraceEvent[];
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

export function createWorkflowRuntimeTrace(input: {
  instanceId: string;
  workflowId: string;
  taskId: string;
  traceId?: string;
}): WorkflowRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("xwf-trace"),
    instanceId: input.instanceId,
    workflowId: input.workflowId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendWorkflowTraceEvent(
  trace: WorkflowRuntimeTrace,
  kind: WorkflowTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): WorkflowRuntimeTrace {
  const event: WorkflowTraceEvent = {
    id: createId("xwf-evt"),
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

/**
 * E07-P7 — Autonomous Organization Trace
 */

import { ORGANIZATION_TRACE_EVENT_KINDS } from "./organization.constants";

export type OrganizationTraceEventKind =
  (typeof ORGANIZATION_TRACE_EVENT_KINDS)[number];

export type OrganizationTraceEvent = {
  id: string;
  kind: OrganizationTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type OrganizationRuntimeTrace = {
  traceId: string;
  instanceId: string;
  organizationId: string;
  taskId: string;
  events: OrganizationTraceEvent[];
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

export function createOrganizationRuntimeTrace(input: {
  instanceId: string;
  organizationId: string;
  taskId: string;
  traceId?: string;
}): OrganizationRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("org-trace"),
    instanceId: input.instanceId,
    organizationId: input.organizationId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendOrganizationTraceEvent(
  trace: OrganizationRuntimeTrace,
  kind: OrganizationTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): OrganizationRuntimeTrace {
  const event: OrganizationTraceEvent = {
    id: createId("org-evt"),
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

/**
 * E07-P3 — Role Agent Marketplace Trace
 */

import { ROLE_TRACE_EVENT_KINDS } from "./role.constants";

export type RoleTraceEventKind = (typeof ROLE_TRACE_EVENT_KINDS)[number];

export type RoleTraceEvent = {
  id: string;
  kind: RoleTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type RoleRuntimeTrace = {
  traceId: string;
  instanceId: string;
  roleId: string;
  taskId: string;
  events: RoleTraceEvent[];
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

export function createRoleRuntimeTrace(input: {
  instanceId: string;
  roleId: string;
  taskId: string;
  traceId?: string;
}): RoleRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("role-trace"),
    instanceId: input.instanceId,
    roleId: input.roleId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendRoleTraceEvent(
  trace: RoleRuntimeTrace,
  kind: RoleTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): RoleRuntimeTrace {
  const event: RoleTraceEvent = {
    id: createId("role-evt"),
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

/**
 * E07-P2 — AI Employee Trace
 */

import { EMPLOYEE_TRACE_EVENT_KINDS } from "./employee.constants";

export type EmployeeTraceEventKind =
  (typeof EMPLOYEE_TRACE_EVENT_KINDS)[number];

export type EmployeeTraceEvent = {
  id: string;
  kind: EmployeeTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type EmployeeRuntimeTrace = {
  traceId: string;
  instanceId: string;
  employeeId: string;
  taskId: string;
  events: EmployeeTraceEvent[];
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

export function createEmployeeRuntimeTrace(input: {
  instanceId: string;
  employeeId: string;
  taskId: string;
  traceId?: string;
}): EmployeeRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("emp-trace"),
    instanceId: input.instanceId,
    employeeId: input.employeeId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendEmployeeTraceEvent(
  trace: EmployeeRuntimeTrace,
  kind: EmployeeTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): EmployeeRuntimeTrace {
  const event: EmployeeTraceEvent = {
    id: createId("emp-evt"),
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

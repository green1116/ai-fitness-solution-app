/**
 * E05-P6 — Simulation Trace
 */

import { SIMULATION_TRACE_EVENT_KINDS } from "./simulation.constants";

export type SimulationTraceEventKind =
  (typeof SIMULATION_TRACE_EVENT_KINDS)[number];

export type SimulationTraceEvent = {
  id: string;
  kind: SimulationTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type SimulationRuntimeTrace = {
  traceId: string;
  instanceId: string;
  simulationId: string;
  taskId: string;
  events: SimulationTraceEvent[];
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

export function createSimulationRuntimeTrace(input: {
  instanceId: string;
  simulationId: string;
  taskId: string;
  traceId?: string;
}): SimulationRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("sim-trace"),
    instanceId: input.instanceId,
    simulationId: input.simulationId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendSimulationTraceEvent(
  trace: SimulationRuntimeTrace,
  kind: SimulationTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): SimulationRuntimeTrace {
  const event: SimulationTraceEvent = {
    id: createId("sim-evt"),
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

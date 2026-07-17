/**
 * E06-P7 — Autonomous Enterprise Agent Trace
 */

import { AGENT_TRACE_EVENT_KINDS } from "./agent.constants";

export type AgentTraceEventKind = (typeof AGENT_TRACE_EVENT_KINDS)[number];

export type AgentTraceEvent = {
  id: string;
  kind: AgentTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type AgentRuntimeTrace = {
  traceId: string;
  instanceId: string;
  agentId: string;
  taskId: string;
  events: AgentTraceEvent[];
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

export function createAgentRuntimeTrace(input: {
  instanceId: string;
  agentId: string;
  taskId: string;
  traceId?: string;
}): AgentRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("agent-trace"),
    instanceId: input.instanceId,
    agentId: input.agentId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendAgentTraceEvent(
  trace: AgentRuntimeTrace,
  kind: AgentTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): AgentRuntimeTrace {
  const event: AgentTraceEvent = {
    id: createId("agent-evt"),
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

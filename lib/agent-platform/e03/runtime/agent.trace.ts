/**
 * E03-P2 — Agent Runtime Trace (governance / audit / compliance surface)
 */

export type AgentTraceEventKind =
  | "ready"
  | "running"
  | "completed"
  | "result"
  | "error";

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
  executionId: string;
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
  executionId: string;
  agentId: string;
  taskId: string;
  traceId?: string;
}): AgentRuntimeTrace {
  const startedAt = nowIso();
  return {
    traceId: input.traceId?.trim() || createId("trace"),
    executionId: input.executionId,
    agentId: input.agentId,
    taskId: input.taskId,
    events: [],
    eventCount: 0,
    startedAt,
    readOnly: true,
  };
}

export function appendTraceEvent(
  trace: AgentRuntimeTrace,
  kind: AgentTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): AgentRuntimeTrace {
  const event: AgentTraceEvent = {
    id: createId("evt"),
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

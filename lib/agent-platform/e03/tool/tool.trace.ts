/**
 * E03-P3 — Tool Runtime Trace (audit / governance surface)
 */

export type ToolTraceEventKind =
  | "pending"
  | "authorized"
  | "denied"
  | "running"
  | "completed"
  | "result"
  | "error";

export type ToolTraceEvent = {
  id: string;
  kind: ToolTraceEventKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
  readOnly: true;
};

export type ToolRuntimeTrace = {
  traceId: string;
  requestId: string;
  toolId: string;
  agentId: string;
  events: ToolTraceEvent[];
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

export function createToolRuntimeTrace(input: {
  requestId: string;
  toolId: string;
  agentId: string;
  traceId?: string;
}): ToolRuntimeTrace {
  return {
    traceId: input.traceId?.trim() || createId("ttrace"),
    requestId: input.requestId,
    toolId: input.toolId,
    agentId: input.agentId,
    events: [],
    eventCount: 0,
    startedAt: nowIso(),
    readOnly: true,
  };
}

export function appendToolTraceEvent(
  trace: ToolRuntimeTrace,
  kind: ToolTraceEventKind,
  message: string,
  data?: Readonly<Record<string, string>>,
): ToolRuntimeTrace {
  const event: ToolTraceEvent = {
    id: createId("tevt"),
    kind,
    at: nowIso(),
    message,
    data: data ? Object.freeze({ ...data }) : undefined,
    readOnly: true,
  };

  const events = [...trace.events, event];
  const finishedAt =
    kind === "result" || kind === "error" || kind === "denied"
      ? event.at
      : trace.finishedAt;

  return {
    ...trace,
    events,
    eventCount: events.length,
    finishedAt,
    readOnly: true,
  };
}

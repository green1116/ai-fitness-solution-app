import type {
  ExecutiveAuditEvent,
  ExecutiveAuditEventKind,
  ExecutiveOversightTrace,
} from "../types";
import { EXECUTIVE_OVERSIGHT_RUNTIME_VERSION } from "../types";

function newEventId() {
  return `exec-evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createExecutiveTrace(runId: string): ExecutiveOversightTrace {
  return { version: EXECUTIVE_OVERSIGHT_RUNTIME_VERSION, runId, events: [] };
}

export function appendExecutiveEvent(
  trace: ExecutiveOversightTrace,
  kind: ExecutiveAuditEventKind,
  message: string,
  payload?: Record<string, unknown>,
): ExecutiveOversightTrace {
  const event: ExecutiveAuditEvent = {
    eventId: newEventId(),
    runId: trace.runId,
    kind,
    message,
    at: new Date().toISOString(),
    payload,
  };
  return { ...trace, events: [...trace.events, event] };
}

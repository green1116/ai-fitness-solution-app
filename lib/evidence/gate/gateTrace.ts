import type {
  ExecutiveGateAuditEvent,
  ExecutiveGateAuditEventKind,
  ExecutiveGateTrace,
} from "../types";
import { EXECUTIVE_APPROVAL_GATE_RUNTIME_VERSION } from "../types";

function newEventId() {
  return `egate-evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createExecutiveGateTrace(runId: string): ExecutiveGateTrace {
  return { version: EXECUTIVE_APPROVAL_GATE_RUNTIME_VERSION, runId, events: [] };
}

export function appendGateEvent(
  trace: ExecutiveGateTrace,
  kind: ExecutiveGateAuditEventKind,
  message: string,
  payload?: Record<string, unknown>,
): ExecutiveGateTrace {
  const event: ExecutiveGateAuditEvent = {
    eventId: newEventId(),
    runId: trace.runId,
    kind,
    message,
    at: new Date().toISOString(),
    payload,
  };
  return { ...trace, events: [...trace.events, event] };
}

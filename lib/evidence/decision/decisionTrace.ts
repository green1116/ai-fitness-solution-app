import type {
  DecisionAuditEvent,
  DecisionAuditEventKind,
  DecisionRuntimeTrace,
} from "../types";
import { TENDER_DECISION_RUNTIME_VERSION } from "../types";

function newEventId() {
  return `dec-evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createDecisionTrace(runId: string): DecisionRuntimeTrace {
  return { version: TENDER_DECISION_RUNTIME_VERSION, runId, events: [] };
}

export function appendDecisionEvent(
  trace: DecisionRuntimeTrace,
  kind: DecisionAuditEventKind,
  message: string,
  payload?: Record<string, unknown>,
): DecisionRuntimeTrace {
  const event: DecisionAuditEvent = {
    eventId: newEventId(),
    runId: trace.runId,
    kind,
    message,
    at: new Date().toISOString(),
    payload,
  };
  return { ...trace, events: [...trace.events, event] };
}

import type {
  StateMachineAuditEvent,
  StateMachineAuditEventKind,
  StateMachineTrace,
} from "../types";
import { RUNTIME_STATE_MACHINE_VERSION } from "../types";

function newEventId() {
  return `fsm-evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createStateMachineTrace(runId: string): StateMachineTrace {
  return { version: RUNTIME_STATE_MACHINE_VERSION, runId, events: [] };
}

export function appendStateMachineEvent(
  trace: StateMachineTrace,
  kind: StateMachineAuditEventKind,
  message: string,
  payload?: Record<string, unknown>,
): StateMachineTrace {
  const event: StateMachineAuditEvent = {
    eventId: newEventId(),
    runId: trace.runId,
    kind,
    message,
    at: new Date().toISOString(),
    payload,
  };
  return { ...trace, events: [...trace.events, event] };
}

import type {
  PolicyAuditEvent,
  PolicyAuditEventKind,
  PolicyTrace,
} from "../types";
import { RUNTIME_POLICY_ENGINE_VERSION } from "../types";

function newEventId() {
  return `pol-evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createPolicyTrace(runId: string): PolicyTrace {
  return { version: RUNTIME_POLICY_ENGINE_VERSION, runId, events: [] };
}

export function appendPolicyEvent(
  trace: PolicyTrace,
  kind: PolicyAuditEventKind,
  message: string,
  payload?: Record<string, unknown>,
): PolicyTrace {
  const event: PolicyAuditEvent = {
    eventId: newEventId(),
    runId: trace.runId,
    kind,
    message,
    at: new Date().toISOString(),
    payload,
  };
  return { ...trace, events: [...trace.events, event] };
}

import type {
  GovernanceAuditEvent,
  GovernanceAuditEventKind,
  GovernanceRuntimeTrace,
} from "../types";
import { TENDER_GOVERNANCE_RUNTIME_VERSION } from "../types";

function newEventId() {
  return `gov-evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createGovernanceTrace(runId: string): GovernanceRuntimeTrace {
  return { version: TENDER_GOVERNANCE_RUNTIME_VERSION, runId, events: [] };
}

export function appendGovernanceEvent(
  trace: GovernanceRuntimeTrace,
  kind: GovernanceAuditEventKind,
  message: string,
  payload?: Record<string, unknown>,
): GovernanceRuntimeTrace {
  const event: GovernanceAuditEvent = {
    eventId: newEventId(),
    runId: trace.runId,
    kind,
    message,
    at: new Date().toISOString(),
    payload,
  };
  return { ...trace, events: [...trace.events, event] };
}

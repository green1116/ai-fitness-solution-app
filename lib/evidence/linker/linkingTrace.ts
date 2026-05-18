import type { LinkingAuditEvent, LinkingAuditEventKind, LinkingRuntimeTrace } from "../types";
import { LINKING_RUNTIME_VERSION } from "../types";

function newEventId() {
  return `lnk-evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createLinkingTrace(runId: string): LinkingRuntimeTrace {
  return { version: LINKING_RUNTIME_VERSION, runId, events: [] };
}

export function appendLinkingEvent(
  trace: LinkingRuntimeTrace,
  kind: LinkingAuditEventKind,
  message: string,
  requirementId?: string,
  payload?: Record<string, unknown>,
): LinkingRuntimeTrace {
  const event: LinkingAuditEvent = {
    eventId: newEventId(),
    runId: trace.runId,
    kind,
    message,
    at: new Date().toISOString(),
    requirementId,
    payload,
  };
  return { ...trace, events: [...trace.events, event] };
}

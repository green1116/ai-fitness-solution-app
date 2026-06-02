import type {
  CorrelationAuditEvent,
  CorrelationAuditEventKind,
  CorrelationTrace,
} from "../types";
import { RUNTIME_CORRELATION_INTELLIGENCE_VERSION } from "../types";

function newEventId() {
  return `corr-evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createCorrelationTrace(runId: string): CorrelationTrace {
  return {
    version: RUNTIME_CORRELATION_INTELLIGENCE_VERSION,
    runId,
    events: [],
  };
}

export function appendCorrelationEvent(
  trace: CorrelationTrace,
  kind: CorrelationAuditEventKind,
  message: string,
  payload?: Record<string, unknown>,
): CorrelationTrace {
  const event: CorrelationAuditEvent = {
    eventId: newEventId(),
    runId: trace.runId,
    kind,
    message,
    at: new Date().toISOString(),
    payload,
  };
  return { ...trace, events: [...trace.events, event] };
}

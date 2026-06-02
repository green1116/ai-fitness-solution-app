import type {
  ExecutiveSurfaceAuditEvent,
  ExecutiveSurfaceAuditEventKind,
  ExecutiveSurfaceTrace,
} from "../types";
import { EXECUTIVE_RELEASE_SURFACE_RUNTIME_VERSION } from "../types";

function newEventId() {
  return `esurf-evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createExecutiveSurfaceTrace(runId: string): ExecutiveSurfaceTrace {
  return {
    version: EXECUTIVE_RELEASE_SURFACE_RUNTIME_VERSION,
    runId,
    events: [],
  };
}

export function appendSurfaceEvent(
  trace: ExecutiveSurfaceTrace,
  kind: ExecutiveSurfaceAuditEventKind,
  message: string,
  payload?: Record<string, unknown>,
): ExecutiveSurfaceTrace {
  const event: ExecutiveSurfaceAuditEvent = {
    eventId: newEventId(),
    runId: trace.runId,
    kind,
    message,
    at: new Date().toISOString(),
    payload,
  };
  return { ...trace, events: [...trace.events, event] };
}

import type {
  VisualizationAuditEvent,
  VisualizationAuditEventKind,
  VisualizationTrace,
} from "../types";
import { EXECUTIVE_RUNTIME_VISUALIZATION_VERSION } from "../types";

function newEventId() {
  return `viz-evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createVisualizationTrace(runId: string): VisualizationTrace {
  return {
    version: EXECUTIVE_RUNTIME_VISUALIZATION_VERSION,
    runId,
    events: [],
  };
}

export function appendVisualizationEvent(
  trace: VisualizationTrace,
  kind: VisualizationAuditEventKind,
  message: string,
): VisualizationTrace {
  const event: VisualizationAuditEvent = {
    eventId: newEventId(),
    runId: trace.runId,
    kind,
    message,
    at: new Date().toISOString(),
  };
  return { ...trace, events: [...trace.events, event] };
}

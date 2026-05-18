import type {
  CoverageAuditEvent,
  CoverageAuditEventKind,
  CoverageRuntimeTrace,
} from "../types";
import { COVERAGE_RUNTIME_VERSION } from "../types";

function newEventId() {
  return `cov-evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createCoverageTrace(runId: string): CoverageRuntimeTrace {
  return { version: COVERAGE_RUNTIME_VERSION, runId, events: [] };
}

export function appendCoverageEvent(
  trace: CoverageRuntimeTrace,
  kind: CoverageAuditEventKind,
  message: string,
  requirementId?: string,
  payload?: Record<string, unknown>,
): CoverageRuntimeTrace {
  const event: CoverageAuditEvent = {
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

import type {
  EvidenceAuditEvent,
  EvidenceAuditEventKind,
  EvidenceRuntimePhaseId,
  EvidenceRuntimeTrace,
} from "../types";
import { EVIDENCE_RUNTIME_VERSION } from "../types";

function newEventId() {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createRuntimeTrace(runId: string): EvidenceRuntimeTrace {
  return {
    version: EVIDENCE_RUNTIME_VERSION,
    runId,
    startedAt: new Date().toISOString(),
    events: [],
  };
}

export function appendAuditEvent(
  trace: EvidenceRuntimeTrace,
  input: {
    phaseId: EvidenceRuntimePhaseId;
    kind: EvidenceAuditEventKind;
    message: string;
    payload?: Record<string, unknown>;
  },
): EvidenceRuntimeTrace {
  const event: EvidenceAuditEvent = {
    eventId: newEventId(),
    runId: trace.runId,
    phaseId: input.phaseId,
    kind: input.kind,
    message: input.message,
    at: new Date().toISOString(),
    payload: input.payload,
  };
  return {
    ...trace,
    events: [...trace.events, event],
  };
}

export function finishRuntimeTrace(trace: EvidenceRuntimeTrace): EvidenceRuntimeTrace {
  return {
    ...trace,
    finishedAt: new Date().toISOString(),
  };
}

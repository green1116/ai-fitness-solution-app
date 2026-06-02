import type {
  TenderAuditTrace,
  ValidationAuditEvent,
  ValidationAuditEventKind,
} from "../types";
import { TENDER_VALIDATION_RUNTIME_VERSION } from "../types";

function newEventId() {
  return `val-evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createTenderAuditTrace(
  runId: string,
  documentId: string,
): TenderAuditTrace {
  return {
    version: TENDER_VALIDATION_RUNTIME_VERSION,
    runId,
    documentId,
    events: [],
  };
}

export function appendValidationAuditEvent(
  trace: TenderAuditTrace,
  kind: ValidationAuditEventKind,
  message: string,
  payload?: Record<string, unknown>,
): TenderAuditTrace {
  const event: ValidationAuditEvent = {
    eventId: newEventId(),
    runId: trace.runId,
    kind,
    message,
    at: new Date().toISOString(),
    payload,
  };
  return { ...trace, events: [...trace.events, event] };
}

import type { OcrAuditEvent, OcrAuditEventKind, OcrRuntimeTrace } from "../types";
import { OCR_RUNTIME_VERSION } from "../types";

function newEventId() {
  return `ocr-evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createOcrTrace(runId: string, attachmentId: string): OcrRuntimeTrace {
  return {
    version: OCR_RUNTIME_VERSION,
    runId,
    attachmentId,
    events: [],
  };
}

export function appendOcrEvent(
  trace: OcrRuntimeTrace,
  kind: OcrAuditEventKind,
  message: string,
  payload?: Record<string, unknown>,
): OcrRuntimeTrace {
  const event: OcrAuditEvent = {
    eventId: newEventId(),
    runId: trace.runId,
    attachmentId: trace.attachmentId,
    kind,
    message,
    at: new Date().toISOString(),
    payload,
  };
  return { ...trace, events: [...trace.events, event] };
}

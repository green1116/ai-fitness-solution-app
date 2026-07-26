/**
 * Product M09 — AI Audit event registry (record only)
 */

import {
  AI_AUDIT_EVENT_KINDS,
  AI_AUDIT_SEVERITIES,
} from "./audit.constants";
import type {
  AiAuditEvent,
  AiAuditEventKind,
  AiAuditSeverity,
  RecordAiAuditEventInput,
} from "./audit.types";

const events = new Map<string, AiAuditEvent>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvent(event: AiAuditEvent): AiAuditEvent {
  return { ...event, metadata: { ...event.metadata } };
}

export function recordAiAuditEvent(
  input: RecordAiAuditEventInput,
): AiAuditEvent {
  const eventKey = input.eventKey.trim().toUpperCase();
  const policyKeyRef = input.policyKeyRef.trim().toUpperCase();
  const subjectRef = input.subjectRef.trim().toUpperCase();
  if (!eventKey) throw new Error("event.eventKey is required");
  if (!policyKeyRef) throw new Error("event.policyKeyRef is required");
  if (!subjectRef) throw new Error("event.subjectRef is required");
  if (!(AI_AUDIT_EVENT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid audit event kind: ${input.kind}`);
  }

  const severity = input.severity ?? AI_AUDIT_SEVERITIES[0];
  if (!(AI_AUDIT_SEVERITIES as readonly string[]).includes(severity)) {
    throw new Error(`invalid audit severity: ${severity}`);
  }
  if (keys.has(eventKey)) {
    throw new Error(`eventKey already exists: ${eventKey}`);
  }

  const id = input.id?.trim() || createId("aiaudevt");
  if (events.has(id)) throw new Error(`audit event already exists: ${id}`);

  const event: AiAuditEvent = {
    id,
    eventKey,
    kind: input.kind,
    severity,
    policyKeyRef,
    subjectRef,
    detail: `kind=${input.kind} policy=${policyKeyRef}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  events.set(id, event);
  keys.set(eventKey, id);
  return cloneEvent(event);
}

export function getAiAuditEvent(id: string): AiAuditEvent | undefined {
  const event = events.get(id.trim());
  return event ? cloneEvent(event) : undefined;
}

export function listAiAuditEvents(filter?: {
  kind?: AiAuditEventKind;
  policyKeyRef?: string;
  severity?: AiAuditSeverity;
}): AiAuditEvent[] {
  let result = [...events.values()];
  if (filter?.kind) result = result.filter((e) => e.kind === filter.kind);
  if (filter?.policyKeyRef) {
    const policyKeyRef = filter.policyKeyRef.trim().toUpperCase();
    result = result.filter((e) => e.policyKeyRef === policyKeyRef);
  }
  if (filter?.severity) {
    result = result.filter((e) => e.severity === filter.severity);
  }
  return result
    .slice()
    .sort((a, b) => a.eventKey.localeCompare(b.eventKey))
    .map(cloneEvent);
}

export function clearAiAuditEvents(): void {
  events.clear();
  keys.clear();
}

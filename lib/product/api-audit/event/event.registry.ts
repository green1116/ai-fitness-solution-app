/**
 * Product API Audit — Event registry
 */

import {
  API_AUDIT_CATEGORIES,
  API_AUDIT_SEVERITIES,
} from "../management/management.constants";
import type {
  ApiAuditCategory,
  ApiAuditEvent,
  ApiAuditSeverity,
  RecordApiAuditEventInput,
} from "./event.types";

const events = new Map<string, ApiAuditEvent>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvent(event: ApiAuditEvent): ApiAuditEvent {
  return { ...event, metadata: { ...event.metadata } };
}

export function recordApiAuditEvent(
  input: RecordApiAuditEventInput,
): ApiAuditEvent {
  const eventKey = input.eventKey.trim().toUpperCase();
  const subjectKey = input.subjectKey.trim().toUpperCase();
  const governanceKeyRef = input.governanceKeyRef.trim().toUpperCase();
  const detail = input.detail.trim();
  if (!eventKey) throw new Error("event.eventKey is required");
  if (!subjectKey) throw new Error("event.subjectKey is required");
  if (!governanceKeyRef) throw new Error("event.governanceKeyRef is required");
  if (!detail) throw new Error("event.detail is required");
  if (!(API_AUDIT_CATEGORIES as readonly string[]).includes(input.category)) {
    throw new Error(`invalid audit category: ${input.category}`);
  }
  if (!(API_AUDIT_SEVERITIES as readonly string[]).includes(input.severity)) {
    throw new Error(`invalid audit severity: ${input.severity}`);
  }
  if (keys.has(eventKey)) {
    throw new Error(`eventKey already exists: ${eventKey}`);
  }

  const id = input.id?.trim() || createId("apiaud");
  if (events.has(id)) throw new Error(`event already exists: ${id}`);

  const event: ApiAuditEvent = {
    id,
    eventKey,
    category: input.category,
    severity: input.severity,
    subjectKey,
    governanceKeyRef,
    detail,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  events.set(id, event);
  keys.set(eventKey, id);
  return cloneEvent(event);
}

export function getApiAuditEvent(id: string): ApiAuditEvent | undefined {
  const event = events.get(id.trim());
  return event ? cloneEvent(event) : undefined;
}

export function listApiAuditEvents(filter?: {
  category?: ApiAuditCategory;
  severity?: ApiAuditSeverity;
}): ApiAuditEvent[] {
  let result = [...events.values()];
  if (filter?.category) {
    result = result.filter((e) => e.category === filter.category);
  }
  if (filter?.severity) {
    result = result.filter((e) => e.severity === filter.severity);
  }
  return result
    .slice()
    .sort((a, b) => a.eventKey.localeCompare(b.eventKey))
    .map(cloneEvent);
}

export function clearApiAuditEvents(): void {
  events.clear();
  keys.clear();
}

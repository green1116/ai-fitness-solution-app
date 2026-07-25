/**
 * Product Audit — Event registry
 */

import {
  AUDIT_EVENT_CATEGORIES,
  AUDIT_SEVERITIES,
} from "../security/security.constants";
import type {
  AuditEvent,
  AuditEventCategory,
  AuditSeverity,
  RecordAuditEventInput,
} from "./event.types";

const events = new Map<string, AuditEvent>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvent(event: AuditEvent): AuditEvent {
  return { ...event, metadata: { ...event.metadata } };
}

export function recordAuditEvent(input: RecordAuditEventInput): AuditEvent {
  const actorId = input.actorId.trim();
  const action = input.action.trim();
  const resource = input.resource.trim();
  if (!actorId) throw new Error("event.actorId is required");
  if (!action) throw new Error("event.action is required");
  if (!resource) throw new Error("event.resource is required");
  if (!(AUDIT_EVENT_CATEGORIES as readonly string[]).includes(input.category)) {
    throw new Error(`invalid audit category: ${input.category}`);
  }

  const severity = input.severity ?? AUDIT_SEVERITIES[0];
  if (!(AUDIT_SEVERITIES as readonly string[]).includes(severity)) {
    throw new Error(`invalid audit severity: ${severity}`);
  }

  const id = input.id?.trim() || createId("audevt");
  if (events.has(id)) throw new Error(`audit event already exists: ${id}`);

  const event: AuditEvent = {
    id,
    category: input.category,
    severity,
    actorId,
    action,
    resource,
    detail: `category=${input.category} action=${action}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  events.set(id, event);
  return cloneEvent(event);
}

export function getAuditEvent(id: string): AuditEvent | undefined {
  const event = events.get(id.trim());
  return event ? cloneEvent(event) : undefined;
}

export function listAuditEvents(filter?: {
  category?: AuditEventCategory;
  actorId?: string;
  severity?: AuditSeverity;
}): AuditEvent[] {
  let result = [...events.values()];
  if (filter?.category) {
    result = result.filter((e) => e.category === filter.category);
  }
  if (filter?.actorId) {
    const actorId = filter.actorId.trim();
    result = result.filter((e) => e.actorId === actorId);
  }
  if (filter?.severity) {
    result = result.filter((e) => e.severity === filter.severity);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEvent);
}

export function clearAuditEvents(): void {
  events.clear();
}

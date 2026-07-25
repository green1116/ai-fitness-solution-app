/**
 * Product Admin Audit — Event registry
 */

import {
  ADMIN_AUDIT_CATEGORIES,
  ADMIN_AUDIT_SEVERITIES,
} from "../traceability/traceability.constants";
import type {
  AdminAuditCategory,
  AdminAuditEvent,
  AdminAuditSeverity,
  RecordAdminAuditEventInput,
} from "./event.types";

const events = new Map<string, AdminAuditEvent>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvent(event: AdminAuditEvent): AdminAuditEvent {
  return { ...event, metadata: { ...event.metadata } };
}

export function recordAdminAuditEvent(
  input: RecordAdminAuditEventInput,
): AdminAuditEvent {
  const subjectId = input.subjectId.trim();
  const action = input.action.trim();
  const resource = input.resource.trim();
  if (!subjectId) throw new Error("event.subjectId is required");
  if (!action) throw new Error("event.action is required");
  if (!resource) throw new Error("event.resource is required");
  if (!(ADMIN_AUDIT_CATEGORIES as readonly string[]).includes(input.category)) {
    throw new Error(`invalid admin audit category: ${input.category}`);
  }

  const severity = input.severity ?? ADMIN_AUDIT_SEVERITIES[0];
  if (!(ADMIN_AUDIT_SEVERITIES as readonly string[]).includes(severity)) {
    throw new Error(`invalid admin audit severity: ${severity}`);
  }

  const id = input.id?.trim() || createId("adaudvt");
  if (events.has(id)) throw new Error(`admin audit event exists: ${id}`);

  const event: AdminAuditEvent = {
    id,
    category: input.category,
    severity,
    subjectId,
    action,
    resource,
    detail: `category=${input.category} action=${action}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  events.set(id, event);
  return cloneEvent(event);
}

export function getAdminAuditEvent(id: string): AdminAuditEvent | undefined {
  const event = events.get(id.trim());
  return event ? cloneEvent(event) : undefined;
}

export function listAdminAuditEvents(filter?: {
  category?: AdminAuditCategory;
  subjectId?: string;
  severity?: AdminAuditSeverity;
}): AdminAuditEvent[] {
  let result = [...events.values()];
  if (filter?.category) {
    result = result.filter((e) => e.category === filter.category);
  }
  if (filter?.subjectId) {
    const subjectId = filter.subjectId.trim();
    result = result.filter((e) => e.subjectId === subjectId);
  }
  if (filter?.severity) {
    result = result.filter((e) => e.severity === filter.severity);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEvent);
}

export function clearAdminAuditEvents(): void {
  events.clear();
}

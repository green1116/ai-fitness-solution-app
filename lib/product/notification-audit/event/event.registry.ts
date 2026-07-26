/**
 * Product Notification Audit — Event registry
 */

import {
  NOTIFICATION_AUDIT_CATEGORIES,
  NOTIFICATION_AUDIT_SEVERITIES,
} from "../management/management.constants";
import type {
  NotificationAuditCategory,
  NotificationAuditEvent,
  NotificationAuditSeverity,
  RecordNotificationAuditEventInput,
} from "./event.types";

const events = new Map<string, NotificationAuditEvent>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvent(event: NotificationAuditEvent): NotificationAuditEvent {
  return { ...event, metadata: { ...event.metadata } };
}

export function recordNotificationAuditEvent(
  input: RecordNotificationAuditEventInput,
): NotificationAuditEvent {
  const eventKey = input.eventKey.trim().toUpperCase();
  const subjectKey = input.subjectKey.trim().toUpperCase();
  const detail = input.detail.trim();
  if (!eventKey) throw new Error("event.eventKey is required");
  if (!subjectKey) throw new Error("event.subjectKey is required");
  if (!detail) throw new Error("event.detail is required");
  if (
    !(NOTIFICATION_AUDIT_CATEGORIES as readonly string[]).includes(
      input.category,
    )
  ) {
    throw new Error(`invalid audit category: ${input.category}`);
  }
  if (
    !(NOTIFICATION_AUDIT_SEVERITIES as readonly string[]).includes(
      input.severity,
    )
  ) {
    throw new Error(`invalid audit severity: ${input.severity}`);
  }
  if (keys.has(eventKey)) {
    throw new Error(`eventKey already exists: ${eventKey}`);
  }

  const id = input.id?.trim() || createId("naud");
  if (events.has(id)) throw new Error(`event already exists: ${id}`);

  const event: NotificationAuditEvent = {
    id,
    eventKey,
    category: input.category,
    severity: input.severity,
    subjectKey,
    detail,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  events.set(id, event);
  keys.set(eventKey, id);
  return cloneEvent(event);
}

export function getNotificationAuditEvent(
  id: string,
): NotificationAuditEvent | undefined {
  const event = events.get(id.trim());
  return event ? cloneEvent(event) : undefined;
}

export function listNotificationAuditEvents(filter?: {
  category?: NotificationAuditCategory;
  severity?: NotificationAuditSeverity;
}): NotificationAuditEvent[] {
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

export function clearNotificationAuditEvents(): void {
  events.clear();
  keys.clear();
}

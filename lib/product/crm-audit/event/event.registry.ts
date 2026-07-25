/**
 * Product CRM Audit — Event registry
 */

import {
  CRM_AUDIT_CATEGORIES,
  CRM_AUDIT_SEVERITIES,
} from "../traceability/traceability.constants";
import type {
  CrmAuditCategory,
  CrmAuditEvent,
  CrmAuditSeverity,
  RecordCrmAuditEventInput,
} from "./event.types";

const events = new Map<string, CrmAuditEvent>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvent(event: CrmAuditEvent): CrmAuditEvent {
  return { ...event, metadata: { ...event.metadata } };
}

export function recordCrmAuditEvent(
  input: RecordCrmAuditEventInput,
): CrmAuditEvent {
  const customerId = input.customerId.trim();
  const action = input.action.trim();
  const resource = input.resource.trim();
  if (!customerId) throw new Error("event.customerId is required");
  if (!action) throw new Error("event.action is required");
  if (!resource) throw new Error("event.resource is required");
  if (!(CRM_AUDIT_CATEGORIES as readonly string[]).includes(input.category)) {
    throw new Error(`invalid crm audit category: ${input.category}`);
  }

  const severity = input.severity ?? CRM_AUDIT_SEVERITIES[0];
  if (!(CRM_AUDIT_SEVERITIES as readonly string[]).includes(severity)) {
    throw new Error(`invalid crm audit severity: ${severity}`);
  }

  const id = input.id?.trim() || createId("craudvt");
  if (events.has(id)) throw new Error(`crm audit event exists: ${id}`);

  const event: CrmAuditEvent = {
    id,
    category: input.category,
    severity,
    customerId,
    action,
    resource,
    detail: `category=${input.category} action=${action}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  events.set(id, event);
  return cloneEvent(event);
}

export function getCrmAuditEvent(id: string): CrmAuditEvent | undefined {
  const event = events.get(id.trim());
  return event ? cloneEvent(event) : undefined;
}

export function listCrmAuditEvents(filter?: {
  category?: CrmAuditCategory;
  customerId?: string;
  severity?: CrmAuditSeverity;
}): CrmAuditEvent[] {
  let result = [...events.values()];
  if (filter?.category) {
    result = result.filter((e) => e.category === filter.category);
  }
  if (filter?.customerId) {
    const customerId = filter.customerId.trim();
    result = result.filter((e) => e.customerId === customerId);
  }
  if (filter?.severity) {
    result = result.filter((e) => e.severity === filter.severity);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEvent);
}

export function clearCrmAuditEvents(): void {
  events.clear();
}

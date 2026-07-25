/**
 * Product Billing Audit — Event registry
 */

import {
  BILLING_AUDIT_CATEGORIES,
  BILLING_AUDIT_SEVERITIES,
} from "../traceability/traceability.constants";
import type {
  BillingAuditCategory,
  BillingAuditEvent,
  BillingAuditSeverity,
  RecordBillingAuditEventInput,
} from "./event.types";

const events = new Map<string, BillingAuditEvent>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvent(event: BillingAuditEvent): BillingAuditEvent {
  return { ...event, metadata: { ...event.metadata } };
}

export function recordBillingAuditEvent(
  input: RecordBillingAuditEventInput,
): BillingAuditEvent {
  const accountId = input.accountId.trim();
  const action = input.action.trim();
  const resource = input.resource.trim();
  if (!accountId) throw new Error("event.accountId is required");
  if (!action) throw new Error("event.action is required");
  if (!resource) throw new Error("event.resource is required");
  if (
    !(BILLING_AUDIT_CATEGORIES as readonly string[]).includes(input.category)
  ) {
    throw new Error(`invalid billing audit category: ${input.category}`);
  }

  const severity = input.severity ?? BILLING_AUDIT_SEVERITIES[0];
  if (!(BILLING_AUDIT_SEVERITIES as readonly string[]).includes(severity)) {
    throw new Error(`invalid billing audit severity: ${severity}`);
  }
  if (
    input.amountCents !== undefined &&
    (!Number.isFinite(input.amountCents) || input.amountCents < 0)
  ) {
    throw new Error("event.amountCents must be >= 0");
  }

  const id = input.id?.trim() || createId("baudvt");
  if (events.has(id)) throw new Error(`billing audit event exists: ${id}`);

  const event: BillingAuditEvent = {
    id,
    category: input.category,
    severity,
    accountId,
    action,
    resource,
    amountCents: input.amountCents,
    detail: `category=${input.category} action=${action}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  events.set(id, event);
  return cloneEvent(event);
}

export function getBillingAuditEvent(
  id: string,
): BillingAuditEvent | undefined {
  const event = events.get(id.trim());
  return event ? cloneEvent(event) : undefined;
}

export function listBillingAuditEvents(filter?: {
  category?: BillingAuditCategory;
  accountId?: string;
  severity?: BillingAuditSeverity;
}): BillingAuditEvent[] {
  let result = [...events.values()];
  if (filter?.category) {
    result = result.filter((e) => e.category === filter.category);
  }
  if (filter?.accountId) {
    const accountId = filter.accountId.trim();
    result = result.filter((e) => e.accountId === accountId);
  }
  if (filter?.severity) {
    result = result.filter((e) => e.severity === filter.severity);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEvent);
}

export function clearBillingAuditEvents(): void {
  events.clear();
}

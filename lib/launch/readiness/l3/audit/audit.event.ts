/**
 * Launch L3 — Audit event
 */

import { AUDIT_EVENT_KINDS } from "../runtime/runtime.constants";
import { getRuntime } from "../runtime/runtime.status";
import type {
  AuditEvent,
  AuditEventKind,
  RecordAuditEventInput,
} from "./audit.types";

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
  const runtimeId = input.runtimeId.trim();
  const actor = input.actor.trim();
  const message = input.message.trim();
  if (!runtimeId) throw new Error("audit.runtimeId is required");
  if (!actor) throw new Error("audit.actor is required");
  if (!message) throw new Error("audit.message is required");
  if (!getRuntime(runtimeId)) {
    throw new Error(`runtime not found: ${runtimeId}`);
  }
  if (!(AUDIT_EVENT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid audit event kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("l3aud");
  if (events.has(id)) {
    throw new Error(`audit event already exists: ${id}`);
  }

  const event: AuditEvent = {
    id,
    runtimeId,
    kind: input.kind,
    actor,
    message,
    detail: `kind=${input.kind} actor=${actor}`,
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
  runtimeId?: string;
  kind?: AuditEventKind;
}): AuditEvent[] {
  let result = [...events.values()];
  if (filter?.runtimeId) {
    const rid = filter.runtimeId.trim();
    result = result.filter((e) => e.runtimeId === rid);
  }
  if (filter?.kind) result = result.filter((e) => e.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEvent);
}

export function clearAuditEvents(): void {
  events.clear();
}

/**
 * Commercialization P7 — Audit record
 */

import { AUDIT_EVENT_KINDS } from "../governance/governance.constants";
import type {
  AuditEventKind,
  AuditRecord,
  RecordAuditInput,
} from "./audit.types";

const records = new Map<string, AuditRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRecord(record: AuditRecord): AuditRecord {
  return { ...record, metadata: { ...record.metadata } };
}

export function recordAuditEvent(input: RecordAuditInput): AuditRecord {
  const actor = input.actor.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();
  if (!actor) throw new Error("audit.actor is required");
  if (!subject) throw new Error("audit.subject is required");
  if (!message) throw new Error("audit.message is required");
  if (!(AUDIT_EVENT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid audit event kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("aud");
  if (records.has(id)) {
    throw new Error(`audit record already exists: ${id}`);
  }

  const record: AuditRecord = {
    id,
    kind: input.kind,
    actor,
    subject,
    message,
    detail: `kind=${input.kind} actor=${actor} subject=${subject}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  records.set(id, record);
  return cloneRecord(record);
}

export function getAuditRecord(id: string): AuditRecord | undefined {
  const record = records.get(id.trim());
  return record ? cloneRecord(record) : undefined;
}

export function listAuditRecords(filter?: {
  kind?: AuditEventKind;
  subject?: string;
  actor?: string;
}): AuditRecord[] {
  let result = [...records.values()];
  if (filter?.kind) result = result.filter((r) => r.kind === filter.kind);
  if (filter?.subject) {
    const subject = filter.subject.trim();
    result = result.filter((r) => r.subject === subject);
  }
  if (filter?.actor) {
    const actor = filter.actor.trim();
    result = result.filter((r) => r.actor === actor);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRecord);
}

export function clearAuditRecords(): void {
  records.clear();
}

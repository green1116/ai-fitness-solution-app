/**
 * Commercialization P7 — Audit trail
 */

import { listAuditRecords } from "./audit.record";
import type {
  AssembleAuditTrailInput,
  AuditTrail,
} from "./audit.types";

const trails = new Map<string, AuditTrail>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTrail(trail: AuditTrail): AuditTrail {
  return { ...trail, entryIds: [...trail.entryIds] };
}

export function assembleAuditTrail(
  input: AssembleAuditTrailInput,
): AuditTrail {
  const subject = input.subject.trim();
  if (!subject) throw new Error("auditTrail.subject is required");

  const entries = listAuditRecords({ subject });
  if (entries.length < 1) {
    throw new Error(`no audit records for subject: ${subject}`);
  }

  const id = input.id?.trim() || createId("trl");
  if (trails.has(id)) {
    throw new Error(`audit trail already exists: ${id}`);
  }

  const trail: AuditTrail = {
    id,
    subject,
    entryIds: entries.map((e) => e.id),
    entryCount: entries.length,
    detail: `subject=${subject} entries=${entries.length}`,
    assembledAt: nowIso(),
  };
  trails.set(id, trail);
  return cloneTrail(trail);
}

export function getAuditTrail(id: string): AuditTrail | undefined {
  const trail = trails.get(id.trim());
  return trail ? cloneTrail(trail) : undefined;
}

export function listAuditTrails(filter?: {
  subject?: string;
}): AuditTrail[] {
  let result = [...trails.values()];
  if (filter?.subject) {
    const subject = filter.subject.trim();
    result = result.filter((t) => t.subject === subject);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTrail);
}

export function clearAuditTrails(): void {
  trails.clear();
}

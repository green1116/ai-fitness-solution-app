/**
 * E11-P5 — Audit Trail
 */

import { AUDIT_ACTIONS } from "./observability.constants";
import type { AuditAction, AuditEntry, RecordAuditInput } from "./observability.types";

const audits: AuditEntry[] = [];

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAudit(entry: AuditEntry): AuditEntry {
  return { ...entry, detail: { ...entry.detail } };
}

export function recordAudit(input: RecordAuditInput): AuditEntry {
  const actor = input.actor.trim();
  const target = input.target.trim();
  if (!actor) throw new Error("audit.actor is required");
  if (!target) throw new Error("audit.target is required");
  if (!(AUDIT_ACTIONS as readonly string[]).includes(input.action)) {
    throw new Error(`invalid audit action: ${input.action}`);
  }

  const entry: AuditEntry = {
    id: input.id?.trim() || createId("audit"),
    action: input.action,
    actor,
    target,
    tenantId: input.tenantId?.trim() || undefined,
    runtimeId: input.runtimeId?.trim() || undefined,
    detail: { ...(input.detail ?? {}) },
    recordedAt: nowIso(),
  };
  audits.push(entry);
  return cloneAudit(entry);
}

export function listAudits(filter?: {
  action?: AuditAction;
  tenantId?: string;
  runtimeId?: string;
  actor?: string;
}): AuditEntry[] {
  let result = [...audits];
  if (filter?.action) result = result.filter((a) => a.action === filter.action);
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((a) => a.tenantId === tid);
  }
  if (filter?.runtimeId) {
    const rid = filter.runtimeId.trim();
    result = result.filter((a) => a.runtimeId === rid);
  }
  if (filter?.actor) {
    const actor = filter.actor.trim();
    result = result.filter((a) => a.actor === actor);
  }
  return result
    .slice()
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
    .map(cloneAudit);
}

export function clearAudits(): void {
  audits.length = 0;
}

export function auditCount(): number {
  return audits.length;
}

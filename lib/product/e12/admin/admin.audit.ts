/**
 * E12-P3 — Admin Audit Trail
 */

import { ADMIN_AUDIT_ACTIONS } from "./admin.constants";
import type { AdminAuditAction, AdminAuditEntry, RecordAdminAuditInput } from "./admin.types";

const auditEntries = new Map<string, AdminAuditEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntry(entry: AdminAuditEntry): AdminAuditEntry {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function recordAdminAudit(
  input: RecordAdminAuditInput,
): AdminAuditEntry {
  const action = input.action;
  const actorUserId = input.actorUserId.trim();
  const detail = input.detail.trim();
  if (!actorUserId) throw new Error("audit.actorUserId is required");
  if (!detail) throw new Error("audit.detail is required");
  if (!(ADMIN_AUDIT_ACTIONS as readonly string[]).includes(action)) {
    throw new Error(`invalid audit action: ${action}`);
  }

  const id = input.id?.trim() || createId("audit");
  if (auditEntries.has(id)) throw new Error(`audit entry already exists: ${id}`);

  const entry: AdminAuditEntry = {
    id,
    action,
    actorUserId,
    organizationId: input.organizationId?.trim() || undefined,
    productTenantId: input.productTenantId?.trim() || undefined,
    productId: input.productId?.trim() || undefined,
    detail,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  auditEntries.set(id, entry);
  return cloneEntry(entry);
}

export function getAdminAuditEntry(id: string): AdminAuditEntry | undefined {
  const entry = auditEntries.get(id.trim());
  return entry ? cloneEntry(entry) : undefined;
}

export function listAdminAuditEntries(filter?: {
  actorUserId?: string;
  organizationId?: string;
  productTenantId?: string;
  productId?: string;
  action?: AdminAuditAction;
}): AdminAuditEntry[] {
  let result = [...auditEntries.values()];
  if (filter?.actorUserId) {
    const uid = filter.actorUserId.trim();
    result = result.filter((e) => e.actorUserId === uid);
  }
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((e) => e.organizationId === oid);
  }
  if (filter?.productTenantId) {
    const tid = filter.productTenantId.trim();
    result = result.filter((e) => e.productTenantId === tid);
  }
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((e) => e.productId === pid);
  }
  if (filter?.action) result = result.filter((e) => e.action === filter.action);
  return result
    .slice()
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
    .map(cloneEntry);
}

export function clearAdminAuditTrail(): void {
  auditEntries.clear();
}

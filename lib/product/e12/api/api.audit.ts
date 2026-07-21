/**
 * E12-P5 — API Audit Trail
 */

import { API_AUDIT_ACTIONS } from "./api.constants";
import type {
  ApiAuditAction,
  ApiAuditEntry,
  RecordApiAuditInput,
} from "./api.types";

const auditEntries = new Map<string, ApiAuditEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntry(entry: ApiAuditEntry): ApiAuditEntry {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function recordApiAudit(input: RecordApiAuditInput): ApiAuditEntry {
  const action = input.action;
  const actorUserId = input.actorUserId.trim();
  const detail = input.detail.trim();
  if (!actorUserId) throw new Error("audit.actorUserId is required");
  if (!detail) throw new Error("audit.detail is required");
  if (!(API_AUDIT_ACTIONS as readonly string[]).includes(action)) {
    throw new Error(`invalid api audit action: ${action}`);
  }

  const id = input.id?.trim() || createId("apiaudit");
  if (auditEntries.has(id)) {
    throw new Error(`api audit entry already exists: ${id}`);
  }

  const entry: ApiAuditEntry = {
    id,
    action,
    actorUserId,
    productTenantId: input.productTenantId?.trim() || undefined,
    apiKeyId: input.apiKeyId?.trim() || undefined,
    apiCatalogEntryId: input.apiCatalogEntryId?.trim() || undefined,
    detail,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  auditEntries.set(id, entry);
  return cloneEntry(entry);
}

export function listApiAuditEntries(filter?: {
  actorUserId?: string;
  productTenantId?: string;
  apiKeyId?: string;
  action?: ApiAuditAction;
}): ApiAuditEntry[] {
  let result = [...auditEntries.values()];
  if (filter?.actorUserId) {
    const uid = filter.actorUserId.trim();
    result = result.filter((e) => e.actorUserId === uid);
  }
  if (filter?.productTenantId) {
    const tid = filter.productTenantId.trim();
    result = result.filter((e) => e.productTenantId === tid);
  }
  if (filter?.apiKeyId) {
    const kid = filter.apiKeyId.trim();
    result = result.filter((e) => e.apiKeyId === kid);
  }
  if (filter?.action) result = result.filter((e) => e.action === filter.action);
  return result
    .slice()
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
    .map(cloneEntry);
}

export function clearApiAuditTrail(): void {
  auditEntries.clear();
}

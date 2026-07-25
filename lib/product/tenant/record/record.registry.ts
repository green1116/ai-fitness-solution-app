/**
 * Product Tenant — Record registry
 */

import {
  TENANT_RECORD_STATUSES,
  TENANT_TIERS,
} from "../administration/administration.constants";
import type {
  RegisterTenantRecordInput,
  TenantRecord,
  TenantRecordStatus,
  TenantTier,
  UpdateTenantRecordStatusInput,
} from "./record.types";

const records = new Map<string, TenantRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRecord(record: TenantRecord): TenantRecord {
  return { ...record, metadata: { ...record.metadata } };
}

export function registerTenantRecord(
  input: RegisterTenantRecordInput,
): TenantRecord {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  const adminTenantId = input.adminTenantId.trim();
  if (!code) throw new Error("record.code is required");
  if (!name) throw new Error("record.name is required");
  if (!adminTenantId) throw new Error("record.adminTenantId is required");
  if (!(TENANT_TIERS as readonly string[]).includes(input.tier)) {
    throw new Error(`invalid tenant tier: ${input.tier}`);
  }

  const duplicate = [...records.values()].find((r) => r.code === code);
  if (duplicate) throw new Error(`tenant code already exists: ${code}`);

  const id = input.id?.trim() || createId("tntrcd");
  if (records.has(id)) throw new Error(`tenant record already exists: ${id}`);

  const now = nowIso();
  const record: TenantRecord = {
    id,
    code,
    name,
    tier: input.tier,
    adminTenantId,
    status: TENANT_RECORD_STATUSES[0],
    detail: `tier=${input.tier} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  records.set(id, record);
  return cloneRecord(record);
}

export function updateTenantRecordStatus(
  input: UpdateTenantRecordStatusInput,
): TenantRecord {
  const recordId = input.recordId.trim();
  if (!recordId) throw new Error("record.recordId is required");
  if (!(TENANT_RECORD_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid tenant record status: ${input.status}`);
  }

  const existing = records.get(recordId);
  if (!existing) throw new Error(`tenant record not found: ${recordId}`);

  const updated: TenantRecord = {
    ...existing,
    status: input.status,
    detail: `tier=${existing.tier} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  records.set(recordId, updated);
  return cloneRecord(updated);
}

export function getTenantRecord(id: string): TenantRecord | undefined {
  const record = records.get(id.trim());
  return record ? cloneRecord(record) : undefined;
}

export function listTenantRecords(filter?: {
  tier?: TenantTier;
  status?: TenantRecordStatus;
}): TenantRecord[] {
  let result = [...records.values()];
  if (filter?.tier) result = result.filter((r) => r.tier === filter.tier);
  if (filter?.status) {
    result = result.filter((r) => r.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRecord);
}

export function clearTenantRecords(): void {
  records.clear();
}

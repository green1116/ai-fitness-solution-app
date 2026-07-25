/**
 * Product Tenant — Quota registry
 */

import { TENANT_QUOTA_RESOURCES } from "../administration/administration.constants";
import { getTenantRecord } from "../record/record.registry";
import type {
  SetTenantQuotaInput,
  TenantQuota,
  TenantQuotaResource,
} from "./quota.types";

const quotas = new Map<string, TenantQuota>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuota(quota: TenantQuota): TenantQuota {
  return { ...quota, metadata: { ...quota.metadata } };
}

export function setTenantQuota(input: SetTenantQuotaInput): TenantQuota {
  const recordId = input.recordId.trim();
  if (!recordId) throw new Error("quota.recordId is required");
  if (!(TENANT_QUOTA_RESOURCES as readonly string[]).includes(input.resource)) {
    throw new Error(`invalid quota resource: ${input.resource}`);
  }
  if (!Number.isFinite(input.limit) || input.limit < 0) {
    throw new Error("quota.limit must be a non-negative number");
  }
  if (!getTenantRecord(recordId)) {
    throw new Error(`tenant record not found: ${recordId}`);
  }

  const existing = [...quotas.values()].find(
    (q) => q.recordId === recordId && q.resource === input.resource,
  );
  const id = input.id?.trim() || existing?.id || createId("tntqta");
  if (quotas.has(id) && existing && existing.id !== id) {
    throw new Error(`tenant quota already exists: ${id}`);
  }

  const quota: TenantQuota = {
    id,
    recordId,
    resource: input.resource,
    limit: input.limit,
    detail: `resource=${input.resource} limit=${input.limit}`,
    metadata: { ...(input.metadata ?? existing?.metadata ?? {}) },
    setAt: nowIso(),
  };
  quotas.set(id, quota);
  return cloneQuota(quota);
}

export function getTenantQuota(id: string): TenantQuota | undefined {
  const quota = quotas.get(id.trim());
  return quota ? cloneQuota(quota) : undefined;
}

export function listTenantQuotas(filter?: {
  recordId?: string;
  resource?: TenantQuotaResource;
}): TenantQuota[] {
  let result = [...quotas.values()];
  if (filter?.recordId) {
    const recordId = filter.recordId.trim();
    result = result.filter((q) => q.recordId === recordId);
  }
  if (filter?.resource) {
    result = result.filter((q) => q.resource === filter.resource);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneQuota);
}

export function clearTenantQuotas(): void {
  quotas.clear();
}

/**
 * E11-P3 — Tenant Resource Quota
 */

import { TENANT_QUOTA_TYPES } from "./tenant.constants";
import { getTenant } from "./tenant.namespace";
import type {
  CreateTenantQuotaInput,
  TenantQuota,
  TenantQuotaType,
} from "./tenant.types";

const quotas = new Map<string, TenantQuota>();

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuota(quota: TenantQuota): TenantQuota {
  return { ...quota, metadata: { ...quota.metadata } };
}

function assertType(type: string): asserts type is TenantQuotaType {
  if (!(TENANT_QUOTA_TYPES as readonly string[]).includes(type)) {
    throw new Error(`invalid tenant quota type: ${type}`);
  }
}

export function createTenantQuota(
  input: CreateTenantQuotaInput,
): TenantQuota {
  const tenantId = input.tenantId.trim();
  if (!tenantId) throw new Error("quota.tenantId is required");
  if (!getTenant(tenantId)) {
    throw new Error(`tenant not found: ${tenantId}`);
  }
  assertType(input.type);
  if (!Number.isFinite(input.limit) || input.limit < 0) {
    throw new Error("quota.limit must be a finite number >= 0");
  }

  for (const q of quotas.values()) {
    if (q.tenantId === tenantId && q.type === input.type) {
      throw new Error(
        `quota already exists for tenant=${tenantId} type=${input.type}`,
      );
    }
  }

  const id = input.id?.trim() || createId("tquota");
  if (quotas.has(id)) throw new Error(`quota already exists: ${id}`);

  const quota: TenantQuota = {
    id,
    tenantId,
    type: input.type,
    limit: input.limit,
    used: 0,
    metadata: { ...(input.metadata ?? {}) },
  };
  quotas.set(id, quota);
  return cloneQuota(quota);
}

export function getTenantQuota(id: string): TenantQuota | undefined {
  const quota = quotas.get(id.trim());
  return quota ? cloneQuota(quota) : undefined;
}

export function getTenantQuotaByType(
  tenantId: string,
  type: TenantQuotaType,
): TenantQuota | undefined {
  const tid = tenantId.trim();
  for (const q of quotas.values()) {
    if (q.tenantId === tid && q.type === type) return cloneQuota(q);
  }
  return undefined;
}

export function listTenantQuotas(filter?: {
  tenantId?: string;
  type?: TenantQuotaType;
}): TenantQuota[] {
  let result = [...quotas.values()];
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((q) => q.tenantId === tid);
  }
  if (filter?.type) {
    result = result.filter((q) => q.type === filter.type);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneQuota);
}

export function reserveQuota(
  tenantId: string,
  type: TenantQuotaType,
  amount = 1,
): TenantQuota {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("reserve amount must be a finite number > 0");
  }
  const quota = [...quotas.values()].find(
    (q) => q.tenantId === tenantId.trim() && q.type === type,
  );
  if (!quota) {
    throw new Error(
      `quota not found for tenant=${tenantId} type=${type}`,
    );
  }
  if (quota.used + amount > quota.limit) {
    throw new Error(
      `quota exceeded: tenant=${tenantId} type=${type} used=${quota.used} limit=${quota.limit}`,
    );
  }
  quota.used += amount;
  quotas.set(quota.id, quota);
  return cloneQuota(quota);
}

export function releaseQuota(
  tenantId: string,
  type: TenantQuotaType,
  amount = 1,
): TenantQuota {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("release amount must be a finite number > 0");
  }
  const quota = [...quotas.values()].find(
    (q) => q.tenantId === tenantId.trim() && q.type === type,
  );
  if (!quota) {
    throw new Error(
      `quota not found for tenant=${tenantId} type=${type}`,
    );
  }
  quota.used = Math.max(0, quota.used - amount);
  quotas.set(quota.id, quota);
  return cloneQuota(quota);
}

export function clearTenantQuotas(): void {
  quotas.clear();
}

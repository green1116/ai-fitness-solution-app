/**
 * Product P11 — Tenant registry
 */

import { TENANT_STATUSES } from "../release/release.constants";
import { getRelease } from "../release/release.registry";
import type {
  CommercialTenant,
  ProvisionTenantInput,
  UpdateTenantStatusInput,
} from "./tenant.types";

const tenants = new Map<string, CommercialTenant>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTenant(tenant: CommercialTenant): CommercialTenant {
  return { ...tenant, metadata: { ...tenant.metadata } };
}

export function provisionTenant(
  input: ProvisionTenantInput,
): CommercialTenant {
  const releaseId = input.releaseId.trim();
  const slug = input.slug.trim();
  const name = input.name.trim();
  if (!releaseId) throw new Error("tenant.releaseId is required");
  if (!slug) throw new Error("tenant.slug is required");
  if (!name) throw new Error("tenant.name is required");
  if (!getRelease(releaseId)) {
    throw new Error(`release not found: ${releaseId}`);
  }

  const id = input.id?.trim() || createId("p11tnt");
  if (tenants.has(id)) {
    throw new Error(`tenant already exists: ${id}`);
  }

  const now = nowIso();
  const status = TENANT_STATUSES[1];
  const tenant: CommercialTenant = {
    id,
    releaseId,
    slug,
    name,
    status,
    detail: `status=${status} slug=${slug}`,
    metadata: { ...(input.metadata ?? {}) },
    provisionedAt: now,
    updatedAt: now,
  };
  tenants.set(id, tenant);
  return cloneTenant(tenant);
}

export function updateTenantStatus(
  input: UpdateTenantStatusInput,
): CommercialTenant {
  const tenantId = input.tenantId.trim();
  if (!tenantId) throw new Error("tenant.tenantId is required");
  if (!(TENANT_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid tenant status: ${input.status}`);
  }
  const existing = tenants.get(tenantId);
  if (!existing) throw new Error(`tenant not found: ${tenantId}`);

  const updated: CommercialTenant = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} slug=${existing.slug}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  tenants.set(tenantId, updated);
  return cloneTenant(updated);
}

export function getTenant(id: string): CommercialTenant | undefined {
  const tenant = tenants.get(id.trim());
  return tenant ? cloneTenant(tenant) : undefined;
}

export function listTenants(filter?: {
  releaseId?: string;
}): CommercialTenant[] {
  let result = [...tenants.values()];
  if (filter?.releaseId) {
    const rid = filter.releaseId.trim();
    result = result.filter((t) => t.releaseId === rid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTenant);
}

export function clearTenants(): void {
  tenants.clear();
}

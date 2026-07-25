/**
 * Product Admin — Tenant registry
 */

import {
  ADMIN_TENANT_KINDS,
  ADMIN_TENANT_STATUSES,
} from "../foundation/foundation.constants";
import type {
  AdminTenant,
  AdminTenantKind,
  AdminTenantStatus,
  RegisterAdminTenantInput,
  UpdateAdminTenantStatusInput,
} from "./tenant.types";

const tenants = new Map<string, AdminTenant>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTenant(tenant: AdminTenant): AdminTenant {
  return { ...tenant, metadata: { ...tenant.metadata } };
}

export function registerAdminTenant(
  input: RegisterAdminTenantInput,
): AdminTenant {
  const code = input.code.trim().toUpperCase();
  if (!code) throw new Error("tenant.code is required");
  if (!(ADMIN_TENANT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid tenant kind: ${input.kind}`);
  }

  const duplicate = [...tenants.values()].find((t) => t.code === code);
  if (duplicate) throw new Error(`tenant code already exists: ${code}`);

  const id = input.id?.trim() || createId("admtnt");
  if (tenants.has(id)) throw new Error(`tenant already exists: ${id}`);

  const now = nowIso();
  const tenant: AdminTenant = {
    id,
    code,
    kind: input.kind,
    status: ADMIN_TENANT_STATUSES[0],
    detail: `kind=${input.kind} status=PROVISIONING`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  tenants.set(id, tenant);
  return cloneTenant(tenant);
}

export function updateAdminTenantStatus(
  input: UpdateAdminTenantStatusInput,
): AdminTenant {
  const tenantId = input.tenantId.trim();
  if (!tenantId) throw new Error("tenant.tenantId is required");
  if (!(ADMIN_TENANT_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid tenant status: ${input.status}`);
  }

  const existing = tenants.get(tenantId);
  if (!existing) throw new Error(`tenant not found: ${tenantId}`);

  const updated: AdminTenant = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  tenants.set(tenantId, updated);
  return cloneTenant(updated);
}

export function getAdminTenant(id: string): AdminTenant | undefined {
  const tenant = tenants.get(id.trim());
  return tenant ? cloneTenant(tenant) : undefined;
}

export function listAdminTenants(filter?: {
  kind?: AdminTenantKind;
  status?: AdminTenantStatus;
}): AdminTenant[] {
  let result = [...tenants.values()];
  if (filter?.kind) result = result.filter((t) => t.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((t) => t.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTenant);
}

export function clearAdminTenants(): void {
  tenants.clear();
}

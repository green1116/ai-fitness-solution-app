/**
 * E11-P3 — Tenant Runtime Namespace
 */

import { getRuntime } from "../registry/cloud.registry";
import { TENANT_STATUSES } from "./tenant.constants";
import { getOrganization } from "./tenant.organization";
import type {
  RegisterTenantInput,
  TenantNamespace,
  TenantStatus,
} from "./tenant.types";

const tenants = new Map<string, TenantNamespace>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneTenant(tenant: TenantNamespace): TenantNamespace {
  return {
    ...tenant,
    runtimeIds: [...tenant.runtimeIds],
    metadata: { ...tenant.metadata },
  };
}

export function registerTenant(input: RegisterTenantInput): TenantNamespace {
  const id = input.id.trim();
  const name = input.name.trim();
  const organizationId = input.organizationId.trim();
  if (!id) throw new Error("tenant.id is required");
  if (!name) throw new Error("tenant.name is required");
  if (!organizationId) throw new Error("tenant.organizationId is required");

  const org = getOrganization(organizationId);
  if (!org) throw new Error(`organization not found: ${organizationId}`);
  if (org.status !== "ACTIVE") {
    throw new Error(`organization not ACTIVE: ${organizationId}`);
  }
  if (tenants.has(id)) {
    throw new Error(`tenant already registered: ${id}`);
  }

  const namespaceKey =
    input.namespaceKey?.trim() || `ns.${organizationId}.${id}`;

  const tenant: TenantNamespace = {
    id,
    name,
    organizationId,
    status: "ACTIVE",
    runtimeIds: [],
    namespaceKey,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  tenants.set(id, tenant);
  return cloneTenant(tenant);
}

export function getTenant(id: string): TenantNamespace | undefined {
  const tenant = tenants.get(id.trim());
  return tenant ? cloneTenant(tenant) : undefined;
}

export function listTenants(filter?: {
  organizationId?: string;
  status?: TenantStatus;
}): TenantNamespace[] {
  let result = [...tenants.values()];
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((t) => t.organizationId === oid);
  }
  if (filter?.status) {
    if (!(TENANT_STATUSES as readonly string[]).includes(filter.status)) {
      throw new Error(`invalid tenant status: ${filter.status}`);
    }
    result = result.filter((t) => t.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTenant);
}

export function setTenantStatus(
  id: string,
  status: TenantStatus,
): TenantNamespace {
  const tenant = tenants.get(id.trim());
  if (!tenant) throw new Error(`tenant not found: ${id}`);
  if (!(TENANT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid tenant status: ${status}`);
  }
  tenant.status = status;
  tenants.set(tenant.id, tenant);
  return cloneTenant(tenant);
}

/** Bind a registered cloud runtime into this tenant namespace. */
export function bindRuntimeToTenant(
  tenantId: string,
  runtimeId: string,
): TenantNamespace {
  const tenant = tenants.get(tenantId.trim());
  if (!tenant) throw new Error(`tenant not found: ${tenantId}`);
  if (tenant.status !== "ACTIVE") {
    throw new Error(`tenant not ACTIVE: ${tenantId}`);
  }

  const rid = runtimeId.trim();
  const runtime = getRuntime(rid);
  if (!runtime) throw new Error(`cloud runtime not found: ${rid}`);

  // Cross-tenant binding check: runtime already owned elsewhere
  for (const other of tenants.values()) {
    if (other.id !== tenant.id && other.runtimeIds.includes(rid)) {
      throw new Error(
        `runtime already bound to tenant ${other.id}: ${rid}`,
      );
    }
  }

  if (!tenant.runtimeIds.includes(rid)) {
    tenant.runtimeIds = [...tenant.runtimeIds, rid];
  }
  tenants.set(tenant.id, tenant);
  return cloneTenant(tenant);
}

export function unbindRuntimeFromTenant(
  tenantId: string,
  runtimeId: string,
): TenantNamespace {
  const tenant = tenants.get(tenantId.trim());
  if (!tenant) throw new Error(`tenant not found: ${tenantId}`);
  const rid = runtimeId.trim();
  tenant.runtimeIds = tenant.runtimeIds.filter((id) => id !== rid);
  tenants.set(tenant.id, tenant);
  return cloneTenant(tenant);
}

export function findTenantByRuntime(
  runtimeId: string,
): TenantNamespace | undefined {
  const rid = runtimeId.trim();
  for (const tenant of tenants.values()) {
    if (tenant.runtimeIds.includes(rid)) return cloneTenant(tenant);
  }
  return undefined;
}

export function removeTenant(id: string): boolean {
  return tenants.delete(id.trim());
}

export function clearTenants(): void {
  tenants.clear();
}

/**
 * E12-P2 — Product Tenant
 */

import { getProductIdentity } from "../identity/product.identity";
import { PRODUCT_TENANT_STATUSES } from "./tenant.constants";
import { bindWorkspaceToTenant, getWorkspace } from "./tenant.workspace";
import type {
  ProductTenant,
  ProductTenantStatus,
  RegisterProductTenantInput,
} from "./tenant.types";

const tenants = new Map<string, ProductTenant>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTenant(tenant: ProductTenant): ProductTenant {
  return { ...tenant, metadata: { ...tenant.metadata } };
}

export function registerProductTenant(
  input: RegisterProductTenantInput,
): ProductTenant {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const workspaceId = input.workspaceId.trim();
  if (!name) throw new Error("tenant.name is required");
  if (!productId) throw new Error("tenant.productId is required");
  if (!workspaceId) throw new Error("tenant.workspaceId is required");

  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }
  const workspace = getWorkspace(workspaceId);
  if (!workspace) throw new Error(`workspace not found: ${workspaceId}`);
  if (workspace.status !== "ACTIVE") {
    throw new Error(`workspace not ACTIVE: ${workspaceId}`);
  }

  const status = input.status ?? "PROVISIONING";
  if (!(PRODUCT_TENANT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid tenant status: ${status}`);
  }

  const id = input.id?.trim() || createId("ptenant");
  if (tenants.has(id)) throw new Error(`product tenant already exists: ${id}`);

  const tenant: ProductTenant = {
    id,
    name,
    productId,
    workspaceId,
    status,
    organizationId: input.organizationId?.trim() || undefined,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  tenants.set(id, tenant);
  bindWorkspaceToTenant(workspaceId, id);
  return cloneTenant(tenant);
}

export function getProductTenant(id: string): ProductTenant | undefined {
  const tenant = tenants.get(id.trim());
  return tenant ? cloneTenant(tenant) : undefined;
}

export function listProductTenants(filter?: {
  productId?: string;
  status?: ProductTenantStatus;
  workspaceId?: string;
}): ProductTenant[] {
  let result = [...tenants.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((t) => t.productId === pid);
  }
  if (filter?.status) result = result.filter((t) => t.status === filter.status);
  if (filter?.workspaceId) {
    const wid = filter.workspaceId.trim();
    result = result.filter((t) => t.workspaceId === wid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTenant);
}

export function setProductTenantStatus(
  id: string,
  status: ProductTenantStatus,
): ProductTenant {
  const tenant = tenants.get(id.trim());
  if (!tenant) throw new Error(`product tenant not found: ${id}`);
  if (!(PRODUCT_TENANT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid tenant status: ${status}`);
  }
  tenant.status = status;
  tenants.set(tenant.id, tenant);
  return cloneTenant(tenant);
}

export function clearProductTenants(): void {
  tenants.clear();
}

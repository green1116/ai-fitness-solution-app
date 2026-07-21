/**
 * E12-P5 — Developer Access
 * Integrates admin permission and tenant access
 */

import { evaluateCapabilityAccess } from "../tenant/tenant.access";
import { getProductTenant } from "../tenant/tenant.product";
import {
  API_PERMISSION_SCOPES,
  DEVELOPER_ACCESS_STATUSES,
} from "./api.constants";
import type {
  ApiPermissionScope,
  DeveloperAccess,
  DeveloperAccessStatus,
  RegisterDeveloperAccessInput,
} from "./api.types";

const developers = new Map<string, DeveloperAccess>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDev(dev: DeveloperAccess): DeveloperAccess {
  return { ...dev, scopes: [...dev.scopes], metadata: { ...dev.metadata } };
}

export function registerDeveloperAccess(
  input: RegisterDeveloperAccessInput,
): DeveloperAccess {
  const userId = input.userId.trim();
  const productTenantId = input.productTenantId.trim();

  if (!userId) throw new Error("developer.userId is required");
  const tenant = getProductTenant(productTenantId);
  if (!tenant) {
    throw new Error(`product tenant not found: ${productTenantId}`);
  }
  if (tenant.status !== "ACTIVE") {
    throw new Error(`tenant not ACTIVE: ${tenant.status}`);
  }

  const status = input.status ?? "ACTIVE";
  if (
    !(DEVELOPER_ACCESS_STATUSES as readonly string[]).includes(status)
  ) {
    throw new Error(`invalid developer status: ${status}`);
  }

  const scopes = input.scopes ?? ["api:read"];
  for (const s of scopes) {
    if (!(API_PERMISSION_SCOPES as readonly string[]).includes(s)) {
      throw new Error(`invalid api scope: ${s}`);
    }
  }

  const id = input.id?.trim() || createId("dev");
  if (developers.has(id)) {
    throw new Error(`developer already exists: ${id}`);
  }

  const dev: DeveloperAccess = {
    id,
    userId,
    productTenantId,
    organizationId: input.organizationId?.trim() || undefined,
    scopes,
    status,
    metadata: { ...(input.metadata ?? {}) },
    registeredAt: nowIso(),
  };
  developers.set(id, dev);
  return cloneDev(dev);
}

export function getDeveloperAccess(id: string): DeveloperAccess | undefined {
  const dev = developers.get(id.trim());
  return dev ? cloneDev(dev) : undefined;
}

export function listDeveloperAccess(filter?: {
  productTenantId?: string;
  userId?: string;
  status?: DeveloperAccessStatus;
}): DeveloperAccess[] {
  let result = [...developers.values()];
  if (filter?.productTenantId) {
    const tid = filter.productTenantId.trim();
    result = result.filter((d) => d.productTenantId === tid);
  }
  if (filter?.userId) {
    const uid = filter.userId.trim();
    result = result.filter((d) => d.userId === uid);
  }
  if (filter?.status) result = result.filter((d) => d.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDev);
}

export function suspendDeveloper(id: string): DeveloperAccess {
  const dev = developers.get(id.trim());
  if (!dev) throw new Error(`developer not found: ${id}`);
  dev.status = "SUSPENDED";
  developers.set(dev.id, dev);
  return cloneDev(dev);
}

export function grantDeveloperScope(
  id: string,
  scope: ApiPermissionScope,
): DeveloperAccess {
  const dev = developers.get(id.trim());
  if (!dev) throw new Error(`developer not found: ${id}`);
  if (!(API_PERMISSION_SCOPES as readonly string[]).includes(scope)) {
    throw new Error(`invalid api scope: ${scope}`);
  }
  if (!dev.scopes.includes(scope)) dev.scopes.push(scope);
  developers.set(dev.id, dev);
  return cloneDev(dev);
}

export function revokeDeveloperScope(
  id: string,
  scope: ApiPermissionScope,
): DeveloperAccess {
  const dev = developers.get(id.trim());
  if (!dev) throw new Error(`developer not found: ${id}`);
  dev.scopes = dev.scopes.filter((s) => s !== scope);
  developers.set(dev.id, dev);
  return cloneDev(dev);
}

export function clearDeveloperAccess(): void {
  developers.clear();
}

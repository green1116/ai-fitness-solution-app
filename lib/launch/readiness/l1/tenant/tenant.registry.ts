/**
 * Launch L1 — Tenant registry
 */

import { TENANT_STATUSES } from "../demo/demo.constants";
import type {
  DemoTenant,
  RegisterTenantInput,
  TenantStatus,
} from "./tenant.types";

const tenants = new Map<string, DemoTenant>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cloneTenant(tenant: DemoTenant): DemoTenant {
  return { ...tenant, metadata: { ...tenant.metadata } };
}

export function registerTenant(input: RegisterTenantInput): DemoTenant {
  const name = input.name.trim();
  if (!name) throw new Error("tenant.name is required");

  const status: TenantStatus = input.status ?? "READY";
  if (!(TENANT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid tenant status: ${status}`);
  }

  const slug = (input.slug?.trim() || slugify(name)) || "tenant";
  const id = input.id?.trim() || createId("l1ten");
  if (tenants.has(id)) {
    throw new Error(`tenant already exists: ${id}`);
  }

  const now = nowIso();
  const tenant: DemoTenant = {
    id,
    name,
    slug,
    status,
    region: (input.region ?? "us-east-1").trim() || "us-east-1",
    detail: `status=${status} slug=${slug}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  tenants.set(id, tenant);
  return cloneTenant(tenant);
}

export function getTenant(id: string): DemoTenant | undefined {
  const tenant = tenants.get(id.trim());
  return tenant ? cloneTenant(tenant) : undefined;
}

export function listTenants(filter?: {
  status?: TenantStatus;
}): DemoTenant[] {
  let result = [...tenants.values()];
  if (filter?.status) {
    result = result.filter((t) => t.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTenant);
}

export function clearTenants(): void {
  tenants.clear();
}

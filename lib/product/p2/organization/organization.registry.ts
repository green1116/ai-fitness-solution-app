/**
 * Product P2 — Organization registry
 */

import { ORGANIZATION_STATUSES } from "./organization.constants";
import type {
  Organization,
  OrganizationStatus,
  RegisterOrganizationInput,
} from "./organization.types";

const organizations = new Map<string, Organization>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOrg(org: Organization): Organization {
  return { ...org, metadata: { ...org.metadata } };
}

export function registerOrganization(
  input: RegisterOrganizationInput,
): Organization {
  const accountRef = input.accountRef.trim();
  const name = input.name.trim();
  const owner = input.owner.trim();
  if (!accountRef) throw new Error("organization.accountRef is required");
  if (!name) throw new Error("organization.name is required");
  if (!owner) throw new Error("organization.owner is required");

  const id = input.id?.trim() || createId("p2org");
  if (organizations.has(id)) {
    throw new Error(`organization already exists: ${id}`);
  }

  const now = nowIso();
  const status = ORGANIZATION_STATUSES[1];
  const org: Organization = {
    id,
    accountRef,
    name,
    status,
    owner,
    detail: `status=${status} owner=${owner}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  organizations.set(id, org);
  return cloneOrg(org);
}

export function updateOrganizationStatus(
  organizationId: string,
  status: OrganizationStatus,
): Organization {
  const existing = organizations.get(organizationId.trim());
  if (!existing) {
    throw new Error(`organization not found: ${organizationId}`);
  }
  if (!(ORGANIZATION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid organization status: ${status}`);
  }
  const updated: Organization = {
    ...existing,
    status,
    detail: `status=${status} owner=${existing.owner}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  organizations.set(organizationId.trim(), updated);
  return cloneOrg(updated);
}

export function getOrganization(id: string): Organization | undefined {
  const org = organizations.get(id.trim());
  return org ? cloneOrg(org) : undefined;
}

export function listOrganizations(filter?: {
  accountRef?: string;
  status?: OrganizationStatus;
}): Organization[] {
  let result = [...organizations.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((o) => o.accountRef === aref);
  }
  if (filter?.status) result = result.filter((o) => o.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOrg);
}

export function clearOrganizations(): void {
  organizations.clear();
}

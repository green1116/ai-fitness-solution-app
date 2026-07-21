/**
 * E11-P3 — Organization Isolation Model
 */

import { ORGANIZATION_STATUSES } from "./tenant.constants";
import type {
  Organization,
  OrganizationStatus,
  RegisterOrganizationInput,
} from "./tenant.types";

const organizations = new Map<string, Organization>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneOrg(org: Organization): Organization {
  return { ...org, metadata: { ...org.metadata } };
}

export function registerOrganization(
  input: RegisterOrganizationInput,
): Organization {
  const id = input.id.trim();
  const name = input.name.trim();
  if (!id) throw new Error("organization.id is required");
  if (!name) throw new Error("organization.name is required");
  if (organizations.has(id)) {
    throw new Error(`organization already registered: ${id}`);
  }

  const org: Organization = {
    id,
    name,
    status: "ACTIVE",
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  organizations.set(id, org);
  return cloneOrg(org);
}

export function getOrganization(id: string): Organization | undefined {
  const org = organizations.get(id.trim());
  return org ? cloneOrg(org) : undefined;
}

export function listOrganizations(filter?: {
  status?: OrganizationStatus;
}): Organization[] {
  let result = [...organizations.values()];
  if (filter?.status) {
    if (!(ORGANIZATION_STATUSES as readonly string[]).includes(filter.status)) {
      throw new Error(`invalid organization status: ${filter.status}`);
    }
    result = result.filter((o) => o.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOrg);
}

export function setOrganizationStatus(
  id: string,
  status: OrganizationStatus,
): Organization {
  const org = organizations.get(id.trim());
  if (!org) throw new Error(`organization not found: ${id}`);
  if (!(ORGANIZATION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid organization status: ${status}`);
  }
  org.status = status;
  organizations.set(org.id, org);
  return cloneOrg(org);
}

export function removeOrganization(id: string): boolean {
  return organizations.delete(id.trim());
}

export function clearOrganizations(): void {
  organizations.clear();
}

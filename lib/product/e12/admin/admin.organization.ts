/**
 * E12-P3 — Organization Admin
 */

import { getProductIdentity } from "../identity/product.identity";
import { ORGANIZATION_STATUSES } from "./admin.constants";
import type {
  AssignOrganizationAdminInput,
  Organization,
  OrganizationAdmin,
  OrganizationStatus,
  RegisterOrganizationInput,
} from "./admin.types";

const organizations = new Map<string, Organization>();
const orgAdmins = new Map<string, OrganizationAdmin>();

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

function cloneAdmin(admin: OrganizationAdmin): OrganizationAdmin {
  return { ...admin, metadata: { ...admin.metadata } };
}

export function registerOrganization(
  input: RegisterOrganizationInput,
): Organization {
  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();
  const productId = input.productId.trim();
  if (!name) throw new Error("organization.name is required");
  if (!slug) throw new Error("organization.slug is required");
  if (!productId) throw new Error("organization.productId is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const status = input.status ?? "ACTIVE";
  if (!(ORGANIZATION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid organization status: ${status}`);
  }

  const id = input.id?.trim() || createId("org");
  if (organizations.has(id)) {
    throw new Error(`organization already exists: ${id}`);
  }
  for (const org of organizations.values()) {
    if (org.slug === slug) {
      throw new Error(`organization slug already taken: ${slug}`);
    }
  }

  const organization: Organization = {
    id,
    name,
    slug,
    status,
    productId,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  organizations.set(id, organization);
  return cloneOrg(organization);
}

export function getOrganization(id: string): Organization | undefined {
  const org = organizations.get(id.trim());
  return org ? cloneOrg(org) : undefined;
}

export function getOrganizationBySlug(
  slug: string,
): Organization | undefined {
  const key = slug.trim().toLowerCase();
  for (const org of organizations.values()) {
    if (org.slug === key) return cloneOrg(org);
  }
  return undefined;
}

export function listOrganizations(filter?: {
  productId?: string;
  status?: OrganizationStatus;
}): Organization[] {
  let result = [...organizations.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((o) => o.productId === pid);
  }
  if (filter?.status) result = result.filter((o) => o.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOrg);
}

export function assignOrganizationAdmin(
  input: AssignOrganizationAdminInput,
): OrganizationAdmin {
  const organizationId = input.organizationId.trim();
  const userId = input.userId.trim();
  const email = input.email.trim();
  if (!getOrganization(organizationId)) {
    throw new Error(`organization not found: ${organizationId}`);
  }
  if (!userId) throw new Error("admin.userId is required");
  if (!email) throw new Error("admin.email is required");

  const status = input.status ?? "ACTIVE";
  const id = input.id?.trim() || createId("orgadmin");
  if (orgAdmins.has(id)) throw new Error(`org admin already exists: ${id}`);

  const admin: OrganizationAdmin = {
    id,
    organizationId,
    userId,
    email,
    status,
    metadata: { ...(input.metadata ?? {}) },
    assignedAt: nowIso(),
  };
  orgAdmins.set(id, admin);
  return cloneAdmin(admin);
}

export function getOrganizationAdmin(
  id: string,
): OrganizationAdmin | undefined {
  const admin = orgAdmins.get(id.trim());
  return admin ? cloneAdmin(admin) : undefined;
}

export function listOrganizationAdmins(filter?: {
  organizationId?: string;
  userId?: string;
}): OrganizationAdmin[] {
  let result = [...orgAdmins.values()];
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((a) => a.organizationId === oid);
  }
  if (filter?.userId) {
    const uid = filter.userId.trim();
    result = result.filter((a) => a.userId === uid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAdmin);
}

export function clearOrganizations(): void {
  organizations.clear();
  orgAdmins.clear();
}

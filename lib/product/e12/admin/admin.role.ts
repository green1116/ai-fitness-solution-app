/**
 * E12-P3 — User Role Model
 */

import { ADMIN_PERMISSIONS, ADMIN_ROLE_KINDS } from "./admin.constants";
import { getOrganization } from "./admin.organization";
import type {
  AdminPermission,
  AdminRoleKind,
  AdminUserRole,
  AssignAdminRoleInput,
} from "./admin.types";

const roles = new Map<string, AdminUserRole>();

const ROLE_PERMISSIONS: Record<AdminRoleKind, AdminPermission[]> = {
  SUPER_ADMIN: [...ADMIN_PERMISSIONS],
  ORG_ADMIN: [
    "organization:read",
    "organization:write",
    "tenant:read",
    "tenant:write",
    "product:config:read",
    "product:config:write",
    "entitlement:read",
    "audit:read",
  ],
  TENANT_ADMIN: [
    "tenant:read",
    "tenant:write",
    "tenant:suspend",
    "entitlement:read",
    "capability:evaluate",
    "product:config:read",
  ],
  AUDITOR: [
    "organization:read",
    "tenant:read",
    "entitlement:read",
    "audit:read",
    "capability:evaluate",
  ],
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRole(role: AdminUserRole): AdminUserRole {
  return {
    ...role,
    permissions: [...role.permissions],
    metadata: { ...role.metadata },
  };
}

export function getRolePermissions(role: AdminRoleKind): AdminPermission[] {
  return [...ROLE_PERMISSIONS[role]];
}

export function assignAdminRole(input: AssignAdminRoleInput): AdminUserRole {
  const userId = input.userId.trim();
  const organizationId = input.organizationId.trim();
  const role = input.role;
  if (!userId) throw new Error("role.userId is required");
  if (!organizationId) throw new Error("role.organizationId is required");
  if (!getOrganization(organizationId)) {
    throw new Error(`organization not found: ${organizationId}`);
  }
  if (!(ADMIN_ROLE_KINDS as readonly string[]).includes(role)) {
    throw new Error(`invalid admin role: ${role}`);
  }

  const id = input.id?.trim() || createId("role");
  if (roles.has(id)) throw new Error(`role already exists: ${id}`);

  const userRole: AdminUserRole = {
    id,
    userId,
    organizationId,
    role,
    productTenantId: input.productTenantId?.trim() || undefined,
    permissions: getRolePermissions(role),
    metadata: { ...(input.metadata ?? {}) },
    assignedAt: nowIso(),
  };
  roles.set(id, userRole);
  return cloneRole(userRole);
}

export function getAdminRole(id: string): AdminUserRole | undefined {
  const role = roles.get(id.trim());
  return role ? cloneRole(role) : undefined;
}

export function listAdminRoles(filter?: {
  userId?: string;
  organizationId?: string;
  role?: AdminRoleKind;
  productTenantId?: string;
}): AdminUserRole[] {
  let result = [...roles.values()];
  if (filter?.userId) {
    const uid = filter.userId.trim();
    result = result.filter((r) => r.userId === uid);
  }
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((r) => r.organizationId === oid);
  }
  if (filter?.role) result = result.filter((r) => r.role === filter.role);
  if (filter?.productTenantId) {
    const tid = filter.productTenantId.trim();
    result = result.filter(
      (r) => !r.productTenantId || r.productTenantId === tid,
    );
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRole);
}

export function clearAdminRoles(): void {
  roles.clear();
}

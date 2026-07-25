/**
 * Product P2 — Permission registry
 */

import { PERMISSION_SCOPES } from "../organization/organization.constants";
import { getOrganization } from "../organization/organization.registry";
import { getRole } from "../role/role.registry";
import type {
  GrantPermissionInput,
  Permission,
  PermissionScope,
  RegisterPermissionInput,
  RolePermissionGrant,
} from "./permission.types";

const permissions = new Map<string, Permission>();
const grants = new Map<string, RolePermissionGrant>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePermission(permission: Permission): Permission {
  return { ...permission, metadata: { ...permission.metadata } };
}

function cloneGrant(grant: RolePermissionGrant): RolePermissionGrant {
  return { ...grant };
}

export function registerPermission(
  input: RegisterPermissionInput,
): Permission {
  const organizationId = input.organizationId.trim();
  const key = input.key.trim().toLowerCase();
  if (!organizationId) throw new Error("permission.organizationId is required");
  if (!key) throw new Error("permission.key is required");
  if (!(PERMISSION_SCOPES as readonly string[]).includes(input.scope)) {
    throw new Error(`invalid permission scope: ${input.scope}`);
  }
  if (!getOrganization(organizationId)) {
    throw new Error(`organization not found: ${organizationId}`);
  }

  const id = input.id?.trim() || createId("p2perm");
  if (permissions.has(id)) {
    throw new Error(`permission already exists: ${id}`);
  }

  const description =
    (input.description ?? "").trim() || `${input.scope}:${key}`;
  const permission: Permission = {
    id,
    organizationId,
    key,
    scope: input.scope,
    description,
    detail: `scope=${input.scope} key=${key}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  permissions.set(id, permission);
  return clonePermission(permission);
}

export function grantPermission(
  input: GrantPermissionInput,
): RolePermissionGrant {
  const roleId = input.roleId.trim();
  const permissionId = input.permissionId.trim();
  if (!roleId) throw new Error("grant.roleId is required");
  if (!permissionId) throw new Error("grant.permissionId is required");

  const role = getRole(roleId);
  if (!role) throw new Error(`role not found: ${roleId}`);
  const permission = permissions.get(permissionId);
  if (!permission) throw new Error(`permission not found: ${permissionId}`);
  if (permission.organizationId !== role.organizationId) {
    throw new Error("permission and role organization mismatch");
  }

  const id = input.id?.trim() || createId("p2pgr");
  if (grants.has(id)) {
    throw new Error(`permission grant already exists: ${id}`);
  }

  const grant: RolePermissionGrant = {
    id,
    roleId,
    permissionId,
    detail: `role=${roleId} permission=${permission.key}`,
    grantedAt: nowIso(),
  };
  grants.set(id, grant);
  return cloneGrant(grant);
}

export function getPermission(id: string): Permission | undefined {
  const permission = permissions.get(id.trim());
  return permission ? clonePermission(permission) : undefined;
}

export function listPermissions(filter?: {
  organizationId?: string;
  scope?: PermissionScope;
}): Permission[] {
  let result = [...permissions.values()];
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((p) => p.organizationId === oid);
  }
  if (filter?.scope) result = result.filter((p) => p.scope === filter.scope);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePermission);
}

export function listPermissionGrants(filter?: {
  roleId?: string;
}): RolePermissionGrant[] {
  let result = [...grants.values()];
  if (filter?.roleId) {
    const rid = filter.roleId.trim();
    result = result.filter((g) => g.roleId === rid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneGrant);
}

export function clearPermissions(): void {
  grants.clear();
  permissions.clear();
}

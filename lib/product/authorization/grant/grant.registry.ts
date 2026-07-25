/**
 * Product Authorization — Grant registry
 */

import { getPermission } from "../permission/permission.registry";
import { getRole } from "../role/role.registry";
import type { GrantPermissionInput, PermissionGrant } from "./grant.types";

const grants = new Map<string, PermissionGrant>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneGrant(grant: PermissionGrant): PermissionGrant {
  return { ...grant, metadata: { ...grant.metadata } };
}

export function grantPermission(
  input: GrantPermissionInput,
): PermissionGrant {
  const roleId = input.roleId.trim();
  const permissionId = input.permissionId.trim();
  if (!roleId) throw new Error("grant.roleId is required");
  if (!permissionId) throw new Error("grant.permissionId is required");
  if (!getRole(roleId)) throw new Error(`role not found: ${roleId}`);
  if (!getPermission(permissionId)) {
    throw new Error(`permission not found: ${permissionId}`);
  }

  const duplicate = [...grants.values()].find(
    (g) => g.roleId === roleId && g.permissionId === permissionId,
  );
  if (duplicate) {
    throw new Error(
      `grant already exists: role=${roleId} permission=${permissionId}`,
    );
  }

  const id = input.id?.trim() || createId("azgrant");
  if (grants.has(id)) throw new Error(`grant already exists: ${id}`);

  const grant: PermissionGrant = {
    id,
    roleId,
    permissionId,
    detail: `role=${roleId} permission=${permissionId}`,
    metadata: { ...(input.metadata ?? {}) },
    grantedAt: nowIso(),
  };
  grants.set(id, grant);
  return cloneGrant(grant);
}

export function getGrant(id: string): PermissionGrant | undefined {
  const grant = grants.get(id.trim());
  return grant ? cloneGrant(grant) : undefined;
}

export function listGrants(filter?: {
  roleId?: string;
  permissionId?: string;
}): PermissionGrant[] {
  let result = [...grants.values()];
  if (filter?.roleId) {
    const roleId = filter.roleId.trim();
    result = result.filter((g) => g.roleId === roleId);
  }
  if (filter?.permissionId) {
    const permissionId = filter.permissionId.trim();
    result = result.filter((g) => g.permissionId === permissionId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneGrant);
}

export function clearGrants(): void {
  grants.clear();
}

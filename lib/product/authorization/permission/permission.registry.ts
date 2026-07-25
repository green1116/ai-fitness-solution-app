/**
 * Product Authorization — Permission registry
 */

import { PERMISSION_EFFECTS } from "../rbac/rbac.constants";
import type {
  AuthorizationPermission,
  PermissionEffect,
  RegisterPermissionInput,
} from "./permission.types";

const permissions = new Map<string, AuthorizationPermission>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePermission(
  permission: AuthorizationPermission,
): AuthorizationPermission {
  return { ...permission, metadata: { ...permission.metadata } };
}

export function registerPermission(
  input: RegisterPermissionInput,
): AuthorizationPermission {
  const key = input.key.trim();
  const resource = input.resource.trim();
  const action = input.action.trim();
  if (!key) throw new Error("permission.key is required");
  if (!resource) throw new Error("permission.resource is required");
  if (!action) throw new Error("permission.action is required");

  const effect = input.effect ?? PERMISSION_EFFECTS[0];
  if (!(PERMISSION_EFFECTS as readonly string[]).includes(effect)) {
    throw new Error(`invalid permission effect: ${effect}`);
  }

  const id = input.id?.trim() || createId("azperm");
  if (permissions.has(id)) {
    throw new Error(`permission already exists: ${id}`);
  }

  const permission: AuthorizationPermission = {
    id,
    key,
    resource,
    action,
    effect,
    detail: `key=${key} effect=${effect}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  permissions.set(id, permission);
  return clonePermission(permission);
}

export function getPermission(
  id: string,
): AuthorizationPermission | undefined {
  const permission = permissions.get(id.trim());
  return permission ? clonePermission(permission) : undefined;
}

export function listPermissions(filter?: {
  resource?: string;
  effect?: PermissionEffect;
}): AuthorizationPermission[] {
  let result = [...permissions.values()];
  if (filter?.resource) {
    const resource = filter.resource.trim();
    result = result.filter((p) => p.resource === resource);
  }
  if (filter?.effect) {
    result = result.filter((p) => p.effect === filter.effect);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePermission);
}

export function clearPermissions(): void {
  permissions.clear();
}

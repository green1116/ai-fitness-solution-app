/**
 * Product Authorization — Role registry
 */

import { ROLE_KINDS } from "../rbac/rbac.constants";
import type {
  AuthorizationRole,
  RegisterRoleInput,
  RoleKind,
} from "./role.types";

const roles = new Map<string, AuthorizationRole>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRole(role: AuthorizationRole): AuthorizationRole {
  return { ...role, metadata: { ...role.metadata } };
}

export function registerRole(input: RegisterRoleInput): AuthorizationRole {
  const name = input.name.trim();
  if (!name) throw new Error("role.name is required");
  if (!(ROLE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid role kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("azrole");
  if (roles.has(id)) throw new Error(`role already exists: ${id}`);

  const role: AuthorizationRole = {
    id,
    kind: input.kind,
    name,
    detail: `kind=${input.kind} name=${name}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  roles.set(id, role);
  return cloneRole(role);
}

export function getRole(id: string): AuthorizationRole | undefined {
  const role = roles.get(id.trim());
  return role ? cloneRole(role) : undefined;
}

export function listRoles(filter?: {
  kind?: RoleKind;
}): AuthorizationRole[] {
  let result = [...roles.values()];
  if (filter?.kind) result = result.filter((r) => r.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRole);
}

export function clearRoles(): void {
  roles.clear();
}

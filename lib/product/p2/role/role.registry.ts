/**
 * Product P2 — Role registry
 */

import { getMember } from "../member/member.registry";
import { ROLE_KINDS } from "../organization/organization.constants";
import { getOrganization } from "../organization/organization.registry";
import type {
  AssignRoleInput,
  MemberRoleAssignment,
  OrganizationRole,
  RegisterRoleInput,
  RoleKind,
} from "./role.types";

const roles = new Map<string, OrganizationRole>();
const assignments = new Map<string, MemberRoleAssignment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRole(role: OrganizationRole): OrganizationRole {
  return { ...role, metadata: { ...role.metadata } };
}

function cloneAssignment(
  assignment: MemberRoleAssignment,
): MemberRoleAssignment {
  return { ...assignment };
}

export function registerRole(input: RegisterRoleInput): OrganizationRole {
  const organizationId = input.organizationId.trim();
  if (!organizationId) throw new Error("role.organizationId is required");
  if (!(ROLE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid role kind: ${input.kind}`);
  }
  if (!getOrganization(organizationId)) {
    throw new Error(`organization not found: ${organizationId}`);
  }

  const id = input.id?.trim() || createId("p2role");
  if (roles.has(id)) {
    throw new Error(`role already exists: ${id}`);
  }

  const name = (input.name ?? input.kind).trim() || input.kind;
  const role: OrganizationRole = {
    id,
    organizationId,
    kind: input.kind,
    name,
    detail: `kind=${input.kind} name=${name}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  roles.set(id, role);
  return cloneRole(role);
}

export function assignRole(input: AssignRoleInput): MemberRoleAssignment {
  const memberId = input.memberId.trim();
  const roleId = input.roleId.trim();
  if (!memberId) throw new Error("assignment.memberId is required");
  if (!roleId) throw new Error("assignment.roleId is required");

  const member = getMember(memberId);
  if (!member) throw new Error(`member not found: ${memberId}`);
  const role = roles.get(roleId);
  if (!role) throw new Error(`role not found: ${roleId}`);
  if (role.organizationId !== member.organizationId) {
    throw new Error("role and member organization mismatch");
  }

  const id = input.id?.trim() || createId("p2rasn");
  if (assignments.has(id)) {
    throw new Error(`role assignment already exists: ${id}`);
  }

  const assignment: MemberRoleAssignment = {
    id,
    memberId,
    roleId,
    detail: `member=${memberId} role=${role.kind}`,
    assignedAt: nowIso(),
  };
  assignments.set(id, assignment);
  return cloneAssignment(assignment);
}

export function getRole(id: string): OrganizationRole | undefined {
  const role = roles.get(id.trim());
  return role ? cloneRole(role) : undefined;
}

export function listRoles(filter?: {
  organizationId?: string;
  kind?: RoleKind;
}): OrganizationRole[] {
  let result = [...roles.values()];
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((r) => r.organizationId === oid);
  }
  if (filter?.kind) result = result.filter((r) => r.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRole);
}

export function listRoleAssignments(filter?: {
  memberId?: string;
  roleId?: string;
}): MemberRoleAssignment[] {
  let result = [...assignments.values()];
  if (filter?.memberId) {
    const mid = filter.memberId.trim();
    result = result.filter((a) => a.memberId === mid);
  }
  if (filter?.roleId) {
    const rid = filter.roleId.trim();
    result = result.filter((a) => a.roleId === rid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAssignment);
}

export function clearRoles(): void {
  assignments.clear();
  roles.clear();
}

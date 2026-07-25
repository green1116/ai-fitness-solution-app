/**
 * Product Organization — Role registry
 */

import { ORG_ROLES } from "../management/management.constants";
import { getMembership } from "../membership/membership.registry";
import { getOrganization } from "../unit/unit.registry";
import type {
  AssignOrgRoleInput,
  OrganizationRoleAssignment,
  OrgRoleCode,
} from "./role.types";

const roles = new Map<string, OrganizationRoleAssignment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRole(
  assignment: OrganizationRoleAssignment,
): OrganizationRoleAssignment {
  return { ...assignment, metadata: { ...assignment.metadata } };
}

export function assignOrgRole(
  input: AssignOrgRoleInput,
): OrganizationRoleAssignment {
  const organizationId = input.organizationId.trim();
  const membershipId = input.membershipId.trim();
  if (!organizationId) {
    throw new Error("role.organizationId is required");
  }
  if (!membershipId) throw new Error("role.membershipId is required");
  if (!(ORG_ROLES as readonly string[]).includes(input.role)) {
    throw new Error(`invalid organization role: ${input.role}`);
  }
  if (!getOrganization(organizationId)) {
    throw new Error(`organization not found: ${organizationId}`);
  }

  const membership = getMembership(membershipId);
  if (!membership) {
    throw new Error(`membership not found: ${membershipId}`);
  }
  if (membership.organizationId !== organizationId) {
    throw new Error(
      `membership org mismatch: ${membershipId}/${organizationId}`,
    );
  }

  const duplicate = [...roles.values()].find(
    (r) =>
      r.organizationId === organizationId &&
      r.membershipId === membershipId &&
      r.role === input.role,
  );
  if (duplicate) {
    throw new Error(
      `role already assigned: ${organizationId}/${membershipId}/${input.role}`,
    );
  }

  const id = input.id?.trim() || createId("orgrole");
  if (roles.has(id)) throw new Error(`role assignment already exists: ${id}`);

  const assignment: OrganizationRoleAssignment = {
    id,
    organizationId,
    membershipId,
    role: input.role,
    detail: `role=${input.role}`,
    metadata: { ...(input.metadata ?? {}) },
    assignedAt: nowIso(),
  };
  roles.set(id, assignment);
  return cloneRole(assignment);
}

export function getOrgRole(
  id: string,
): OrganizationRoleAssignment | undefined {
  const assignment = roles.get(id.trim());
  return assignment ? cloneRole(assignment) : undefined;
}

export function listOrgRoles(filter?: {
  organizationId?: string;
  role?: OrgRoleCode;
}): OrganizationRoleAssignment[] {
  let result = [...roles.values()];
  if (filter?.organizationId) {
    const organizationId = filter.organizationId.trim();
    result = result.filter((r) => r.organizationId === organizationId);
  }
  if (filter?.role) result = result.filter((r) => r.role === filter.role);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRole);
}

export function clearOrgRoles(): void {
  roles.clear();
}

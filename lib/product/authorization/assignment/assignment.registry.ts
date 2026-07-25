/**
 * Product Authorization — Assignment registry
 */

import { ASSIGNMENT_STATUSES } from "../rbac/rbac.constants";
import { getRole } from "../role/role.registry";
import type {
  AssignRoleInput,
  AssignmentStatus,
  RoleAssignment,
  UpdateAssignmentStatusInput,
} from "./assignment.types";

const assignments = new Map<string, RoleAssignment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAssignment(assignment: RoleAssignment): RoleAssignment {
  return { ...assignment, metadata: { ...assignment.metadata } };
}

export function assignRole(input: AssignRoleInput): RoleAssignment {
  const principalId = input.principalId.trim();
  const roleId = input.roleId.trim();
  if (!principalId) throw new Error("assignment.principalId is required");
  if (!roleId) throw new Error("assignment.roleId is required");
  if (!getRole(roleId)) throw new Error(`role not found: ${roleId}`);

  const duplicate = [...assignments.values()].find(
    (a) =>
      a.principalId === principalId &&
      a.roleId === roleId &&
      a.status === "ACTIVE",
  );
  if (duplicate) {
    throw new Error(
      `active assignment already exists: principal=${principalId} role=${roleId}`,
    );
  }

  const id = input.id?.trim() || createId("azasn");
  if (assignments.has(id)) {
    throw new Error(`assignment already exists: ${id}`);
  }

  const now = nowIso();
  const assignment: RoleAssignment = {
    id,
    principalId,
    roleId,
    status: "ACTIVE",
    detail: `principal=${principalId} role=${roleId}`,
    metadata: { ...(input.metadata ?? {}) },
    assignedAt: now,
    updatedAt: now,
  };
  assignments.set(id, assignment);
  return cloneAssignment(assignment);
}

export function updateAssignmentStatus(
  input: UpdateAssignmentStatusInput,
): RoleAssignment {
  const assignmentId = input.assignmentId.trim();
  if (!assignmentId) throw new Error("assignment.assignmentId is required");
  if (!(ASSIGNMENT_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid assignment status: ${input.status}`);
  }

  const existing = assignments.get(assignmentId);
  if (!existing) throw new Error(`assignment not found: ${assignmentId}`);

  const updated: RoleAssignment = {
    ...existing,
    status: input.status,
    detail: `principal=${existing.principalId} role=${existing.roleId} status=${input.status}`,
    updatedAt: nowIso(),
  };
  assignments.set(assignmentId, updated);
  return cloneAssignment(updated);
}

export function getAssignment(id: string): RoleAssignment | undefined {
  const assignment = assignments.get(id.trim());
  return assignment ? cloneAssignment(assignment) : undefined;
}

export function listAssignments(filter?: {
  principalId?: string;
  roleId?: string;
  status?: AssignmentStatus;
}): RoleAssignment[] {
  let result = [...assignments.values()];
  if (filter?.principalId) {
    const principalId = filter.principalId.trim();
    result = result.filter((a) => a.principalId === principalId);
  }
  if (filter?.roleId) {
    const roleId = filter.roleId.trim();
    result = result.filter((a) => a.roleId === roleId);
  }
  if (filter?.status) {
    result = result.filter((a) => a.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAssignment);
}

export function clearAssignments(): void {
  assignments.clear();
}

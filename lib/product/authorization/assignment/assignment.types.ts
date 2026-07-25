/**
 * Product Authorization — Assignment types (principal → role)
 */

import type { ASSIGNMENT_STATUSES } from "../rbac/rbac.constants";

export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];
export type AssignmentMetadata = Record<string, unknown>;

export type RoleAssignment = {
  id: string;
  principalId: string;
  roleId: string;
  status: AssignmentStatus;
  detail: string;
  metadata: AssignmentMetadata;
  assignedAt: string;
  updatedAt: string;
};

export type AssignRoleInput = {
  id?: string;
  principalId: string;
  roleId: string;
  metadata?: AssignmentMetadata;
};

export type UpdateAssignmentStatusInput = {
  assignmentId: string;
  status: AssignmentStatus;
};

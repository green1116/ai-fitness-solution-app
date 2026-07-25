/**
 * Product P2 — Role types
 */

import type { ROLE_KINDS } from "../organization/organization.constants";

export type RoleKind = (typeof ROLE_KINDS)[number];
export type RoleMetadata = Record<string, unknown>;

export type OrganizationRole = {
  id: string;
  organizationId: string;
  kind: RoleKind;
  name: string;
  detail: string;
  metadata: RoleMetadata;
  createdAt: string;
};

export type RegisterRoleInput = {
  id?: string;
  organizationId: string;
  kind: RoleKind;
  name?: string;
  metadata?: RoleMetadata;
};

export type MemberRoleAssignment = {
  id: string;
  memberId: string;
  roleId: string;
  detail: string;
  assignedAt: string;
};

export type AssignRoleInput = {
  id?: string;
  memberId: string;
  roleId: string;
};

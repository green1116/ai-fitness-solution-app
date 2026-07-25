/**
 * Product Organization — Role types
 */

import type { ORG_ROLES } from "../management/management.constants";

export type OrgRoleCode = (typeof ORG_ROLES)[number];
export type RoleMetadata = Record<string, unknown>;

export type OrganizationRoleAssignment = {
  id: string;
  organizationId: string;
  membershipId: string;
  role: OrgRoleCode;
  detail: string;
  metadata: RoleMetadata;
  assignedAt: string;
};

export type AssignOrgRoleInput = {
  id?: string;
  organizationId: string;
  membershipId: string;
  role: OrgRoleCode;
  metadata?: RoleMetadata;
};

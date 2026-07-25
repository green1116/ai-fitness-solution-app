/**
 * Product P2 — Permission types
 */

import type { PERMISSION_SCOPES } from "../organization/organization.constants";

export type PermissionScope = (typeof PERMISSION_SCOPES)[number];
export type PermissionMetadata = Record<string, unknown>;

export type Permission = {
  id: string;
  organizationId: string;
  key: string;
  scope: PermissionScope;
  description: string;
  detail: string;
  metadata: PermissionMetadata;
  createdAt: string;
};

export type RegisterPermissionInput = {
  id?: string;
  organizationId: string;
  key: string;
  scope: PermissionScope;
  description?: string;
  metadata?: PermissionMetadata;
};

export type RolePermissionGrant = {
  id: string;
  roleId: string;
  permissionId: string;
  detail: string;
  grantedAt: string;
};

export type GrantPermissionInput = {
  id?: string;
  roleId: string;
  permissionId: string;
};

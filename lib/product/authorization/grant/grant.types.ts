/**
 * Product Authorization — Grant types (role → permission)
 */

export type GrantMetadata = Record<string, unknown>;

export type PermissionGrant = {
  id: string;
  roleId: string;
  permissionId: string;
  detail: string;
  metadata: GrantMetadata;
  grantedAt: string;
};

export type GrantPermissionInput = {
  id?: string;
  roleId: string;
  permissionId: string;
  metadata?: GrantMetadata;
};

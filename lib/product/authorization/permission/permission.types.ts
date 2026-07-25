/**
 * Product Authorization — Permission types
 */

import type { PERMISSION_EFFECTS } from "../rbac/rbac.constants";

export type PermissionEffect = (typeof PERMISSION_EFFECTS)[number];
export type PermissionMetadata = Record<string, unknown>;

export type AuthorizationPermission = {
  id: string;
  key: string;
  resource: string;
  action: string;
  effect: PermissionEffect;
  detail: string;
  metadata: PermissionMetadata;
  createdAt: string;
};

export type RegisterPermissionInput = {
  id?: string;
  key: string;
  resource: string;
  action: string;
  effect?: PermissionEffect;
  metadata?: PermissionMetadata;
};

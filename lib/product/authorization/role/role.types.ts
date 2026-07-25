/**
 * Product Authorization — Role types
 */

import type { ROLE_KINDS } from "../rbac/rbac.constants";

export type RoleKind = (typeof ROLE_KINDS)[number];
export type RoleMetadata = Record<string, unknown>;

export type AuthorizationRole = {
  id: string;
  kind: RoleKind;
  name: string;
  detail: string;
  metadata: RoleMetadata;
  createdAt: string;
};

export type RegisterRoleInput = {
  id?: string;
  kind: RoleKind;
  name: string;
  metadata?: RoleMetadata;
};

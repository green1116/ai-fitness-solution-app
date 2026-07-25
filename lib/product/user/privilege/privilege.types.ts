/**
 * Product User — Privilege types
 */

import type { USER_PRIVILEGE_SCOPES } from "../administration/administration.constants";

export type UserPrivilegeScope = (typeof USER_PRIVILEGE_SCOPES)[number];
export type PrivilegeMetadata = Record<string, unknown>;

export type UserPrivilege = {
  id: string;
  accountId: string;
  code: string;
  scope: UserPrivilegeScope;
  detail: string;
  metadata: PrivilegeMetadata;
  grantedAt: string;
};

export type GrantUserPrivilegeInput = {
  id?: string;
  accountId: string;
  code: string;
  scope: UserPrivilegeScope;
  metadata?: PrivilegeMetadata;
};

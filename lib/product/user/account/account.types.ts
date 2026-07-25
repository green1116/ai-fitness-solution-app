/**
 * Product User — Account types
 */

import type {
  USER_ACCOUNT_KINDS,
  USER_ACCOUNT_STATUSES,
} from "../administration/administration.constants";

export type UserAccountKind = (typeof USER_ACCOUNT_KINDS)[number];
export type UserAccountStatus = (typeof USER_ACCOUNT_STATUSES)[number];
export type AccountMetadata = Record<string, unknown>;

export type UserAccount = {
  id: string;
  email: string;
  displayName: string;
  kind: UserAccountKind;
  tenantRecordId: string;
  status: UserAccountStatus;
  detail: string;
  metadata: AccountMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterUserAccountInput = {
  id?: string;
  email: string;
  displayName: string;
  kind: UserAccountKind;
  tenantRecordId: string;
  metadata?: AccountMetadata;
};

export type UpdateUserAccountStatusInput = {
  accountId: string;
  status: UserAccountStatus;
};

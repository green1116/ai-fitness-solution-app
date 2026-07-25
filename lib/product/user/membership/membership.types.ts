/**
 * Product User — Membership types
 */

import type {
  USER_MEMBERSHIP_ROLES,
  USER_MEMBERSHIP_STATUSES,
} from "../administration/administration.constants";

export type UserMembershipRole = (typeof USER_MEMBERSHIP_ROLES)[number];
export type UserMembershipStatus = (typeof USER_MEMBERSHIP_STATUSES)[number];
export type MembershipMetadata = Record<string, unknown>;

export type UserMembership = {
  id: string;
  accountId: string;
  tenantRecordId: string;
  role: UserMembershipRole;
  status: UserMembershipStatus;
  detail: string;
  metadata: MembershipMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindUserMembershipInput = {
  id?: string;
  accountId: string;
  tenantRecordId: string;
  role: UserMembershipRole;
  metadata?: MembershipMetadata;
};

export type UpdateUserMembershipStatusInput = {
  membershipId: string;
  status: UserMembershipStatus;
};

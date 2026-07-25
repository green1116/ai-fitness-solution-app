/**
 * Product Organization — Membership types
 */

import type { MEMBERSHIP_STATUSES } from "../management/management.constants";

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];
export type MembershipMetadata = Record<string, unknown>;

export type OrganizationMembership = {
  id: string;
  organizationId: string;
  subjectId: string;
  status: MembershipStatus;
  detail: string;
  metadata: MembershipMetadata;
  joinedAt: string;
};

export type AddMembershipInput = {
  id?: string;
  organizationId: string;
  subjectId: string;
  status?: MembershipStatus;
  metadata?: MembershipMetadata;
};

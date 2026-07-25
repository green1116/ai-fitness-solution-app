/**
 * Product P2 — Member types
 */

import type { MEMBER_STATUSES } from "../organization/organization.constants";

export type MemberStatus = (typeof MEMBER_STATUSES)[number];
export type MemberMetadata = Record<string, unknown>;

export type OrganizationMember = {
  id: string;
  organizationId: string;
  departmentId?: string;
  email: string;
  displayName: string;
  status: MemberStatus;
  detail: string;
  metadata: MemberMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterMemberInput = {
  id?: string;
  organizationId: string;
  departmentId?: string;
  email: string;
  displayName: string;
  metadata?: MemberMetadata;
};

export type UpdateMemberStatusInput = {
  memberId: string;
  status: MemberStatus;
};

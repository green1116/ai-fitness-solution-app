/**
 * Product P2 — Invitation types
 */

import type {
  INVITATION_STATUSES,
  ROLE_KINDS,
} from "../organization/organization.constants";

export type InvitationStatus = (typeof INVITATION_STATUSES)[number];
export type InvitationRoleKind = (typeof ROLE_KINDS)[number];
export type InvitationMetadata = Record<string, unknown>;

export type OrganizationInvitation = {
  id: string;
  organizationId: string;
  email: string;
  roleKind: InvitationRoleKind;
  status: InvitationStatus;
  invitedBy: string;
  detail: string;
  metadata: InvitationMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateInvitationInput = {
  id?: string;
  organizationId: string;
  email: string;
  roleKind: InvitationRoleKind;
  invitedBy: string;
  metadata?: InvitationMetadata;
};

export type UpdateInvitationStatusInput = {
  invitationId: string;
  status: InvitationStatus;
};

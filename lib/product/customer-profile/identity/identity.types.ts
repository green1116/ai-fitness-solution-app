/**
 * Product Customer Profile — Identity types
 */

import type { PROFILE_STATUSES } from "../profile/profile.constants";

export type ProfileStatus = (typeof PROFILE_STATUSES)[number];
export type IdentityMetadata = Record<string, unknown>;

export type CustomerProfileIdentity = {
  id: string;
  customerId: string;
  displayName: string;
  legalName: string;
  status: ProfileStatus;
  detail: string;
  metadata: IdentityMetadata;
  createdAt: string;
  updatedAt: string;
};

export type UpsertIdentityInput = {
  id?: string;
  customerId: string;
  displayName: string;
  legalName: string;
  metadata?: IdentityMetadata;
};

export type UpdateIdentityStatusInput = {
  identityId: string;
  status: ProfileStatus;
};

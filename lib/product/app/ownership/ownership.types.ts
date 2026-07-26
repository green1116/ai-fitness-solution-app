/**
 * Product App — ownership types (soft partnerKeyRef only)
 */

import type { APP_OWNERSHIP_STATUSES } from "../management/management.constants";

export type AppOwnershipStatus = (typeof APP_OWNERSHIP_STATUSES)[number];
export type OwnershipMetadata = Record<string, unknown>;

export type AppOwnership = {
  id: string;
  appId: string;
  ownershipKey: string;
  partnerKeyRef: string;
  status: AppOwnershipStatus;
  detail: string;
  metadata: OwnershipMetadata;
  createdAt: string;
  updatedAt: string;
};

export type AssignAppOwnershipInput = {
  id?: string;
  appId: string;
  ownershipKey: string;
  partnerKeyRef: string;
  metadata?: OwnershipMetadata;
};

export type UpdateAppOwnershipStatusInput = {
  ownershipId: string;
  status: AppOwnershipStatus;
};

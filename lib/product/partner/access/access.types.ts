/**
 * Product Partner — access types (soft connector refs only)
 */

import type { PARTNER_ACCESS_STATUSES } from "../management/management.constants";

export type PartnerAccessStatus = (typeof PARTNER_ACCESS_STATUSES)[number];
export type AccessMetadata = Record<string, unknown>;

export type PartnerAccess = {
  id: string;
  partnerId: string;
  agreementId: string;
  accessKey: string;
  connectorKeyRef: string;
  status: PartnerAccessStatus;
  detail: string;
  metadata: AccessMetadata;
  createdAt: string;
  updatedAt: string;
};

export type GrantPartnerAccessInput = {
  id?: string;
  partnerId: string;
  agreementId: string;
  accessKey: string;
  connectorKeyRef: string;
  metadata?: AccessMetadata;
};

export type UpdatePartnerAccessStatusInput = {
  accessId: string;
  status: PartnerAccessStatus;
};

/**
 * Product Partner — registry types
 */

import type {
  PARTNER_KINDS,
  PARTNER_STATUSES,
} from "../management/management.constants";

export type PartnerKind = (typeof PARTNER_KINDS)[number];
export type PartnerStatus = (typeof PARTNER_STATUSES)[number];
export type PartnerMetadata = Record<string, unknown>;

export type ProductPartner = {
  id: string;
  partnerKey: string;
  name: string;
  kind: PartnerKind;
  status: PartnerStatus;
  detail: string;
  metadata: PartnerMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterPartnerInput = {
  id?: string;
  partnerKey: string;
  name: string;
  kind: PartnerKind;
  metadata?: PartnerMetadata;
};

export type UpdatePartnerStatusInput = {
  partnerId: string;
  status: PartnerStatus;
};

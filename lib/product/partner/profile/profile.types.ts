/**
 * Product Partner — profile types
 */

export type ProfileMetadata = Record<string, unknown>;

export type PartnerProfile = {
  id: string;
  partnerId: string;
  profileKey: string;
  legalName: string;
  contactRef: string;
  detail: string;
  metadata: ProfileMetadata;
  createdAt: string;
};

export type RegisterPartnerProfileInput = {
  id?: string;
  partnerId: string;
  profileKey: string;
  legalName: string;
  contactRef: string;
  metadata?: ProfileMetadata;
};

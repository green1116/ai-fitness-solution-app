/**
 * Product Partner — agreement types
 */

import type { PARTNER_AGREEMENT_STATUSES } from "../management/management.constants";

export type PartnerAgreementStatus =
  (typeof PARTNER_AGREEMENT_STATUSES)[number];
export type AgreementMetadata = Record<string, unknown>;

export type PartnerAgreement = {
  id: string;
  partnerId: string;
  agreementKey: string;
  status: PartnerAgreementStatus;
  termsRef: string;
  detail: string;
  metadata: AgreementMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterPartnerAgreementInput = {
  id?: string;
  partnerId: string;
  agreementKey: string;
  termsRef: string;
  metadata?: AgreementMetadata;
};

export type UpdatePartnerAgreementStatusInput = {
  agreementId: string;
  status: PartnerAgreementStatus;
};

/**
 * Product Partner — readiness / manifest types
 */

import type {
  PARTNER_MANAGER_STATUSES,
  PARTNER_READINESS_VERDICTS,
  PRODUCT_PARTNER_MANAGEMENT_BASE,
  PRODUCT_PARTNER_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PARTNER_MANAGEMENT_ID,
  PRODUCT_PARTNER_MANAGEMENT_VERSION,
} from "./management.constants";

export type PartnerReadinessVerdict =
  (typeof PARTNER_READINESS_VERDICTS)[number];
export type PartnerManagerStatus = (typeof PARTNER_MANAGER_STATUSES)[number];

export type PartnerReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type PartnerReadinessResult = {
  verdict: PartnerReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: PartnerReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type PartnerRegistryManifest = {
  managementId: typeof PRODUCT_PARTNER_MANAGEMENT_ID;
  version: typeof PRODUCT_PARTNER_MANAGEMENT_VERSION;
  freezeVersion: typeof PRODUCT_PARTNER_MANAGEMENT_FREEZE_VERSION;
  base: typeof PRODUCT_PARTNER_MANAGEMENT_BASE;
  partnerCount: number;
  profileCount: number;
  agreementCount: number;
  accessCount: number;
  releaseCount: number;
};

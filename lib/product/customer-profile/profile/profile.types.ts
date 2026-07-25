/**
 * Product Customer Profile — readiness / manifest types
 */

import type {
  CUSTOMER_PROFILE_MANAGER_STATUSES,
  CUSTOMER_PROFILE_READINESS_VERDICTS,
  PRODUCT_CUSTOMER_PROFILE_BASE,
  PRODUCT_CUSTOMER_PROFILE_FREEZE_VERSION,
  PRODUCT_CUSTOMER_PROFILE_ID,
  PRODUCT_CUSTOMER_PROFILE_VERSION,
} from "./profile.constants";

export type CustomerProfileReadinessVerdict =
  (typeof CUSTOMER_PROFILE_READINESS_VERDICTS)[number];
export type CustomerProfileManagerStatus =
  (typeof CUSTOMER_PROFILE_MANAGER_STATUSES)[number];

export type CustomerProfileReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type CustomerProfileReadinessResult = {
  verdict: CustomerProfileReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: CustomerProfileReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type CustomerProfileRegistryManifest = {
  profileId: typeof PRODUCT_CUSTOMER_PROFILE_ID;
  version: typeof PRODUCT_CUSTOMER_PROFILE_VERSION;
  freezeVersion: typeof PRODUCT_CUSTOMER_PROFILE_FREEZE_VERSION;
  base: typeof PRODUCT_CUSTOMER_PROFILE_BASE;
  identityCount: number;
  contactCount: number;
  preferenceCount: number;
  attributeCount: number;
};

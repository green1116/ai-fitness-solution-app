/**
 * Product Customer — readiness / manifest types
 */

import type {
  CUSTOMER_MANAGER_STATUSES,
  CUSTOMER_READINESS_VERDICTS,
  PRODUCT_CUSTOMER_FOUNDATION_BASE,
  PRODUCT_CUSTOMER_FOUNDATION_FREEZE_VERSION,
  PRODUCT_CUSTOMER_FOUNDATION_ID,
  PRODUCT_CUSTOMER_FOUNDATION_VERSION,
} from "./foundation.constants";

export type CustomerReadinessVerdict =
  (typeof CUSTOMER_READINESS_VERDICTS)[number];
export type CustomerManagerStatus =
  (typeof CUSTOMER_MANAGER_STATUSES)[number];

export type CustomerReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type CustomerReadinessResult = {
  verdict: CustomerReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: CustomerReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type CustomerRegistryManifest = {
  foundationId: typeof PRODUCT_CUSTOMER_FOUNDATION_ID;
  version: typeof PRODUCT_CUSTOMER_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_CUSTOMER_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_CUSTOMER_FOUNDATION_BASE;
  profileCount: number;
  relationshipCount: number;
  segmentCount: number;
  lifecycleCount: number;
};

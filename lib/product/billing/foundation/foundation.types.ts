/**
 * Product Billing — readiness / manifest types
 */

import type {
  BILLING_MANAGER_STATUSES,
  BILLING_READINESS_VERDICTS,
  PRODUCT_BILLING_FOUNDATION_BASE,
  PRODUCT_BILLING_FOUNDATION_FREEZE_VERSION,
  PRODUCT_BILLING_FOUNDATION_ID,
  PRODUCT_BILLING_FOUNDATION_VERSION,
} from "./foundation.constants";

export type BillingReadinessVerdict =
  (typeof BILLING_READINESS_VERDICTS)[number];
export type BillingManagerStatus = (typeof BILLING_MANAGER_STATUSES)[number];

export type BillingReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type BillingReadinessResult = {
  verdict: BillingReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: BillingReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type BillingRegistryManifest = {
  foundationId: typeof PRODUCT_BILLING_FOUNDATION_ID;
  version: typeof PRODUCT_BILLING_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_BILLING_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_BILLING_FOUNDATION_BASE;
  accountCount: number;
  planCount: number;
  invoiceCount: number;
  paymentCount: number;
};

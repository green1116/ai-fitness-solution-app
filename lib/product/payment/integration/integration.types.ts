/**
 * Product Payment — readiness / manifest types
 */

import type {
  PAYMENT_MANAGER_STATUSES,
  PAYMENT_READINESS_VERDICTS,
  PRODUCT_PAYMENT_INTEGRATION_BASE,
  PRODUCT_PAYMENT_INTEGRATION_FREEZE_VERSION,
  PRODUCT_PAYMENT_INTEGRATION_ID,
  PRODUCT_PAYMENT_INTEGRATION_VERSION,
} from "./integration.constants";

export type PaymentReadinessVerdict =
  (typeof PAYMENT_READINESS_VERDICTS)[number];
export type PaymentManagerStatus = (typeof PAYMENT_MANAGER_STATUSES)[number];

export type PaymentReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type PaymentReadinessResult = {
  verdict: PaymentReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: PaymentReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type PaymentRegistryManifest = {
  foundationId: typeof PRODUCT_PAYMENT_INTEGRATION_ID;
  version: typeof PRODUCT_PAYMENT_INTEGRATION_VERSION;
  freezeVersion: typeof PRODUCT_PAYMENT_INTEGRATION_FREEZE_VERSION;
  base: typeof PRODUCT_PAYMENT_INTEGRATION_BASE;
  providerCount: number;
  intentCount: number;
  captureCount: number;
  refundCount: number;
};

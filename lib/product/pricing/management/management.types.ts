/**
 * Product Pricing — readiness / manifest types
 */

import type {
  PRICING_MANAGER_STATUSES,
  PRICING_READINESS_VERDICTS,
  PRODUCT_PRICING_MANAGEMENT_BASE,
  PRODUCT_PRICING_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PRICING_MANAGEMENT_ID,
  PRODUCT_PRICING_MANAGEMENT_VERSION,
} from "./management.constants";

export type PricingReadinessVerdict =
  (typeof PRICING_READINESS_VERDICTS)[number];
export type PricingManagerStatus = (typeof PRICING_MANAGER_STATUSES)[number];

export type PricingReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type PricingReadinessResult = {
  verdict: PricingReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: PricingReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type PricingRegistryManifest = {
  foundationId: typeof PRODUCT_PRICING_MANAGEMENT_ID;
  version: typeof PRODUCT_PRICING_MANAGEMENT_VERSION;
  freezeVersion: typeof PRODUCT_PRICING_MANAGEMENT_FREEZE_VERSION;
  base: typeof PRODUCT_PRICING_MANAGEMENT_BASE;
  catalogCount: number;
  priceCount: number;
  discountCount: number;
  quoteCount: number;
};

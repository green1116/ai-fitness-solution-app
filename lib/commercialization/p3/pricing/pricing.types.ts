/**
 * Commercialization P3 — Pricing types
 */

import type {
  BILLING_CYCLES,
  COMMERCIALIZATION_PRICING_CONTRACT_BASE,
  COMMERCIALIZATION_PRICING_CONTRACT_FREEZE_VERSION,
  COMMERCIALIZATION_PRICING_CONTRACT_ID,
  COMMERCIALIZATION_PRICING_CONTRACT_VERSION,
  PRICE_BOOK_STATUSES,
  PRICING_MANAGER_STATUSES,
  PRICING_READINESS_VERDICTS,
} from "./pricing.constants";

export type PriceBookStatus = (typeof PRICE_BOOK_STATUSES)[number];
export type BillingCycle = (typeof BILLING_CYCLES)[number];
export type PricingReadinessVerdict =
  (typeof PRICING_READINESS_VERDICTS)[number];
export type PricingManagerStatus =
  (typeof PRICING_MANAGER_STATUSES)[number];

export type PricingMetadata = Record<string, unknown>;

export type PriceBookEntry = {
  id: string;
  name: string;
  packageRef: string;
  currency: string;
  unitAmount: number;
  billingCycle: BillingCycle;
  discountPercent: number;
  status: PriceBookStatus;
  detail: string;
  metadata: PricingMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterPriceBookInput = {
  id?: string;
  name: string;
  packageRef: string;
  currency?: string;
  unitAmount: number;
  billingCycle: BillingCycle;
  discountPercent?: number;
  status?: PriceBookStatus;
  metadata?: PricingMetadata;
};

export type PriceCalculation = {
  id: string;
  priceBookId: string;
  quantity: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  detail: string;
  calculatedAt: string;
};

export type CalculatePriceInput = {
  id?: string;
  priceBookId: string;
  quantity?: number;
  taxPercent?: number;
};

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
  foundationId: typeof COMMERCIALIZATION_PRICING_CONTRACT_ID;
  version: typeof COMMERCIALIZATION_PRICING_CONTRACT_VERSION;
  freezeVersion: typeof COMMERCIALIZATION_PRICING_CONTRACT_FREEZE_VERSION;
  base: typeof COMMERCIALIZATION_PRICING_CONTRACT_BASE;
  priceBookCount: number;
  calculationCount: number;
  quoteCount: number;
  compositionCount: number;
  contractCount: number;
  lifecycleCount: number;
  termsCount: number;
  modelCount: number;
};

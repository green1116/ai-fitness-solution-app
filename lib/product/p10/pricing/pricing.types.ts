/**
 * Product P10 — Pricing types
 */

import type { PRICING_BILLING_CYCLES } from "../subscription/subscription.constants";

export type PricingBillingCycle = (typeof PRICING_BILLING_CYCLES)[number];
export type PricingMetadata = Record<string, unknown>;

export type SubscriptionPricing = {
  id: string;
  planId: string;
  cycle: PricingBillingCycle;
  currency: string;
  unitPrice: number;
  detail: string;
  metadata: PricingMetadata;
  createdAt: string;
};

export type CreatePricingInput = {
  id?: string;
  planId: string;
  cycle: PricingBillingCycle;
  currency?: string;
  unitPrice: number;
  metadata?: PricingMetadata;
};

/**
 * Product P6 — Pricing types
 */

import type { PRICING_MODELS } from "../budget/budget.constants";

export type PricingModel = (typeof PRICING_MODELS)[number];
export type PricingMetadata = Record<string, unknown>;

export type PricingPlan = {
  id: string;
  budgetId: string;
  model: PricingModel;
  name: string;
  unitPrice: number;
  seats: number;
  annualRevenue: number;
  detail: string;
  metadata: PricingMetadata;
  createdAt: string;
};

export type CreatePricingInput = {
  id?: string;
  budgetId: string;
  model: PricingModel;
  name: string;
  unitPrice: number;
  seats?: number;
  metadata?: PricingMetadata;
};

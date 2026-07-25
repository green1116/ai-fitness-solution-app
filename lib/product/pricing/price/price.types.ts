/**
 * Product Pricing — Price types
 */

import type { PRICE_MODELS } from "../management/management.constants";

export type PriceModel = (typeof PRICE_MODELS)[number];
export type PriceMetadata = Record<string, unknown>;

export type PlanPrice = {
  id: string;
  catalogId: string;
  planCode: string;
  model: PriceModel;
  amountCents: number;
  currency: string;
  active: boolean;
  detail: string;
  metadata: PriceMetadata;
  createdAt: string;
};

export type RegisterPriceInput = {
  id?: string;
  catalogId: string;
  planCode: string;
  model: PriceModel;
  amountCents: number;
  currency?: string;
  metadata?: PriceMetadata;
};

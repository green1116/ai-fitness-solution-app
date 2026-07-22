/**
 * Commercialization P1 — Offer types
 */

import type { OFFER_KINDS, PRICING_MODELS } from "../sales/sales.constants";

export type OfferKind = (typeof OFFER_KINDS)[number];
export type PricingModel = (typeof PRICING_MODELS)[number];

export type OfferMetadata = Record<string, unknown>;

export type CommercialOffer = {
  id: string;
  name: string;
  kind: OfferKind;
  description: string;
  active: boolean;
  detail: string;
  metadata: OfferMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOfferInput = {
  id?: string;
  name: string;
  kind: OfferKind;
  description?: string;
  active?: boolean;
  metadata?: OfferMetadata;
};

export type OfferPricing = {
  id: string;
  offerId: string;
  model: PricingModel;
  currency: string;
  unitAmount: number;
  seatsIncluded: number;
  discountPercent: number;
  listPrice: number;
  detail: string;
  createdAt: string;
};

export type CreateOfferPricingInput = {
  id?: string;
  offerId: string;
  model: PricingModel;
  currency?: string;
  unitAmount: number;
  seatsIncluded?: number;
  discountPercent?: number;
};

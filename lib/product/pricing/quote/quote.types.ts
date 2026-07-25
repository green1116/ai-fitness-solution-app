/**
 * Product Pricing — Quote types
 */

import type { QUOTE_STATUSES } from "../management/management.constants";

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];
export type QuoteMetadata = Record<string, unknown>;

export type PricingQuote = {
  id: string;
  priceId: string;
  discountId?: string;
  seats: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  status: QuoteStatus;
  detail: string;
  metadata: QuoteMetadata;
  quotedAt: string;
  updatedAt: string;
};

export type CreateQuoteInput = {
  id?: string;
  priceId: string;
  discountId?: string;
  seats?: number;
  metadata?: QuoteMetadata;
};

export type AcceptQuoteInput = {
  quoteId: string;
};

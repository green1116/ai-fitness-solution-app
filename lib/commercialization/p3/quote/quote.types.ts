/**
 * Commercialization P3 — Quote types
 */

import type { QUOTE_STATUSES } from "../pricing/pricing.constants";

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];
export type QuoteMetadata = Record<string, unknown>;

export type CommercialQuote = {
  id: string;
  name: string;
  customerRef: string;
  priceBookId: string;
  quantity: number;
  status: QuoteStatus;
  lineTotal: number;
  currency: string;
  validUntil: string;
  detail: string;
  metadata: QuoteMetadata;
  createdAt: string;
  updatedAt: string;
  composedAt?: string;
};

export type RegisterQuoteInput = {
  id?: string;
  name: string;
  customerRef: string;
  priceBookId: string;
  quantity?: number;
  validDays?: number;
  metadata?: QuoteMetadata;
};

export type QuoteComposition = {
  id: string;
  quoteId: string;
  priceBookId: string;
  calculationId: string;
  lineItems: string[];
  composedTotal: number;
  detail: string;
  composedAt: string;
};

export type ComposeQuoteInput = {
  id?: string;
  quoteId: string;
  taxPercent?: number;
};

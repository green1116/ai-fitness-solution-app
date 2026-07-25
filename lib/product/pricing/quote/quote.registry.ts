/**
 * Product Pricing — Quote registry
 */

import { getDiscount } from "../discount/discount.registry";
import { QUOTE_STATUSES } from "../management/management.constants";
import { getPrice } from "../price/price.registry";
import type {
  AcceptQuoteInput,
  CreateQuoteInput,
  PricingQuote,
  QuoteStatus,
} from "./quote.types";

const quotes = new Map<string, PricingQuote>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuote(quote: PricingQuote): PricingQuote {
  return { ...quote, metadata: { ...quote.metadata } };
}

function computeSubtotal(
  model: string,
  amountCents: number,
  seats: number,
): number {
  if (model === "PER_SEAT") return amountCents * seats;
  return amountCents;
}

function computeDiscount(
  kind: string,
  value: number,
  subtotalCents: number,
): number {
  if (kind === "PERCENT") {
    return Math.floor((subtotalCents * value) / 100);
  }
  return Math.min(value, subtotalCents);
}

export function createQuote(input: CreateQuoteInput): PricingQuote {
  const priceId = input.priceId.trim();
  if (!priceId) throw new Error("quote.priceId is required");

  const price = getPrice(priceId);
  if (!price) throw new Error(`price not found: ${priceId}`);
  if (!price.active) throw new Error(`price not active: ${priceId}`);

  const seats = input.seats ?? 1;
  if (!Number.isFinite(seats) || seats < 1) {
    throw new Error("quote.seats must be >= 1");
  }

  const subtotalCents = computeSubtotal(
    price.model,
    price.amountCents,
    seats,
  );
  let discountCents = 0;
  let discountId: string | undefined;

  if (input.discountId?.trim()) {
    discountId = input.discountId.trim();
    const discount = getDiscount(discountId);
    if (!discount) throw new Error(`discount not found: ${discountId}`);
    if (!discount.active) throw new Error(`discount not active: ${discountId}`);
    discountCents = computeDiscount(
      discount.kind,
      discount.value,
      subtotalCents,
    );
  }

  const totalCents = Math.max(0, subtotalCents - discountCents);
  const id = input.id?.trim() || createId("priqte");
  if (quotes.has(id)) throw new Error(`quote already exists: ${id}`);

  const now = nowIso();
  const quote: PricingQuote = {
    id,
    priceId,
    discountId,
    seats,
    subtotalCents,
    discountCents,
    totalCents,
    currency: price.currency,
    status: QUOTE_STATUSES[0],
    detail: `total=${totalCents} seats=${seats}`,
    metadata: { ...(input.metadata ?? {}) },
    quotedAt: now,
    updatedAt: now,
  };
  quotes.set(id, quote);
  return cloneQuote(quote);
}

export function acceptQuote(input: AcceptQuoteInput): PricingQuote {
  const quoteId = input.quoteId.trim();
  if (!quoteId) throw new Error("quote.quoteId is required");
  const existing = quotes.get(quoteId);
  if (!existing) throw new Error(`quote not found: ${quoteId}`);
  if (existing.status !== "OPEN") {
    throw new Error(`quote not open: ${quoteId}`);
  }

  const updated: PricingQuote = {
    ...existing,
    status: "ACCEPTED",
    detail: `status=ACCEPTED total=${existing.totalCents}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  quotes.set(quoteId, updated);
  return cloneQuote(updated);
}

export function getQuote(id: string): PricingQuote | undefined {
  const quote = quotes.get(id.trim());
  return quote ? cloneQuote(quote) : undefined;
}

export function listQuotes(filter?: {
  status?: QuoteStatus;
  priceId?: string;
}): PricingQuote[] {
  let result = [...quotes.values()];
  if (filter?.status) {
    result = result.filter((q) => q.status === filter.status);
  }
  if (filter?.priceId) {
    const priceId = filter.priceId.trim();
    result = result.filter((q) => q.priceId === priceId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneQuote);
}

export function clearQuotes(): void {
  quotes.clear();
}

/**
 * Commercialization P3 — Quote registry
 */

import { QUOTE_STATUSES } from "../pricing/pricing.constants";
import { getPriceBook } from "../pricing/pricing.registry";
import type {
  CommercialQuote,
  QuoteStatus,
  RegisterQuoteInput,
} from "./quote.types";

const quotes = new Map<string, CommercialQuote>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuote(quote: CommercialQuote): CommercialQuote {
  return { ...quote, metadata: { ...quote.metadata } };
}

export function registerQuote(input: RegisterQuoteInput): CommercialQuote {
  const name = input.name.trim();
  const customerRef = input.customerRef.trim();
  const priceBookId = input.priceBookId.trim();
  if (!name) throw new Error("quote.name is required");
  if (!customerRef) throw new Error("quote.customerRef is required");

  const book = getPriceBook(priceBookId);
  if (!book) throw new Error(`price book not found: ${priceBookId}`);
  if (book.status !== "ACTIVE") {
    throw new Error(`quote requires ACTIVE price book (status=${book.status})`);
  }

  const quantity = Math.max(1, Math.round(input.quantity ?? 1));
  const validDays = Math.max(1, input.validDays ?? 30);
  const validUntil = new Date(
    Date.now() + validDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const id = input.id?.trim() || createId("quote");
  if (quotes.has(id)) {
    throw new Error(`quote already exists: ${id}`);
  }

  const status: QuoteStatus = "DRAFT";
  if (!(QUOTE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid quote status: ${status}`);
  }

  const now = nowIso();
  const quote: CommercialQuote = {
    id,
    name,
    customerRef,
    priceBookId,
    quantity,
    status,
    lineTotal: 0,
    currency: book.currency,
    validUntil,
    detail: `status=${status} qty=${quantity} book=${priceBookId}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  quotes.set(id, quote);
  return cloneQuote(quote);
}

export function markQuoteComposed(
  id: string,
  lineTotal: number,
): CommercialQuote {
  const quote = quotes.get(id.trim());
  if (!quote) throw new Error(`quote not found: ${id}`);
  quote.status = "COMPOSED";
  quote.lineTotal = Math.max(0, Math.round(lineTotal));
  quote.composedAt = nowIso();
  quote.updatedAt = quote.composedAt;
  quote.detail = `status=COMPOSED total=${quote.lineTotal}`;
  quotes.set(quote.id, quote);
  return cloneQuote(quote);
}

export function acceptQuote(id: string): CommercialQuote {
  const quote = quotes.get(id.trim());
  if (!quote) throw new Error(`quote not found: ${id}`);
  if (quote.status !== "COMPOSED" && quote.status !== "SENT") {
    throw new Error(`accept requires COMPOSED/SENT quote (status=${quote.status})`);
  }
  quote.status = "ACCEPTED";
  quote.updatedAt = nowIso();
  quote.detail = `status=ACCEPTED total=${quote.lineTotal}`;
  quotes.set(quote.id, quote);
  return cloneQuote(quote);
}

export function getCommercialQuote(id: string): CommercialQuote | undefined {
  const quote = quotes.get(id.trim());
  return quote ? cloneQuote(quote) : undefined;
}

export function listCommercialQuotes(filter?: {
  status?: QuoteStatus;
  customerRef?: string;
  priceBookId?: string;
}): CommercialQuote[] {
  let result = [...quotes.values()];
  if (filter?.status) result = result.filter((q) => q.status === filter.status);
  if (filter?.customerRef) {
    const cref = filter.customerRef.trim();
    result = result.filter((q) => q.customerRef === cref);
  }
  if (filter?.priceBookId) {
    const pid = filter.priceBookId.trim();
    result = result.filter((q) => q.priceBookId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneQuote);
}

export function clearCommercialQuotes(): void {
  quotes.clear();
}

/**
 * Commercialization P3 — Quote composer
 */

import { calculatePrice } from "../pricing/pricing.calculator";
import { getPriceBook } from "../pricing/pricing.registry";
import {
  getCommercialQuote,
  markQuoteComposed,
} from "./quote.registry";
import type {
  ComposeQuoteInput,
  QuoteComposition,
} from "./quote.types";

const compositions = new Map<string, QuoteComposition>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneComposition(
  composition: QuoteComposition,
): QuoteComposition {
  return { ...composition, lineItems: [...composition.lineItems] };
}

export function composeQuote(
  input: ComposeQuoteInput,
): QuoteComposition {
  const quoteId = input.quoteId.trim();
  const quote = getCommercialQuote(quoteId);
  if (!quote) throw new Error(`quote not found: ${quoteId}`);

  const book = getPriceBook(quote.priceBookId);
  if (!book) throw new Error(`price book not found: ${quote.priceBookId}`);

  const calc = calculatePrice({
    id: `calc_${quoteId}`,
    priceBookId: quote.priceBookId,
    quantity: quote.quantity,
    taxPercent: input.taxPercent ?? 0,
  });

  markQuoteComposed(quoteId, calc.total);

  const id = input.id?.trim() || createId("qcomp");
  if (compositions.has(id)) {
    throw new Error(`quote composition already exists: ${id}`);
  }

  const composition: QuoteComposition = {
    id,
    quoteId,
    priceBookId: quote.priceBookId,
    calculationId: calc.id,
    lineItems: [
      `${book.name} x${quote.quantity}`,
      `discount=${calc.discountAmount}`,
      `tax=${calc.taxAmount}`,
    ],
    composedTotal: calc.total,
    detail: `quote=${quoteId} total=${calc.total}`,
    composedAt: nowIso(),
  };
  compositions.set(id, composition);
  return cloneComposition(composition);
}

export function getQuoteComposition(
  id: string,
): QuoteComposition | undefined {
  const composition = compositions.get(id.trim());
  return composition ? cloneComposition(composition) : undefined;
}

export function listQuoteCompositions(filter?: {
  quoteId?: string;
}): QuoteComposition[] {
  let result = [...compositions.values()];
  if (filter?.quoteId) {
    const qid = filter.quoteId.trim();
    result = result.filter((c) => c.quoteId === qid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneComposition);
}

export function clearQuoteCompositions(): void {
  compositions.clear();
}

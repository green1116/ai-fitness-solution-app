/**
 * Commercialization P3 — Pricing calculator
 */

import { getPriceBook } from "./pricing.registry";
import type {
  CalculatePriceInput,
  PriceCalculation,
} from "./pricing.types";

const calculations = new Map<string, PriceCalculation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCalc(calc: PriceCalculation): PriceCalculation {
  return { ...calc };
}

export function calculatePrice(
  input: CalculatePriceInput,
): PriceCalculation {
  const priceBookId = input.priceBookId.trim();
  const book = getPriceBook(priceBookId);
  if (!book) throw new Error(`price book not found: ${priceBookId}`);
  if (book.status === "RETIRED") {
    throw new Error(`cannot calculate retired price book: ${priceBookId}`);
  }

  const quantity = Math.max(1, Math.round(input.quantity ?? 1));
  const taxPercent = Math.max(0, Math.min(50, input.taxPercent ?? 0));
  const subtotal = book.unitAmount * quantity;
  const discountAmount = Math.round(
    (subtotal * book.discountPercent) / 100,
  );
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((taxable * taxPercent) / 100);
  const total = taxable + taxAmount;

  const id = input.id?.trim() || createId("pcalc");
  if (calculations.has(id)) {
    throw new Error(`price calculation already exists: ${id}`);
  }

  const calc: PriceCalculation = {
    id,
    priceBookId,
    quantity,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    currency: book.currency,
    detail: `qty=${quantity} total=${total} currency=${book.currency}`,
    calculatedAt: nowIso(),
  };
  calculations.set(id, calc);
  return cloneCalc(calc);
}

export function getPriceCalculation(
  id: string,
): PriceCalculation | undefined {
  const calc = calculations.get(id.trim());
  return calc ? cloneCalc(calc) : undefined;
}

export function listPriceCalculations(filter?: {
  priceBookId?: string;
}): PriceCalculation[] {
  let result = [...calculations.values()];
  if (filter?.priceBookId) {
    const pid = filter.priceBookId.trim();
    result = result.filter((c) => c.priceBookId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCalc);
}

export function clearPriceCalculations(): void {
  calculations.clear();
}

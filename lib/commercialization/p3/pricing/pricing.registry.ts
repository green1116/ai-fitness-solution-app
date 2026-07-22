/**
 * Commercialization P3 — Price book registry
 */

import { BILLING_CYCLES, PRICE_BOOK_STATUSES } from "./pricing.constants";
import type {
  BillingCycle,
  PriceBookEntry,
  PriceBookStatus,
  RegisterPriceBookInput,
} from "./pricing.types";

const priceBooks = new Map<string, PriceBookEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntry(entry: PriceBookEntry): PriceBookEntry {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function registerPriceBook(
  input: RegisterPriceBookInput,
): PriceBookEntry {
  const name = input.name.trim();
  const packageRef = input.packageRef.trim();
  if (!name) throw new Error("priceBook.name is required");
  if (!packageRef) throw new Error("priceBook.packageRef is required");
  if (!Number.isFinite(input.unitAmount) || input.unitAmount < 0) {
    throw new Error("priceBook.unitAmount must be a non-negative number");
  }
  if (!(BILLING_CYCLES as readonly string[]).includes(input.billingCycle)) {
    throw new Error(`invalid billing cycle: ${input.billingCycle}`);
  }

  const status: PriceBookStatus = input.status ?? "DRAFT";
  if (!(PRICE_BOOK_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid price book status: ${status}`);
  }

  const discountPercent = Math.max(
    0,
    Math.min(100, input.discountPercent ?? 0),
  );
  const id = input.id?.trim() || createId("pbook");
  if (priceBooks.has(id)) {
    throw new Error(`price book already exists: ${id}`);
  }

  const now = nowIso();
  const entry: PriceBookEntry = {
    id,
    name,
    packageRef,
    currency: (input.currency ?? "USD").trim().toUpperCase() || "USD",
    unitAmount: Math.round(input.unitAmount),
    billingCycle: input.billingCycle,
    discountPercent,
    status,
    detail: `status=${status} unit=${Math.round(input.unitAmount)} cycle=${input.billingCycle}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  priceBooks.set(id, entry);
  return cloneEntry(entry);
}

export function activatePriceBook(id: string): PriceBookEntry {
  const entry = priceBooks.get(id.trim());
  if (!entry) throw new Error(`price book not found: ${id}`);
  entry.status = "ACTIVE";
  entry.updatedAt = nowIso();
  entry.detail = `status=ACTIVE unit=${entry.unitAmount} cycle=${entry.billingCycle}`;
  priceBooks.set(entry.id, entry);
  return cloneEntry(entry);
}

export function getPriceBook(id: string): PriceBookEntry | undefined {
  const entry = priceBooks.get(id.trim());
  return entry ? cloneEntry(entry) : undefined;
}

export function listPriceBooks(filter?: {
  status?: PriceBookStatus;
  billingCycle?: BillingCycle;
  packageRef?: string;
}): PriceBookEntry[] {
  let result = [...priceBooks.values()];
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  if (filter?.billingCycle) {
    result = result.filter((p) => p.billingCycle === filter.billingCycle);
  }
  if (filter?.packageRef) {
    const pref = filter.packageRef.trim();
    result = result.filter((p) => p.packageRef === pref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEntry);
}

export function clearPriceBooks(): void {
  priceBooks.clear();
}

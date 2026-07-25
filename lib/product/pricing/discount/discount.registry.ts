/**
 * Product Pricing — Discount registry
 */

import { DISCOUNT_KINDS } from "../management/management.constants";
import type {
  DiscountKind,
  PricingDiscount,
  RegisterDiscountInput,
} from "./discount.types";

const discounts = new Map<string, PricingDiscount>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDiscount(discount: PricingDiscount): PricingDiscount {
  return { ...discount, metadata: { ...discount.metadata } };
}

export function registerDiscount(
  input: RegisterDiscountInput,
): PricingDiscount {
  const code = input.code.trim().toUpperCase();
  if (!code) throw new Error("discount.code is required");
  if (!(DISCOUNT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid discount kind: ${input.kind}`);
  }
  if (!Number.isFinite(input.value) || input.value < 0) {
    throw new Error("discount.value must be >= 0");
  }
  if (input.kind === "PERCENT" && input.value > 100) {
    throw new Error("discount percent must be <= 100");
  }

  const id = input.id?.trim() || createId("pridsc");
  if (discounts.has(id)) throw new Error(`discount already exists: ${id}`);

  const discount: PricingDiscount = {
    id,
    code,
    kind: input.kind,
    value: input.value,
    active: true,
    detail: `kind=${input.kind} value=${input.value}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  discounts.set(id, discount);
  return cloneDiscount(discount);
}

export function getDiscount(id: string): PricingDiscount | undefined {
  const discount = discounts.get(id.trim());
  return discount ? cloneDiscount(discount) : undefined;
}

export function listDiscounts(filter?: {
  kind?: DiscountKind;
  active?: boolean;
}): PricingDiscount[] {
  let result = [...discounts.values()];
  if (filter?.kind) result = result.filter((d) => d.kind === filter.kind);
  if (typeof filter?.active === "boolean") {
    result = result.filter((d) => d.active === filter.active);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDiscount);
}

export function clearDiscounts(): void {
  discounts.clear();
}

/**
 * Product P10 — Pricing registry
 */

import { PRICING_BILLING_CYCLES } from "../subscription/subscription.constants";
import { getPlan } from "../plan/plan.registry";
import type {
  CreatePricingInput,
  PricingBillingCycle,
  SubscriptionPricing,
} from "./pricing.types";

const pricingRecords = new Map<string, SubscriptionPricing>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePricing(pricing: SubscriptionPricing): SubscriptionPricing {
  return { ...pricing, metadata: { ...pricing.metadata } };
}

export function createPricing(
  input: CreatePricingInput,
): SubscriptionPricing {
  const planId = input.planId.trim();
  if (!planId) throw new Error("pricing.planId is required");
  if (!(PRICING_BILLING_CYCLES as readonly string[]).includes(input.cycle)) {
    throw new Error(`invalid pricing cycle: ${input.cycle}`);
  }
  if (!Number.isFinite(input.unitPrice) || input.unitPrice < 0) {
    throw new Error("pricing.unitPrice must be a non-negative number");
  }
  if (!getPlan(planId)) {
    throw new Error(`plan not found: ${planId}`);
  }

  const id = input.id?.trim() || createId("p10prc");
  if (pricingRecords.has(id)) {
    throw new Error(`pricing already exists: ${id}`);
  }

  const currency = (input.currency ?? "USD").trim() || "USD";
  const pricing: SubscriptionPricing = {
    id,
    planId,
    cycle: input.cycle,
    currency,
    unitPrice: input.unitPrice,
    detail: `cycle=${input.cycle} price=${input.unitPrice} ${currency}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  pricingRecords.set(id, pricing);
  return clonePricing(pricing);
}

export function getPricing(id: string): SubscriptionPricing | undefined {
  const pricing = pricingRecords.get(id.trim());
  return pricing ? clonePricing(pricing) : undefined;
}

export function listPricing(filter?: {
  planId?: string;
  cycle?: PricingBillingCycle;
}): SubscriptionPricing[] {
  let result = [...pricingRecords.values()];
  if (filter?.planId) {
    const pid = filter.planId.trim();
    result = result.filter((p) => p.planId === pid);
  }
  if (filter?.cycle) result = result.filter((p) => p.cycle === filter.cycle);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePricing);
}

export function clearPricing(): void {
  pricingRecords.clear();
}

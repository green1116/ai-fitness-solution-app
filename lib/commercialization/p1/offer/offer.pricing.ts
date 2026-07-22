/**
 * Commercialization P1 — Offer pricing
 */

import { PRICING_MODELS } from "../sales/sales.constants";
import { getCommercialOffer } from "./offer.catalog";
import type {
  CreateOfferPricingInput,
  OfferPricing,
  PricingModel,
} from "./offer.types";

const pricingStore = new Map<string, OfferPricing>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePricing(pricing: OfferPricing): OfferPricing {
  return { ...pricing };
}

export function createOfferPricing(
  input: CreateOfferPricingInput,
): OfferPricing {
  const offerId = input.offerId.trim();
  const offer = getCommercialOffer(offerId);
  if (!offer) throw new Error(`offer not found: ${offerId}`);
  if (!offer.active) throw new Error(`offer is inactive: ${offerId}`);

  if (!(PRICING_MODELS as readonly string[]).includes(input.model)) {
    throw new Error(`invalid pricing model: ${input.model}`);
  }
  if (!Number.isFinite(input.unitAmount) || input.unitAmount < 0) {
    throw new Error("pricing.unitAmount must be a non-negative number");
  }

  const seatsIncluded = Math.max(1, input.seatsIncluded ?? 1);
  const discountPercent = Math.max(
    0,
    Math.min(100, input.discountPercent ?? 0),
  );
  const unitAmount = Math.round(input.unitAmount);
  const listPrice = Math.round(
    unitAmount * seatsIncluded * (1 - discountPercent / 100),
  );

  const id = input.id?.trim() || createId("price");
  if (pricingStore.has(id)) {
    throw new Error(`offer pricing already exists: ${id}`);
  }

  const pricing: OfferPricing = {
    id,
    offerId,
    model: input.model,
    currency: (input.currency ?? "USD").trim().toUpperCase() || "USD",
    unitAmount,
    seatsIncluded,
    discountPercent,
    listPrice,
    detail: `model=${input.model} list=${listPrice}`,
    createdAt: nowIso(),
  };
  pricingStore.set(id, pricing);
  return clonePricing(pricing);
}

export function getOfferPricing(id: string): OfferPricing | undefined {
  const pricing = pricingStore.get(id.trim());
  return pricing ? clonePricing(pricing) : undefined;
}

export function listOfferPricing(filter?: {
  offerId?: string;
  model?: PricingModel;
}): OfferPricing[] {
  let result = [...pricingStore.values()];
  if (filter?.offerId) {
    const oid = filter.offerId.trim();
    result = result.filter((p) => p.offerId === oid);
  }
  if (filter?.model) result = result.filter((p) => p.model === filter.model);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePricing);
}

export function clearOfferPricing(): void {
  pricingStore.clear();
}

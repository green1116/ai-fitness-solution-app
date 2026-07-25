/**
 * Product Pricing — Price registry
 */

import { getCatalog } from "../catalog/catalog.registry";
import { PRICE_MODELS } from "../management/management.constants";
import type {
  PlanPrice,
  PriceModel,
  RegisterPriceInput,
} from "./price.types";

const prices = new Map<string, PlanPrice>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePrice(price: PlanPrice): PlanPrice {
  return { ...price, metadata: { ...price.metadata } };
}

export function registerPrice(input: RegisterPriceInput): PlanPrice {
  const catalogId = input.catalogId.trim();
  const planCode = input.planCode.trim().toUpperCase();
  const currency = (input.currency ?? "USD").trim().toUpperCase();
  if (!catalogId) throw new Error("price.catalogId is required");
  if (!planCode) throw new Error("price.planCode is required");
  if (!(PRICE_MODELS as readonly string[]).includes(input.model)) {
    throw new Error(`invalid price model: ${input.model}`);
  }
  if (!Number.isFinite(input.amountCents) || input.amountCents < 0) {
    throw new Error("price.amountCents must be >= 0");
  }

  const catalog = getCatalog(catalogId);
  if (!catalog) throw new Error(`catalog not found: ${catalogId}`);
  if (catalog.status !== "PUBLISHED") {
    throw new Error(`catalog not published: ${catalogId}`);
  }

  const id = input.id?.trim() || createId("priprc");
  if (prices.has(id)) throw new Error(`price already exists: ${id}`);

  const price: PlanPrice = {
    id,
    catalogId,
    planCode,
    model: input.model,
    amountCents: input.amountCents,
    currency,
    active: true,
    detail: `model=${input.model} amount=${input.amountCents}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  prices.set(id, price);
  return clonePrice(price);
}

export function getPrice(id: string): PlanPrice | undefined {
  const price = prices.get(id.trim());
  return price ? clonePrice(price) : undefined;
}

export function listPrices(filter?: {
  catalogId?: string;
  model?: PriceModel;
  active?: boolean;
}): PlanPrice[] {
  let result = [...prices.values()];
  if (filter?.catalogId) {
    const catalogId = filter.catalogId.trim();
    result = result.filter((p) => p.catalogId === catalogId);
  }
  if (filter?.model) result = result.filter((p) => p.model === filter.model);
  if (typeof filter?.active === "boolean") {
    result = result.filter((p) => p.active === filter.active);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePrice);
}

export function clearPrices(): void {
  prices.clear();
}

/**
 * Product P6 — Pricing registry
 */

import { PRICING_MODELS } from "../budget/budget.constants";
import { getBudget } from "../budget/budget.registry";
import type {
  CreatePricingInput,
  PricingModel,
  PricingPlan,
} from "./pricing.types";

const pricingPlans = new Map<string, PricingPlan>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePricing(plan: PricingPlan): PricingPlan {
  return { ...plan, metadata: { ...plan.metadata } };
}

export function createPricing(input: CreatePricingInput): PricingPlan {
  const budgetId = input.budgetId.trim();
  const name = input.name.trim();
  if (!budgetId) throw new Error("pricing.budgetId is required");
  if (!name) throw new Error("pricing.name is required");
  if (!(PRICING_MODELS as readonly string[]).includes(input.model)) {
    throw new Error(`invalid pricing model: ${input.model}`);
  }
  if (!Number.isFinite(input.unitPrice) || input.unitPrice < 0) {
    throw new Error("pricing.unitPrice must be a non-negative number");
  }
  const seats =
    input.seats === undefined ? 1 : Math.max(0, Math.floor(input.seats));
  if (!getBudget(budgetId)) {
    throw new Error(`budget not found: ${budgetId}`);
  }

  const id = input.id?.trim() || createId("p6prc");
  if (pricingPlans.has(id)) {
    throw new Error(`pricing plan already exists: ${id}`);
  }

  const annualRevenue = input.unitPrice * seats * 12;
  const plan: PricingPlan = {
    id,
    budgetId,
    model: input.model,
    name,
    unitPrice: input.unitPrice,
    seats,
    annualRevenue,
    detail: `model=${input.model} annual=${annualRevenue}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  pricingPlans.set(id, plan);
  return clonePricing(plan);
}

export function getPricing(id: string): PricingPlan | undefined {
  const plan = pricingPlans.get(id.trim());
  return plan ? clonePricing(plan) : undefined;
}

export function listPricing(filter?: {
  budgetId?: string;
  model?: PricingModel;
}): PricingPlan[] {
  let result = [...pricingPlans.values()];
  if (filter?.budgetId) {
    const bid = filter.budgetId.trim();
    result = result.filter((p) => p.budgetId === bid);
  }
  if (filter?.model) result = result.filter((p) => p.model === filter.model);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePricing);
}

export function clearPricing(): void {
  pricingPlans.clear();
}

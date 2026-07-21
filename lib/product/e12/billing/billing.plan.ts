/**
 * E12-P4 — Pricing Plan Model
 * Integrates product edition and admin configuration
 */

import { getProductConfiguration } from "../admin/admin.config";
import { getProductEdition } from "../edition/product.edition";
import { getProductIdentity } from "../identity/product.identity";
import {
  BILLING_CYCLES,
  PRICING_PLAN_STATUSES,
  USAGE_METER_UNITS,
} from "./billing.constants";
import type {
  CreatePricingPlanInput,
  PricingPlan,
  PricingPlanStatus,
  QuotaLimit,
} from "./billing.types";

const plans = new Map<string, PricingPlan>();

const DEFAULT_QUOTAS: QuotaLimit[] = [
  { meter: "REQUEST", included: 10000, overageRate: 0.001 },
  { meter: "RUNTIME_HOUR", included: 100, overageRate: 0.5 },
];

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePlan(plan: PricingPlan): PricingPlan {
  return {
    ...plan,
    quotas: plan.quotas.map((q) => ({ ...q })),
    metadata: { ...plan.metadata },
  };
}

function resolveQuotasFromConfig(
  productId: string,
  editionId: string,
): QuotaLimit[] | undefined {
  const config = getProductConfiguration({
    productId,
    scope: "PRODUCT",
    key: `billing.quotas.${editionId}`,
  });
  if (!config?.value || !Array.isArray(config.value)) return undefined;
  return config.value as QuotaLimit[];
}

export function createPricingPlan(input: CreatePricingPlanInput): PricingPlan {
  const productId = input.productId.trim();
  const editionId = input.editionId.trim();
  const name = input.name.trim();
  if (!name) throw new Error("plan.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }
  const edition = getProductEdition(editionId);
  if (!edition || edition.productId !== productId) {
    throw new Error(`edition not found for product: ${editionId}`);
  }

  const status = input.status ?? "ACTIVE";
  if (!(PRICING_PLAN_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid plan status: ${status}`);
  }

  const billingCycle = input.billingCycle ?? "MONTHLY";
  if (!(BILLING_CYCLES as readonly string[]).includes(billingCycle)) {
    throw new Error(`invalid billing cycle: ${billingCycle}`);
  }

  const quotas =
    input.quotas ??
    resolveQuotasFromConfig(productId, editionId) ??
    DEFAULT_QUOTAS;

  for (const q of quotas) {
    if (!(USAGE_METER_UNITS as readonly string[]).includes(q.meter)) {
      throw new Error(`invalid meter unit: ${q.meter}`);
    }
  }

  const id = input.id?.trim() || createId("plan");
  if (plans.has(id)) throw new Error(`pricing plan already exists: ${id}`);

  const plan: PricingPlan = {
    id,
    productId,
    editionId,
    name,
    currency: input.currency?.trim() || "USD",
    basePrice: input.basePrice,
    billingCycle,
    quotas,
    status,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  plans.set(id, plan);
  return clonePlan(plan);
}

export function getPricingPlan(id: string): PricingPlan | undefined {
  const plan = plans.get(id.trim());
  return plan ? clonePlan(plan) : undefined;
}

export function listPricingPlans(filter?: {
  productId?: string;
  editionId?: string;
  status?: PricingPlanStatus;
}): PricingPlan[] {
  let result = [...plans.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((p) => p.productId === pid);
  }
  if (filter?.editionId) {
    const eid = filter.editionId.trim();
    result = result.filter((p) => p.editionId === eid);
  }
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePlan);
}

export function clearPricingPlans(): void {
  plans.clear();
}

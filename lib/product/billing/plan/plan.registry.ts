/**
 * Product Billing — Plan registry
 */

import { BILLING_PLAN_TIERS } from "../foundation/foundation.constants";
import type {
  BillingPlan,
  BillingPlanTier,
  RegisterBillingPlanInput,
} from "./plan.types";

const plans = new Map<string, BillingPlan>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePlan(plan: BillingPlan): BillingPlan {
  return { ...plan, metadata: { ...plan.metadata } };
}

export function registerBillingPlan(
  input: RegisterBillingPlanInput,
): BillingPlan {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  const currency = (input.currency ?? "USD").trim().toUpperCase();
  if (!code) throw new Error("plan.code is required");
  if (!name) throw new Error("plan.name is required");
  if (!(BILLING_PLAN_TIERS as readonly string[]).includes(input.tier)) {
    throw new Error(`invalid billing plan tier: ${input.tier}`);
  }
  if (!Number.isFinite(input.amountCents) || input.amountCents < 0) {
    throw new Error("plan.amountCents must be >= 0");
  }

  const id = input.id?.trim() || createId("bilpln");
  if (plans.has(id)) throw new Error(`billing plan already exists: ${id}`);

  const interval = input.interval ?? "MONTHLY";
  const plan: BillingPlan = {
    id,
    code,
    name,
    tier: input.tier,
    amountCents: input.amountCents,
    currency,
    interval,
    active: true,
    detail: `tier=${input.tier} amount=${input.amountCents}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  plans.set(id, plan);
  return clonePlan(plan);
}

export function getBillingPlan(id: string): BillingPlan | undefined {
  const plan = plans.get(id.trim());
  return plan ? clonePlan(plan) : undefined;
}

export function listBillingPlans(filter?: {
  tier?: BillingPlanTier;
  active?: boolean;
}): BillingPlan[] {
  let result = [...plans.values()];
  if (filter?.tier) result = result.filter((p) => p.tier === filter.tier);
  if (typeof filter?.active === "boolean") {
    result = result.filter((p) => p.active === filter.active);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePlan);
}

export function clearBillingPlans(): void {
  plans.clear();
}

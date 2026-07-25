/**
 * Product P10 — Plan registry
 */

import { PLAN_TIERS } from "../subscription/subscription.constants";
import type {
  PlanTier,
  RegisterPlanInput,
  SubscriptionPlan,
} from "./plan.types";

const plans = new Map<string, SubscriptionPlan>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePlan(plan: SubscriptionPlan): SubscriptionPlan {
  return {
    ...plan,
    features: [...plan.features],
    metadata: { ...plan.metadata },
  };
}

export function registerPlan(input: RegisterPlanInput): SubscriptionPlan {
  const name = input.name.trim();
  if (!name) throw new Error("plan.name is required");
  if (!(PLAN_TIERS as readonly string[]).includes(input.tier)) {
    throw new Error(`invalid plan tier: ${input.tier}`);
  }

  const id = input.id?.trim() || createId("p10pln");
  if (plans.has(id)) {
    throw new Error(`plan already exists: ${id}`);
  }

  const features = (input.features ?? [])
    .map((f) => f.trim())
    .filter((f) => f.length > 0);
  const description =
    (input.description ?? "").trim() || `${input.tier} subscription plan`;
  const plan: SubscriptionPlan = {
    id,
    tier: input.tier,
    name,
    description,
    features,
    detail: `tier=${input.tier} features=${features.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  plans.set(id, plan);
  return clonePlan(plan);
}

export function getPlan(id: string): SubscriptionPlan | undefined {
  const plan = plans.get(id.trim());
  return plan ? clonePlan(plan) : undefined;
}

export function listPlans(filter?: { tier?: PlanTier }): SubscriptionPlan[] {
  let result = [...plans.values()];
  if (filter?.tier) result = result.filter((p) => p.tier === filter.tier);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePlan);
}

export function clearPlans(): void {
  plans.clear();
}

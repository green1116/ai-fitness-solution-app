/**
 * Product P9 — Success plan registry
 */

import { SUCCESS_PLAN_STATUSES } from "../customer-health/health.constants";
import { getCustomerHealth } from "../customer-health/health.registry";
import type {
  CreateSuccessPlanInput,
  SuccessPlan,
  UpdateSuccessPlanStatusInput,
} from "./plan.types";

const plans = new Map<string, SuccessPlan>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePlan(plan: SuccessPlan): SuccessPlan {
  return {
    ...plan,
    objectives: [...plan.objectives],
    metadata: { ...plan.metadata },
  };
}

export function createSuccessPlan(
  input: CreateSuccessPlanInput,
): SuccessPlan {
  const healthId = input.healthId.trim();
  const name = input.name.trim();
  if (!healthId) throw new Error("plan.healthId is required");
  if (!name) throw new Error("plan.name is required");
  if (!getCustomerHealth(healthId)) {
    throw new Error(`customer health not found: ${healthId}`);
  }

  const id = input.id?.trim() || createId("p9pln");
  if (plans.has(id)) {
    throw new Error(`success plan already exists: ${id}`);
  }

  const now = nowIso();
  const objectives = (input.objectives ?? [])
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
  const status = SUCCESS_PLAN_STATUSES[1];
  const plan: SuccessPlan = {
    id,
    healthId,
    name,
    objectives,
    status,
    detail: `status=${status} objectives=${objectives.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  plans.set(id, plan);
  return clonePlan(plan);
}

export function updateSuccessPlanStatus(
  input: UpdateSuccessPlanStatusInput,
): SuccessPlan {
  const planId = input.planId.trim();
  if (!planId) throw new Error("plan.planId is required");
  if (!(SUCCESS_PLAN_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid success plan status: ${input.status}`);
  }
  const existing = plans.get(planId);
  if (!existing) throw new Error(`success plan not found: ${planId}`);

  const updated: SuccessPlan = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} objectives=${existing.objectives.length}`,
    metadata: { ...existing.metadata },
    objectives: [...existing.objectives],
    updatedAt: nowIso(),
  };
  plans.set(planId, updated);
  return clonePlan(updated);
}

export function getSuccessPlan(id: string): SuccessPlan | undefined {
  const plan = plans.get(id.trim());
  return plan ? clonePlan(plan) : undefined;
}

export function listSuccessPlans(filter?: {
  healthId?: string;
}): SuccessPlan[] {
  let result = [...plans.values()];
  if (filter?.healthId) {
    const hid = filter.healthId.trim();
    result = result.filter((p) => p.healthId === hid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePlan);
}

export function clearSuccessPlans(): void {
  plans.clear();
}

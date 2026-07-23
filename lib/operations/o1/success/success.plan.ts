/**
 * Operations O1 — Success plan
 */

import { getCustomer } from "../customer/customer.registry";
import { SUCCESS_PLAN_STATUSES } from "./success.constants";
import type {
  CreateSuccessPlanInput,
  SuccessPlan,
  SuccessPlanStatus,
} from "./success.types";

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
  const title = input.title.trim();
  const customerId = input.customerId.trim();
  if (!title) throw new Error("successPlan.title is required");
  if (!customerId) throw new Error("successPlan.customerId is required");
  if (!getCustomer(customerId)) {
    throw new Error(`customer not found: ${customerId}`);
  }

  const status: SuccessPlanStatus = input.status ?? "ACTIVE";
  if (!(SUCCESS_PLAN_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid success plan status: ${status}`);
  }

  const objectives = (input.objectives ?? [])
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
  const id = input.id?.trim() || createId("o1pln");
  if (plans.has(id)) {
    throw new Error(`success plan already exists: ${id}`);
  }

  const now = nowIso();
  const plan: SuccessPlan = {
    id,
    customerId,
    title,
    status,
    objectives,
    detail: `status=${status} objectives=${objectives.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  plans.set(id, plan);
  return clonePlan(plan);
}

export function getSuccessPlan(id: string): SuccessPlan | undefined {
  const plan = plans.get(id.trim());
  return plan ? clonePlan(plan) : undefined;
}

export function listSuccessPlans(filter?: {
  customerId?: string;
  status?: SuccessPlanStatus;
}): SuccessPlan[] {
  let result = [...plans.values()];
  if (filter?.customerId) {
    const cid = filter.customerId.trim();
    result = result.filter((p) => p.customerId === cid);
  }
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePlan);
}

export function clearSuccessPlans(): void {
  plans.clear();
}

/**
 * Product P6 — Budget registry
 */

import { BUDGET_STATUSES } from "./budget.constants";
import type {
  BudgetPlan,
  BudgetStatus,
  CreateBudgetInput,
  UpdateBudgetStatusInput,
} from "./budget.types";

const budgets = new Map<string, BudgetPlan>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBudget(budget: BudgetPlan): BudgetPlan {
  return { ...budget, metadata: { ...budget.metadata } };
}

export function createBudget(input: CreateBudgetInput): BudgetPlan {
  const proposalRef = input.proposalRef.trim();
  const name = input.name.trim();
  const owner = input.owner.trim();
  if (!proposalRef) throw new Error("budget.proposalRef is required");
  if (!name) throw new Error("budget.name is required");
  if (!owner) throw new Error("budget.owner is required");

  const id = input.id?.trim() || createId("p6bdg");
  if (budgets.has(id)) {
    throw new Error(`budget already exists: ${id}`);
  }

  const now = nowIso();
  const status = BUDGET_STATUSES[0];
  const currency = (input.currency ?? "USD").trim() || "USD";
  const budget: BudgetPlan = {
    id,
    proposalRef,
    name,
    currency,
    status,
    owner,
    detail: `status=${status} currency=${currency}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  budgets.set(id, budget);
  return cloneBudget(budget);
}

export function updateBudgetStatus(
  input: UpdateBudgetStatusInput,
): BudgetPlan {
  const budgetId = input.budgetId.trim();
  if (!budgetId) throw new Error("budget.budgetId is required");
  if (!(BUDGET_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid budget status: ${input.status}`);
  }
  const existing = budgets.get(budgetId);
  if (!existing) throw new Error(`budget not found: ${budgetId}`);

  const updated: BudgetPlan = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} currency=${existing.currency}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  budgets.set(budgetId, updated);
  return cloneBudget(updated);
}

export function getBudget(id: string): BudgetPlan | undefined {
  const budget = budgets.get(id.trim());
  return budget ? cloneBudget(budget) : undefined;
}

export function listBudgets(filter?: {
  proposalRef?: string;
  status?: BudgetStatus;
}): BudgetPlan[] {
  let result = [...budgets.values()];
  if (filter?.proposalRef) {
    const pref = filter.proposalRef.trim();
    result = result.filter((b) => b.proposalRef === pref);
  }
  if (filter?.status) result = result.filter((b) => b.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneBudget);
}

export function clearBudgets(): void {
  budgets.clear();
}

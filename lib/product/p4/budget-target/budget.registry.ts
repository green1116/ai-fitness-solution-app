/**
 * Product P4 — Budget target registry
 */

import { BUDGET_TARGET_STATUSES } from "../questionnaire/questionnaire.constants";
import type {
  BudgetTarget,
  BudgetTargetStatus,
  SetBudgetTargetInput,
  UpdateBudgetTargetStatusInput,
} from "./budget.types";

const budgets = new Map<string, BudgetTarget>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBudget(budget: BudgetTarget): BudgetTarget {
  return { ...budget, metadata: { ...budget.metadata } };
}

export function setBudgetTarget(input: SetBudgetTargetInput): BudgetTarget {
  const projectRef = input.projectRef.trim();
  if (!projectRef) throw new Error("budget.projectRef is required");
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    throw new Error("budget.amount must be a non-negative number");
  }

  const id = input.id?.trim() || createId("p4bud");
  if (budgets.has(id)) {
    throw new Error(`budget target already exists: ${id}`);
  }

  const now = nowIso();
  const currency = (input.currency ?? "USD").trim().toUpperCase() || "USD";
  const amount = Math.round(input.amount);
  const status = BUDGET_TARGET_STATUSES[0];
  const budget: BudgetTarget = {
    id,
    projectRef,
    currency,
    amount,
    status,
    detail: `amount=${amount} ${currency} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  budgets.set(id, budget);
  return cloneBudget(budget);
}

export function updateBudgetTargetStatus(
  input: UpdateBudgetTargetStatusInput,
): BudgetTarget {
  const budgetId = input.budgetId.trim();
  if (!budgetId) throw new Error("budget.budgetId is required");
  if (!(BUDGET_TARGET_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid budget target status: ${input.status}`);
  }
  const existing = budgets.get(budgetId);
  if (!existing) throw new Error(`budget target not found: ${budgetId}`);

  const updated: BudgetTarget = {
    ...existing,
    status: input.status,
    detail: `amount=${existing.amount} ${existing.currency} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  budgets.set(budgetId, updated);
  return cloneBudget(updated);
}

export function getBudgetTarget(id: string): BudgetTarget | undefined {
  const budget = budgets.get(id.trim());
  return budget ? cloneBudget(budget) : undefined;
}

export function listBudgetTargets(filter?: {
  projectRef?: string;
  status?: BudgetTargetStatus;
}): BudgetTarget[] {
  let result = [...budgets.values()];
  if (filter?.projectRef) {
    const pref = filter.projectRef.trim();
    result = result.filter((b) => b.projectRef === pref);
  }
  if (filter?.status) result = result.filter((b) => b.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneBudget);
}

export function clearBudgetTargets(): void {
  budgets.clear();
}

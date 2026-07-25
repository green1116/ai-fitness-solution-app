/**
 * Product P6 — Investment registry
 */

import { INVESTMENT_CATEGORIES } from "../budget/budget.constants";
import { getBudget } from "../budget/budget.registry";
import type {
  CreateInvestmentInput,
  Investment,
  InvestmentCategory,
} from "./investment.types";

const investments = new Map<string, Investment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneInvestment(investment: Investment): Investment {
  return { ...investment, metadata: { ...investment.metadata } };
}

export function createInvestment(input: CreateInvestmentInput): Investment {
  const budgetId = input.budgetId.trim();
  const label = input.label.trim();
  if (!budgetId) throw new Error("investment.budgetId is required");
  if (!label) throw new Error("investment.label is required");
  if (!(INVESTMENT_CATEGORIES as readonly string[]).includes(input.category)) {
    throw new Error(`invalid investment category: ${input.category}`);
  }
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    throw new Error("investment.amount must be a non-negative number");
  }
  if (!getBudget(budgetId)) {
    throw new Error(`budget not found: ${budgetId}`);
  }

  const id = input.id?.trim() || createId("p6inv");
  if (investments.has(id)) {
    throw new Error(`investment already exists: ${id}`);
  }

  const investment: Investment = {
    id,
    budgetId,
    category: input.category,
    label,
    amount: input.amount,
    detail: `category=${input.category} amount=${input.amount}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  investments.set(id, investment);
  return cloneInvestment(investment);
}

export function getInvestment(id: string): Investment | undefined {
  const investment = investments.get(id.trim());
  return investment ? cloneInvestment(investment) : undefined;
}

export function listInvestments(filter?: {
  budgetId?: string;
  category?: InvestmentCategory;
}): Investment[] {
  let result = [...investments.values()];
  if (filter?.budgetId) {
    const bid = filter.budgetId.trim();
    result = result.filter((i) => i.budgetId === bid);
  }
  if (filter?.category) {
    result = result.filter((i) => i.category === filter.category);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneInvestment);
}

export function clearInvestments(): void {
  investments.clear();
}

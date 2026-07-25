/**
 * Product P6 — Financial summary registry
 */

import { getBudget } from "../budget/budget.registry";
import type {
  CreateFinancialSummaryInput,
  FinancialSummary,
} from "./summary.types";

const summaries = new Map<string, FinancialSummary>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSummary(summary: FinancialSummary): FinancialSummary {
  return { ...summary, metadata: { ...summary.metadata } };
}

export function createFinancialSummary(
  input: CreateFinancialSummaryInput,
): FinancialSummary {
  const budgetId = input.budgetId.trim();
  if (!budgetId) throw new Error("summary.budgetId is required");
  if (!Number.isFinite(input.totalInvestment) || input.totalInvestment < 0) {
    throw new Error("summary.totalInvestment must be a non-negative number");
  }
  if (!Number.isFinite(input.totalAnnualCost) || input.totalAnnualCost < 0) {
    throw new Error("summary.totalAnnualCost must be a non-negative number");
  }
  if (!Number.isFinite(input.projectedReturn) || input.projectedReturn < 0) {
    throw new Error("summary.projectedReturn must be a non-negative number");
  }
  if (!getBudget(budgetId)) {
    throw new Error(`budget not found: ${budgetId}`);
  }

  const id = input.id?.trim() || createId("p6fin");
  if (summaries.has(id)) {
    throw new Error(`financial summary already exists: ${id}`);
  }

  const netValue = input.projectedReturn - input.totalInvestment;
  const narrative =
    (input.narrative ?? "").trim() ||
    `Investment ${input.totalInvestment} vs return ${input.projectedReturn}`;
  const summary: FinancialSummary = {
    id,
    budgetId,
    totalInvestment: input.totalInvestment,
    totalAnnualCost: input.totalAnnualCost,
    projectedReturn: input.projectedReturn,
    netValue,
    narrative,
    detail: `net=${netValue} annual=${input.totalAnnualCost}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  summaries.set(id, summary);
  return cloneSummary(summary);
}

export function getFinancialSummary(id: string): FinancialSummary | undefined {
  const summary = summaries.get(id.trim());
  return summary ? cloneSummary(summary) : undefined;
}

export function listFinancialSummaries(filter?: {
  budgetId?: string;
}): FinancialSummary[] {
  let result = [...summaries.values()];
  if (filter?.budgetId) {
    const bid = filter.budgetId.trim();
    result = result.filter((s) => s.budgetId === bid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSummary);
}

export function clearFinancialSummaries(): void {
  summaries.clear();
}

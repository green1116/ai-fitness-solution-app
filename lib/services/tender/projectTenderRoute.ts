import { QuoteStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { readBudgetQuoteBasis } from "@/lib/services/budget.service";

/**
 * Project → Tender entry: the Budget is chosen first and the Quote is the one that Budget was
 * calculated from. Never pairs the latest Quote with the latest Budget independently.
 */
export type ProjectTenderRoute =
  | { kind: "ready"; quoteId: string; budgetId: string }
  | { kind: "budget-required"; reason: "NO_BUDGET" | "BUDGET_BASIS_INVALID" };

export async function resolveProjectTenderRoute(input: {
  projectId: string;
  latestBudget: { id: string; projectId: string; assumptions: unknown } | null | undefined;
}): Promise<ProjectTenderRoute> {
  const budget = input.latestBudget;
  if (!budget) return { kind: "budget-required", reason: "NO_BUDGET" };

  const basis = readBudgetQuoteBasis(budget.assumptions);
  if (budget.projectId !== input.projectId || !basis) {
    return { kind: "budget-required", reason: "BUDGET_BASIS_INVALID" };
  }

  const quote = await prisma.quote.findUnique({
    where: { id: basis.quoteId },
    select: { id: true, projectId: true, status: true },
  });
  if (!quote || quote.projectId !== input.projectId || quote.status !== QuoteStatus.READY) {
    return { kind: "budget-required", reason: "BUDGET_BASIS_INVALID" };
  }

  return { kind: "ready", quoteId: quote.id, budgetId: budget.id };
}

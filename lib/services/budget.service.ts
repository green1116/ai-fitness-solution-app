/**
 * V59 — Budget Service
 */

import type { Prisma } from "@prisma/client";

import type { QuoteOrchestrationStepResult } from "@/lib/quote-lifecycle";
import { runBudgetEngine } from "@/lib/product-engine";
import { prisma } from "@/lib/prisma";
import { assertResourceBelongsToTenant } from "@/lib/tenancy/tenant.guard";

export type CalculateBudgetInput = {
  quoteId: string;
  companySize: number;
  budgetTier?: "low" | "mid" | "high";
  organizationId?: string;
};

type StoredQuoteContent = {
  proposal?: unknown;
  runtime?: { steps?: QuoteOrchestrationStepResult[] };
};

export async function calculateBudget(input: CalculateBudgetInput) {
  const quote = await prisma.quote.findUnique({
    where: { id: input.quoteId },
    include: { project: true },
  });

  if (!quote) {
    throw new Error("Quote not found");
  }

  if (input.organizationId) {
    assertResourceBelongsToTenant(quote.project.organizationId, input.organizationId);
  }

  const stored = quote.content as StoredQuoteContent | null;

  const engine = runBudgetEngine({
    quoteId: quote.id,
    workspaceId: quote.workspaceId,
    companySize: input.companySize,
    budgetTier: input.budgetTier ?? "mid",
    orchestrationSteps: stored?.runtime?.steps,
  });

  const budget = await prisma.budget.create({
    data: {
      projectId: quote.projectId,
      currency: engine.structure.currency,
      totalEstimateMin: engine.structure.totalMin,
      totalEstimateMax: engine.structure.totalMax,
      items: engine.structure.items as unknown as Prisma.JsonArray,
      assumptions: engine.structure.assumptions as unknown as Prisma.JsonArray,
    },
  });

  return { budget, engine, quoteContent: stored?.proposal ?? null };
}

export async function getLatestBudgetForProject(projectId: string) {
  return prisma.budget.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

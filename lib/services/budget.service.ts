/**
 * V59 — Budget Service
 */

import type { Prisma } from "@prisma/client";

import type { QuoteOrchestrationStepResult } from "@/lib/quote-lifecycle";
import { runBudgetEngine } from "@/lib/product-engine";
import { prisma } from "@/lib/prisma";

export type CalculateBudgetInput = {
  quoteId: string;
  companySize: number;
  budgetTier?: "low" | "mid" | "high";
};

export type ResolveBudgetQuoteIdInput = {
  organizationId: string;
  quoteId?: string;
  projectId?: string;
};

/** Links pass ?projectId=; calculate expects Quote.id — resolve within org. */
export async function resolveBudgetQuoteId(input: ResolveBudgetQuoteIdInput): Promise<string> {
  if (input.quoteId) {
    const byId = await prisma.quote.findFirst({
      where: { id: input.quoteId, organizationId: input.organizationId },
      select: { id: true },
    });
    if (byId) return byId.id;

    const byProjectAsId = await prisma.quote.findFirst({
      where: { projectId: input.quoteId, organizationId: input.organizationId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (byProjectAsId) return byProjectAsId.id;
  }

  if (input.projectId) {
    const byProject = await prisma.quote.findFirst({
      where: { projectId: input.projectId, organizationId: input.organizationId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (byProject) return byProject.id;
  }

  throw new Error("Quote not found");
}

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

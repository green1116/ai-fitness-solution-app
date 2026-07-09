/**
 * V59 — Tender Service (PDF 标书生成入口)
 */

import { TenderStatus, type Prisma } from "@prisma/client";

import { runTenderEngine } from "@/lib/product-engine";
import { createQuoteOrchestrator } from "@/lib/quote-lifecycle";
import { prisma } from "@/lib/prisma";

export type GenerateTenderInput = {
  projectId: string;
  quoteId: string;
  budgetId?: string;
};

export type ResolveTenderInput = {
  organizationId: string;
  projectId: string;
  quoteId?: string;
  budgetId?: string;
};

/** Links pass ?projectId= after budget; resolve quote/budget within org. */
export async function resolveTenderInput(input: ResolveTenderInput): Promise<GenerateTenderInput> {
  const project = await prisma.project.findFirst({
    where: { id: input.projectId, organizationId: input.organizationId },
    select: { id: true },
  });
  if (!project) throw new Error("Project not found");

  let quoteId = input.quoteId?.trim();
  if (quoteId) {
    const byId = await prisma.quote.findFirst({
      where: { id: quoteId, organizationId: input.organizationId },
      select: { id: true },
    });
    if (byId) {
      quoteId = byId.id;
    } else {
      const byProjectAsId = await prisma.quote.findFirst({
        where: { projectId: quoteId, organizationId: input.organizationId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      if (!byProjectAsId) throw new Error("Quote not found");
      quoteId = byProjectAsId.id;
    }
  } else {
    const latestQuote = await prisma.quote.findFirst({
      where: { projectId: input.projectId, organizationId: input.organizationId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (!latestQuote) throw new Error("Quote not found");
    quoteId = latestQuote.id;
  }

  let budgetId = input.budgetId?.trim();
  if (budgetId) {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, projectId: input.projectId },
      select: { id: true },
    });
    if (!budget) throw new Error("Budget not found");
    budgetId = budget.id;
  } else {
    const latestBudget = await prisma.budget.findFirst({
      where: { projectId: input.projectId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    budgetId = latestBudget?.id;
  }

  return { projectId: input.projectId, quoteId, budgetId };
}

export async function generateTender(input: GenerateTenderInput) {
  const [project, quote, budget] = await Promise.all([
    prisma.project.findUnique({ where: { id: input.projectId } }),
    prisma.quote.findUnique({ where: { id: input.quoteId } }),
    input.budgetId
      ? prisma.budget.findUnique({ where: { id: input.budgetId } })
      : prisma.budget.findFirst({
          where: { projectId: input.projectId },
          orderBy: { createdAt: "desc" },
        }),
  ]);

  if (!project || !quote) {
    throw new Error("Project or Quote not found");
  }

  const tender = await prisma.tender.create({
    data: {
      projectId: input.projectId,
      quoteId: input.quoteId,
      budgetId: budget?.id,
      status: TenderStatus.GENERATING,
    },
  });

  try {
    const orchestrator = createQuoteOrchestrator();
    orchestrator.run({
      context: {
        quoteId: quote.id,
        workspaceId: quote.workspaceId,
        jobId: `tender-${tender.id}`,
      },
      action: "tender.generate",
      payload: { projectId: project.id, budgetId: budget?.id },
      observedAt: new Date().toISOString(),
    });

    const engine = runTenderEngine({
      quoteId: quote.id,
      projectId: project.id,
      projectName: project.name,
      historyStore: orchestrator.historyStore,
    });

    const updated = await prisma.tender.update({
      where: { id: tender.id },
      data: {
        status: TenderStatus.READY,
        fileName: engine.artifact.fileName,
        fileUrl: `/api/pdf/tender/pack?projectId=${project.id}`,
        renderVersion: engine.artifact.renderVersion,
        metadata: engine.artifact.metadata as unknown as Prisma.JsonObject,
      },
    });

    return { tender: updated, engine };
  } catch (error) {
    await prisma.tender.update({
      where: { id: tender.id },
      data: { status: TenderStatus.FAILED },
    });
    throw error;
  }
}

export async function getTenderById(tenderId: string) {
  return prisma.tender.findUnique({
    where: { id: tenderId },
    include: { project: true, quote: true, budget: true },
  });
}

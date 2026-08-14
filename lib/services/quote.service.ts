/**
 * V59 — Quote Service
 */

import { QuoteStatus, type Prisma } from "@prisma/client";

import { runQuoteEngine, type CompanyInfoInput } from "@/lib/product-engine";
import { prisma } from "@/lib/prisma";
import { assertResourceBelongsToTenant } from "@/lib/tenancy/tenant.guard";

export type GenerateQuoteInput = {
  projectId: string;
  workspaceId: string;
  organizationId?: string;
  companyInfo: CompanyInfoInput;
};

export async function generateQuote(input: GenerateQuoteInput) {
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (input.organizationId) {
    assertResourceBelongsToTenant(project.organizationId, input.organizationId);
  }

  const draft = await prisma.quote.create({
    data: {
      projectId: input.projectId,
      workspaceId: input.workspaceId,
      organizationId: input.organizationId,
      status: QuoteStatus.GENERATING,
      companyInfo: input.companyInfo as unknown as Prisma.JsonObject,
    },
  });

  try {
    const engine = runQuoteEngine({
      quoteId: draft.id,
      workspaceId: input.workspaceId,
      companyInfo: input.companyInfo,
    });

    const updated = await prisma.quote.update({
      where: { id: draft.id },
      data: {
        status: QuoteStatus.READY,
        content: {
          proposal: engine.proposal,
          runtime: {
            orchestrationId: engine.runtime.orchestrationId,
            steps: engine.runtime.steps,
            aggregatedStatus: engine.runtime.aggregatedStatus,
          },
        } as unknown as Prisma.JsonObject,
        orchestrationId: engine.runtime.orchestrationId,
      },
    });

    return { quote: updated, engine };
  } catch (error) {
    await prisma.quote.update({
      where: { id: draft.id },
      data: { status: QuoteStatus.FAILED },
    });
    throw error;
  }
}

export async function getQuoteById(quoteId: string) {
  return prisma.quote.findUnique({
    where: { id: quoteId },
    include: { project: true },
  });
}

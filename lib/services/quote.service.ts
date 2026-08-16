/**
 * V59 — Quote Service
 */

import { QuoteStatus, type Prisma, PriceBand } from "@prisma/client";

import type { ProjectInput } from "@/lib/domain/tender";
import { runQuoteEngine, type CompanyInfoInput } from "@/lib/product-engine";
import { prisma } from "@/lib/prisma";
import { generatePlaceholders } from "@/lib/services/tender/generatePlaceholders";
import { generateSolution } from "@/lib/services/tender/generateSolution";
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

function readCompanyInfo(value: unknown): CompanyInfoInput {
  const row = (value ?? {}) as CompanyInfoInput;
  return {
    companyName: String(row.companyName ?? "").trim(),
    industry: row.industry?.trim(),
    city: row.city?.trim(),
    targetUsers:
      typeof row.targetUsers === "number" && Number.isFinite(row.targetUsers)
        ? row.targetUsers
        : undefined,
    areaM2:
      typeof row.areaM2 === "number" && Number.isFinite(row.areaM2)
        ? row.areaM2
        : undefined,
    notes: row.notes?.trim(),
  };
}

function projectInputFromQuote(input: {
  project: {
    name: string;
    clientName: string | null;
    industry: string | null;
    siteType: ProjectInput["siteType"];
    areaM2: number | null;
    targetUsers: number | null;
    city: string | null;
    budgetLevel: ProjectInput["budgetLevel"];
    deliveryMode: ProjectInput["deliveryMode"];
    notes: string | null;
  };
  companyInfo: CompanyInfoInput;
}): ProjectInput {
  const company =
    input.companyInfo.companyName ||
    input.project.clientName?.trim() ||
    "示例企业";
  const industry =
    input.companyInfo.industry || input.project.industry?.trim() || "enterprise";
  const targetUsers =
    input.companyInfo.targetUsers && input.companyInfo.targetUsers > 0
      ? Math.floor(input.companyInfo.targetUsers)
      : input.project.targetUsers && input.project.targetUsers > 0
        ? input.project.targetUsers
        : 200;
  const areaM2 =
    input.companyInfo.areaM2 && input.companyInfo.areaM2 > 0
      ? input.companyInfo.areaM2
      : input.project.areaM2 && input.project.areaM2 > 0
        ? input.project.areaM2
        : 120;
  return {
    name: `${company}员工健身空间建设项目`,
    clientName: company,
    industry,
    siteType: input.project.siteType,
    areaM2,
    targetUsers,
    city: input.companyInfo.city || input.project.city?.trim() || "上海市",
    budgetLevel: input.project.budgetLevel,
    deliveryMode: input.project.deliveryMode,
    notes: input.companyInfo.notes || input.project.notes || undefined,
  };
}

export async function ensureQuotePlanPdfSource(quoteId: string) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      project: { include: { solution: true, placeholders: true } },
    },
  });
  if (!quote?.project) {
    throw new Error("Project not found");
  }

  const projectInput = projectInputFromQuote({
    project: quote.project,
    companyInfo: readCompanyInfo(quote.companyInfo),
  });

  await prisma.project.update({
    where: { id: quote.project.id },
    data: {
      name: projectInput.name,
      clientName: projectInput.clientName,
      industry: projectInput.industry,
      areaM2: projectInput.areaM2,
      targetUsers: projectInput.targetUsers,
      city: projectInput.city,
      notes: projectInput.notes,
    },
  });

  if (!quote.project.solution) {
    const solutionData = generateSolution(projectInput);
    await prisma.solution.create({
      data: {
        projectId: quote.project.id,
        summary: solutionData.summary,
        background: solutionData.background,
        requirements: solutionData.requirements as unknown as Prisma.JsonArray,
        objectives: solutionData.objectives as unknown as Prisma.JsonArray,
        zoning: solutionData.zoning as unknown as Prisma.JsonArray,
        implementationPlan:
          solutionData.implementationPlan as unknown as Prisma.JsonArray,
        operationsPlan: solutionData.operationsPlan as unknown as Prisma.JsonArray,
        riskControl: solutionData.riskControl as unknown as Prisma.JsonArray,
        acceptanceCriteria:
          solutionData.acceptanceCriteria as unknown as Prisma.JsonArray,
      },
    });
  }

  if (quote.project.placeholders.length === 0) {
    const placeholdersData = generatePlaceholders(quote.project.id, projectInput);
    for (const item of placeholdersData) {
      await prisma.productPlaceholder.create({
        data: {
          projectId: quote.project.id,
          category: item.category,
          subCategory: item.subCategory,
          specTags: item.specTags as unknown as Prisma.JsonArray,
          quantity: item.quantity,
          priceBand: item.priceBand as PriceBand,
          recommendationReason: item.recommendationReason,
          replaceable: item.replaceable,
          skuId: item.skuId,
          skuName: item.skuName,
          brand: item.brand,
          model: item.model,
          imageUrl: item.imageUrl,
        },
      });
    }
  }

  const project = await prisma.project.findUnique({
    where: { id: quote.project.id },
    include: { solution: true, placeholders: true },
  });
  if (!project?.solution) {
    throw new Error("Solution not found");
  }
  return project;
}

/**
 * V59 — Quote Service
 */

import { QuoteStatus, type Prisma } from "@prisma/client";

import type { ProjectInput } from "@/lib/domain/tender";
import {
  applyQuoteRevisionOverrides,
  runQuoteEngine,
  type CompanyInfoInput,
} from "@/lib/product-engine";
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

  const companyInfo = applyQuoteRevisionOverrides(input.companyInfo);

  const draft = await prisma.quote.create({
    data: {
      projectId: input.projectId,
      workspaceId: input.workspaceId,
      organizationId: input.organizationId,
      status: QuoteStatus.GENERATING,
      companyInfo: companyInfo as unknown as Prisma.JsonObject,
    },
  });

  try {
    const engine = runQuoteEngine({
      quoteId: draft.id,
      workspaceId: input.workspaceId,
      companyInfo,
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
  return applyQuoteRevisionOverrides({
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
  });
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
  const companyInfo = applyQuoteRevisionOverrides(input.companyInfo);
  const company =
    companyInfo.companyName ||
    input.project.clientName?.trim() ||
    "示例企业";
  const industry =
    companyInfo.industry || input.project.industry?.trim() || "enterprise";
  const targetUsers =
    companyInfo.targetUsers && companyInfo.targetUsers > 0
      ? Math.floor(companyInfo.targetUsers)
      : input.project.targetUsers && input.project.targetUsers > 0
        ? input.project.targetUsers
        : undefined;
  const areaM2 =
    companyInfo.areaM2 && companyInfo.areaM2 > 0
      ? companyInfo.areaM2
      : input.project.areaM2 && input.project.areaM2 > 0
        ? input.project.areaM2
        : 120;
  return {
    name: `${company}员工健身空间建设项目`,
    clientName: company,
    industry,
    siteType: input.project.siteType,
    areaM2,
    ...(targetUsers != null ? { targetUsers } : {}),
    city: companyInfo.city || input.project.city?.trim() || "上海市",
    budgetLevel: input.project.budgetLevel,
    deliveryMode: input.project.deliveryMode,
    notes: companyInfo.notes || input.project.notes || undefined,
  };
}

export async function ensureQuotePlanPdfSource(quoteId: string) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      project: true,
    },
  });
  if (!quote?.project) {
    throw new Error("Project not found");
  }

  const projectInput = projectInputFromQuote({
    project: quote.project,
    companyInfo: readCompanyInfo(quote.companyInfo),
  });

  // Build PDF source in memory from this quote's inputs.
  // Do not delete/overwrite project-level Solution or ProductPlaceholder rows.
  const now = new Date();
  const solutionData = generateSolution(projectInput);
  const placeholdersData = generatePlaceholders(quote.project.id, projectInput);

  const solution = {
    id: `quote-pdf-solution-${quote.id}`,
    projectId: quote.project.id,
    summary: solutionData.summary,
    background: solutionData.background,
    requirements: solutionData.requirements,
    objectives: solutionData.objectives,
    zoning: solutionData.zoning,
    implementationPlan: solutionData.implementationPlan,
    operationsPlan: solutionData.operationsPlan,
    riskControl: solutionData.riskControl,
    acceptanceCriteria: solutionData.acceptanceCriteria,
    createdAt: now,
    updatedAt: now,
  };

  const placeholders = placeholdersData.map((item, index) => ({
    id: item.id || `quote-pdf-ph-${quote.id}-${index + 1}`,
    projectId: quote.project.id,
    category: item.category,
    subCategory: item.subCategory ?? null,
    specTags: item.specTags,
    quantity: item.quantity,
    priceBand: item.priceBand,
    recommendationReason: item.recommendationReason,
    replaceable: item.replaceable,
    skuId: item.skuId ?? null,
    skuName: item.skuName ?? null,
    brand: item.brand ?? null,
    model: item.model ?? null,
    imageUrl: item.imageUrl ?? null,
    createdAt: now,
    updatedAt: now,
  }));

  return {
    ...quote.project,
    name: projectInput.name,
    clientName: projectInput.clientName ?? null,
    industry: projectInput.industry ?? null,
    areaM2: projectInput.areaM2 ?? null,
    targetUsers: projectInput.targetUsers ?? null,
    city: projectInput.city ?? null,
    notes: projectInput.notes ?? null,
    solution,
    placeholders,
  };
}

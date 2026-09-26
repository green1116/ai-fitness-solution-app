/**
 * V59 — Quote Service
 */

import { QuoteStatus, type Prisma } from "@prisma/client";

import type { ProjectInput } from "@/lib/domain/tender";
import {
  applyProductSelections,
  applyQuoteRevisionOverrides,
  buildCandidateSlots,
  buildProductIntelligenceSnapshot,
  readStoredProductIntelligence,
  readStoredProductSelections,
  resolveProductSelectionInputs,
  runQuoteEngine,
  type CompanyInfoInput,
  type ProductCandidateSlot,
  type ProductSelection,
  classifyRequirements,
  type RequirementStatusItem,
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
  const { productSelections, ...engineCompanyInfo } = companyInfo;

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
      companyInfo: engineCompanyInfo,
    });

    const projectInput = projectInputFromQuote({ project, companyInfo });
    const productIntelligence = buildProductIntelligenceSnapshot({
      notes: projectInput.notes,
      templatePlaceholders: generatePlaceholders(project.id, projectInput),
      selections: productSelections,
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
          productIntelligence,
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
  const productSelections = readStoredProductSelections(row.productSelections);
  return applyQuoteRevisionOverrides({
    ...(productSelections.length > 0 ? { productSelections } : {}),
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

  const companyInfo = readCompanyInfo(quote.companyInfo);
  const projectInput = projectInputFromQuote({
    project: quote.project,
    companyInfo,
  });

  // Build PDF source in memory from this quote's inputs.
  // Do not delete/overwrite project-level Solution or ProductPlaceholder rows.
  const now = new Date();
  const solutionData = generateSolution(projectInput);
  const selected = applyProductSelections(
    generatePlaceholders(quote.project.id, projectInput),
    companyInfo.productSelections,
  );
  if (selected.warnings.length > 0) {
    console.warn("[quote/pdf] product selection warnings", quote.id, selected.warnings);
  }
  const placeholdersData = selected.placeholders;

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

export type QuoteHistoryItem = {
  id: string;
  createdAt: string;
  status: QuoteStatus;
  isLatest: boolean;
  areaM2?: number;
  notes?: string;
  selectionCount?: number;
  summary: string;
};

function summarizeQuoteCompanyInfo(value: unknown): {
  areaM2?: number;
  notes?: string;
  selectionCount?: number;
  summary: string;
} {
  const companyInfo = readCompanyInfo(value);
  const selectionCount = companyInfo.productSelections?.length ?? 0;
  const parts: string[] = [];
  if (companyInfo.areaM2 != null && companyInfo.areaM2 > 0) {
    parts.push(`${companyInfo.areaM2}㎡`);
  }
  if (companyInfo.notes) {
    const notes =
      companyInfo.notes.length > 48
        ? `${companyInfo.notes.slice(0, 48)}…`
        : companyInfo.notes;
    parts.push(notes);
  }
  if (selectionCount > 0) {
    parts.push(`候选配置 ${selectionCount} 项`);
  }
  return {
    ...(companyInfo.areaM2 != null && companyInfo.areaM2 > 0
      ? { areaM2: companyInfo.areaM2 }
      : {}),
    ...(companyInfo.notes ? { notes: companyInfo.notes } : {}),
    ...(selectionCount > 0 ? { selectionCount } : {}),
    summary: parts.join(" · ") || "无补充要求",
  };
}

export async function listQuotesForProject(input: {
  projectId: string;
  organizationId: string;
}): Promise<QuoteHistoryItem[]> {
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    select: { id: true, organizationId: true },
  });
  if (!project) {
    throw new Error("Project not found");
  }
  assertResourceBelongsToTenant(project.organizationId, input.organizationId);

  const quotes = await prisma.quote.findMany({
    where: {
      projectId: input.projectId,
      status: QuoteStatus.READY,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      status: true,
      companyInfo: true,
    },
  });

  return quotes.map((quote, index) => {
    const snap = summarizeQuoteCompanyInfo(quote.companyInfo);
    return {
      id: quote.id,
      createdAt: quote.createdAt.toISOString(),
      status: quote.status,
      isLatest: index === 0,
      ...(snap.areaM2 != null ? { areaM2: snap.areaM2 } : {}),
      ...(snap.notes ? { notes: snap.notes } : {}),
      ...(snap.selectionCount ? { selectionCount: snap.selectionCount } : {}),
      summary: snap.summary,
    };
  });
}

export type QuoteProductIntelligenceView = {
  quoteId: string;
  snapshotSource: "stored" | "computed";
  requirements: RequirementStatusItem[];
  slots: ProductCandidateSlot[];
  selections: ProductSelection[];
  warnings: string[];
};

async function loadReadyQuoteForTenant(quoteId: string, organizationId: string) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { project: true },
  });
  if (!quote?.project) {
    throw new Error("Quote not found");
  }
  assertResourceBelongsToTenant(
    quote.organizationId ?? quote.project.organizationId,
    organizationId,
  );
  if (quote.status !== QuoteStatus.READY) {
    throw new Error("Quote is not READY");
  }
  return quote;
}

/** Read-only: requirement status + reference candidates + current selections. */
export async function getQuoteProductIntelligence(input: {
  quoteId: string;
  organizationId: string;
}): Promise<QuoteProductIntelligenceView> {
  const quote = await loadReadyQuoteForTenant(input.quoteId, input.organizationId);
  const companyInfo = readCompanyInfo(quote.companyInfo);
  const projectInput = projectInputFromQuote({ project: quote.project, companyInfo });
  const templatePlaceholders = generatePlaceholders(quote.project.id, projectInput);
  const selections = companyInfo.productSelections ?? [];
  const applied = applyProductSelections(templatePlaceholders, selections);

  const stored = readStoredProductIntelligence(
    (quote.content as { productIntelligence?: unknown } | null)?.productIntelligence,
  );
  return {
    quoteId: quote.id,
    snapshotSource: stored ? "stored" : "computed",
    requirements: stored?.requirements ?? classifyRequirements(projectInput.notes),
    slots: stored?.slots ?? buildCandidateSlots(templatePlaceholders),
    selections,
    warnings: applied.warnings,
  };
}

/**
 * Save professional selections as a NEW Quote version.
 * The base Quote is only read; its companyInfo/content are never updated.
 */
export async function createQuoteVersionWithSelections(input: {
  baseQuoteId: string;
  organizationId: string;
  selections: unknown;
  decidedBy?: string;
}) {
  const base = await loadReadyQuoteForTenant(input.baseQuoteId, input.organizationId);
  const baseCompanyInfo = readCompanyInfo(base.companyInfo);
  const projectInput = projectInputFromQuote({
    project: base.project,
    companyInfo: baseCompanyInfo,
  });
  const slots = buildCandidateSlots(
    generatePlaceholders(base.project.id, projectInput),
  );
  const productSelections = resolveProductSelectionInputs({
    inputs: input.selections,
    slots,
    decidedAt: new Date().toISOString(),
    decidedBy: input.decidedBy,
  });

  const nextCompanyInfo: CompanyInfoInput = { ...baseCompanyInfo };
  delete nextCompanyInfo.productSelections;
  if (productSelections.length > 0) {
    nextCompanyInfo.productSelections = productSelections;
  }
  return generateQuote({
    projectId: base.projectId,
    workspaceId: base.workspaceId,
    organizationId: input.organizationId,
    companyInfo: nextCompanyInfo,
  });
}

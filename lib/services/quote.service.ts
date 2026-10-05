/**
 * V59 — Quote Service
 */

import { QuoteStatus, type Prisma } from "@prisma/client";

import type { ProjectInput } from "@/lib/domain/tender";
import {
  applyProductSelections,
  applyQuoteRevisionOverrides,
  buildCandidateSlots,
  buildProcurementCandidateOptions,
  buildProductIntelligenceSnapshot,
  mergeProcurementCandidates,
  parseProcurementCandidateId,
  PROCUREMENT_CANDIDATE_ID_PREFIX,
  PRODUCT_SLOT_CATEGORIES,
  productSlotKey,
  readStoredProductIntelligence,
  readStoredProductSelections,
  resolveProductSelectionInputs,
  runQuoteEngine,
  type CompanyInfoInput,
  type ProcurementCandidateOption,
  type ProductCandidateSlot,
  type ProductSelection,
  classifyRequirements,
  type RequirementStatusItem,
} from "@/lib/product-engine";
import {
  analyzeConfigurationStrategy,
  CONFIGURATION_STRATEGY_VERSION,
  type ConfigurationAnalysis,
} from "@/lib/product-engine/configuration-strategy";
import { resolveCanonicalHeadcount } from "@/lib/product-engine/quote-revision";
import { prisma } from "@/lib/prisma";
import { listActiveProcurementProductRecords } from "@/lib/services/procurement-product.service";
import { generateSolution } from "@/lib/services/tender/generateSolution";
import {
  buildPlaceholders,
  QUANTITY_MODEL_PER_USER_V2,
  resolveQuoteQuantityModel,
} from "@/lib/templates/placeholderTemplates";
import { assertResourceBelongsToTenant } from "@/lib/tenancy/tenant.guard";

export const QUOTE_PROJECT_MISMATCH = "QUOTE_PROJECT_MISMATCH";

/** The Quote exists in the tenant but does not belong to the requested project. */
export class QuoteProjectMismatchError extends Error {
  readonly code = QUOTE_PROJECT_MISMATCH;

  constructor() {
    super("Quote does not belong to the requested project");
    this.name = "QuoteProjectMismatchError";
  }
}

/** Call only after the tenant check, so a mismatch never reveals another tenant's data. */
export function assertQuoteBelongsToProject(
  quote: { projectId: string; project: { organizationId: string | null } },
  projectId: string,
  organizationId: string,
): void {
  const expected = projectId.trim();
  if (
    !expected ||
    quote.projectId !== expected ||
    quote.project.organizationId !== organizationId
  ) {
    throw new QuoteProjectMismatchError();
  }
}

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

  const revisedCompanyInfo = applyQuoteRevisionOverrides(input.companyInfo);
  // Same resolved headcount as requirement analysis; structured targetUsers stays authoritative.
  const headcount = resolveCanonicalHeadcount({
    targetUsers: revisedCompanyInfo.targetUsers,
    projectTargetUsers: project.targetUsers,
    notes: revisedCompanyInfo.notes || project.notes,
  });
  const companyInfo: CompanyInfoInput =
    headcount && headcount.source !== "quote"
      ? { ...revisedCompanyInfo, targetUsers: headcount.value }
      : revisedCompanyInfo;
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
    const projectInput = projectInputFromQuote({ project, companyInfo });
    const templatePlaceholders = buildPlaceholders(project.id, projectInput, {
      quantityModel: QUANTITY_MODEL_PER_USER_V2,
    });
    const engine = runQuoteEngine({
      quoteId: draft.id,
      workspaceId: input.workspaceId,
      companyInfo: engineCompanyInfo,
      equipment: applyProductSelections(templatePlaceholders, productSelections)
        .placeholders,
    });

    const productIntelligence = buildProductIntelligenceSnapshot({
      notes: projectInput.notes,
      templatePlaceholders,
      selections: productSelections,
    });
    const configurationStrategy = analyzeConfigurationStrategy({
      companyInfo: revisedCompanyInfo,
      project,
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
          configurationStrategy,
          quantityModel: QUANTITY_MODEL_PER_USER_V2,
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

/** Pre-generation requirement check: reads the Project only; creates no Quote. */
export async function analyzeQuoteRequirements(input: {
  projectId: string;
  organizationId: string;
  companyInfo: CompanyInfoInput;
}) {
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  assertResourceBelongsToTenant(project.organizationId, input.organizationId);

  const analysis = analyzeConfigurationStrategy({
    companyInfo: applyQuoteRevisionOverrides(input.companyInfo),
    project,
  });

  return {
    missingCriticalInfo: analysis.missingCriticalInfo,
    conflicts: analysis.configurationStrategy.conflicts,
  };
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
        : undefined;
  return {
    name: `${company}员工健身空间建设项目`,
    clientName: company,
    industry,
    siteType: input.project.siteType,
    ...(areaM2 != null ? { areaM2 } : {}),
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
  return buildQuotePlanPdfSource(quote);
}

/** Plan source for project-level delivery (Tender ZIP): only a READY quote of the same project. */
export async function findQuotePlanPdfSourceForProject(
  quoteId: string,
  projectId: string,
) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { project: true },
  });
  if (
    !quote?.project ||
    quote.projectId !== projectId ||
    quote.status !== QuoteStatus.READY
  ) {
    return null;
  }
  return buildQuotePlanPdfSource(quote);
}

export function buildQuotePlanPdfSource(
  quote: Prisma.QuoteGetPayload<{ include: { project: true } }>,
) {
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
    buildPlaceholders(quote.project.id, projectInput, {
      quantityModel: resolveQuoteQuantityModel(quote.content),
    }),
    companyInfo.productSelections,
  );
  if (selected.warnings.length > 0) {
    console.warn("[quote/pdf] product selection warnings", quote.id, selected.warnings);
  }
  const placeholdersData = selected.placeholders;
  const confirmedQuantitySlots = new Set(
    (companyInfo.productSelections ?? [])
      .filter(
        (s) =>
          s.action !== "remove" &&
          s.quantity != null &&
          !(s.action === "replace" && !s.candidate),
      )
      .map((s) => s.slotKey),
  );

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
    productSource: item.productSource ?? null,
    quantityConfirmed:
      PRODUCT_SLOT_CATEGORIES.some((c) => c === item.category) &&
      confirmedQuantitySlots.has(productSlotKey(item.category, item.subCategory)),
    priceVerified: Boolean(item.brand?.trim() && item.model?.trim() && item.priceFact),
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
  /** Persisted `Quote.content.configurationStrategy`; null for Quotes generated before it existed. */
  configurationStrategy: ConfigurationAnalysis | null;
};

/** Read-only view of the stored analysis; never recomputed, never written. */
export function readStoredConfigurationAnalysis(value: unknown): ConfigurationAnalysis | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<ConfigurationAnalysis>;
  if (row.version !== CONFIGURATION_STRATEGY_VERSION) return null;
  if (!row.configurationStrategy || typeof row.configurationStrategy !== "object") return null;
  return {
    version: row.version,
    analyzedAt: typeof row.analyzedAt === "string" ? row.analyzedAt : "",
    missingCriticalInfo: Array.isArray(row.missingCriticalInfo) ? row.missingCriticalInfo : [],
    configurationStrategy: row.configurationStrategy,
  };
}

async function loadReadyQuoteForTenant(
  quoteId: string,
  organizationId: string,
  projectId: string,
) {
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
  assertQuoteBelongsToProject(quote, projectId, organizationId);
  if (quote.status !== QuoteStatus.READY) {
    throw new Error("Quote is not READY");
  }
  return quote;
}

/** Read-only: requirement status + reference candidates + current selections. */
export async function getQuoteProductIntelligence(input: {
  quoteId: string;
  organizationId: string;
  projectId: string;
}): Promise<QuoteProductIntelligenceView> {
  const quote = await loadReadyQuoteForTenant(
    input.quoteId,
    input.organizationId,
    input.projectId,
  );
  const companyInfo = readCompanyInfo(quote.companyInfo);
  const projectInput = projectInputFromQuote({ project: quote.project, companyInfo });
  const templatePlaceholders = buildPlaceholders(quote.project.id, projectInput, {
    quantityModel: resolveQuoteQuantityModel(quote.content),
  });
  const selections = companyInfo.productSelections ?? [];
  const applied = applyProductSelections(templatePlaceholders, selections);

  const content = quote.content as {
    productIntelligence?: unknown;
    configurationStrategy?: unknown;
  } | null;
  const stored = readStoredProductIntelligence(content?.productIntelligence);
  const baseSlots = stored?.slots ?? buildCandidateSlots(templatePlaceholders);
  const procurementWarnings: string[] = [];
  let procurementOptions: ProcurementCandidateOption[] = [];
  try {
    procurementOptions = buildProcurementCandidateOptions(
      await listActiveProcurementProductRecords(input.organizationId),
      baseSlots,
    );
  } catch (err) {
    // Read-only view: selected procurement snapshots below stay visible; saving is unaffected.
    console.error("[quote/product-intelligence] procurement products unavailable", err);
    procurementWarnings.push("采购库产品暂时无法加载，当前仅显示参考候选与已选配置");
  }
  return {
    quoteId: quote.id,
    snapshotSource: stored ? "stored" : "computed",
    requirements: stored?.requirements ?? classifyRequirements(projectInput.notes),
    slots: mergeProcurementCandidates(baseSlots, procurementOptions, selections),
    selections,
    warnings: [...applied.warnings, ...procurementWarnings],
    configurationStrategy: readStoredConfigurationAnalysis(content?.configurationStrategy),
  };
}

/**
 * Current procurement options needed to resolve `inputs`; ids already satisfied by the base
 * Quote's stored snapshot (same slot + candidateId) never query current master data.
 */
async function loadProcurementOptionsForInputs(input: {
  organizationId: string;
  inputs: unknown;
  retained: ProductSelection[];
  slots: ProductCandidateSlot[];
}): Promise<ProcurementCandidateOption[]> {
  if (!Array.isArray(input.inputs)) return [];
  const productIds = new Set<string>();
  for (const raw of input.inputs) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const candidateId = typeof row.candidateId === "string" ? row.candidateId.trim() : "";
    if (!candidateId.startsWith(PROCUREMENT_CANDIDATE_ID_PREFIX)) continue;
    const slotKey = typeof row.slotKey === "string" ? row.slotKey.trim() : "";
    const retained = input.retained.some(
      (s) => s.slotKey === slotKey && s.candidate?.candidateId === candidateId,
    );
    const parsed = retained ? null : parseProcurementCandidateId(candidateId);
    if (parsed) productIds.add(parsed.productId);
  }
  if (productIds.size === 0) return [];
  return buildProcurementCandidateOptions(
    await listActiveProcurementProductRecords(input.organizationId, Array.from(productIds)),
    input.slots,
  );
}

/**
 * Save professional selections as a NEW Quote version.
 * The base Quote is only read; its companyInfo/content are never updated.
 */
export async function createQuoteVersionWithSelections(input: {
  baseQuoteId: string;
  organizationId: string;
  projectId: string;
  selections: unknown;
  decidedBy?: string;
}) {
  const base = await loadReadyQuoteForTenant(
    input.baseQuoteId,
    input.organizationId,
    input.projectId,
  );
  const baseCompanyInfo = readCompanyInfo(base.companyInfo);
  const projectInput = projectInputFromQuote({
    project: base.project,
    companyInfo: baseCompanyInfo,
  });
  const slots = buildCandidateSlots(
    buildPlaceholders(base.project.id, projectInput, {
      quantityModel: resolveQuoteQuantityModel(base.content),
    }),
  );
  const retained = baseCompanyInfo.productSelections ?? [];
  const productSelections = resolveProductSelectionInputs({
    inputs: input.selections,
    slots,
    decidedAt: new Date().toISOString(),
    decidedBy: input.decidedBy,
    procurement: {
      options: await loadProcurementOptionsForInputs({
        organizationId: input.organizationId,
        inputs: input.selections,
        retained,
        slots,
      }),
      retained,
    },
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

/**
 * Requirement revision → NEW Quote version based on an explicit READY base Quote.
 * Revised requirements come from `companyInfo`; productSelections are carried over exactly as
 * stored on the base (no re-validation, no catalog re-read). The base Quote is only read.
 */
export async function generateQuoteRevision(input: {
  baseQuoteId: string;
  projectId: string;
  workspaceId: string;
  organizationId: string;
  companyInfo: CompanyInfoInput;
}) {
  const base = await loadReadyQuoteForTenant(
    input.baseQuoteId,
    input.organizationId,
    input.projectId,
  );
  const inherited = readCompanyInfo(base.companyInfo).productSelections ?? [];

  const nextCompanyInfo: CompanyInfoInput = { ...input.companyInfo };
  delete nextCompanyInfo.productSelections;
  if (inherited.length > 0) {
    nextCompanyInfo.productSelections = inherited;
  }
  return generateQuote({
    projectId: input.projectId,
    workspaceId: input.workspaceId,
    organizationId: input.organizationId,
    companyInfo: nextCompanyInfo,
  });
}

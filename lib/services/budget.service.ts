/**
 * V59 — Budget Service (Quote-linked equipment calculation)
 */

import type { Prisma } from "@prisma/client";

import type { ProjectInput } from "@/lib/domain/tender";
import {
  applyProductSelections,
  applyQuoteRevisionOverrides,
  readStoredProductSelections,
  type CompanyInfoInput,
} from "@/lib/product-engine";
import type { BudgetStructure } from "@/lib/product-engine/types";
import type { QuoteOrchestrationStepResult } from "@/lib/quote-lifecycle";
import { prisma } from "@/lib/prisma";
import { generateBudget } from "@/lib/services/tender/generateBudget";
import { generatePlaceholders } from "@/lib/services/tender/generatePlaceholders";
import { assertResourceBelongsToTenant } from "@/lib/tenancy/tenant.guard";

export type BudgetTier = "low" | "mid" | "high";

export type CalculateBudgetInput = {
  quoteId: string;
  /** Compatibility fallback only when Quote has no usable targetUsers. */
  companySize?: number;
  budgetTier?: BudgetTier;
  organizationId?: string;
};

export type BudgetCalculationBasis = {
  quoteId: string;
  targetUsers?: number;
  areaM2?: number;
  notes?: string;
  budgetTier: BudgetTier;
  headcountSource: "quote" | "fallback";
};

type StoredQuoteContent = {
  proposal?: unknown;
  runtime?: { steps?: QuoteOrchestrationStepResult[] };
};

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

/** Same semantics as Quote PDF projectInputFromQuote (local copy; no quote.service export). */
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
  /** Only applied when Quote/project have no usable targetUsers. */
  fallbackCompanySize?: number;
}): ProjectInput {
  const companyInfo = applyQuoteRevisionOverrides(input.companyInfo);
  const company =
    companyInfo.companyName ||
    input.project.clientName?.trim() ||
    "示例企业";
  const industry =
    companyInfo.industry || input.project.industry?.trim() || "enterprise";
  const quoteUsers =
    companyInfo.targetUsers && companyInfo.targetUsers > 0
      ? Math.floor(companyInfo.targetUsers)
      : input.project.targetUsers && input.project.targetUsers > 0
        ? input.project.targetUsers
        : undefined;
  const fallbackUsers =
    typeof input.fallbackCompanySize === "number" &&
    Number.isFinite(input.fallbackCompanySize) &&
    input.fallbackCompanySize > 0
      ? Math.floor(input.fallbackCompanySize)
      : undefined;
  const targetUsers = quoteUsers ?? fallbackUsers;
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

function rollupCategorySubtotals(
  items: Array<{
    category: string;
    subtotalMin: number;
    subtotalMax: number;
  }>,
): Array<{ category: string; min: number; max: number }> {
  const map = new Map<string, { min: number; max: number }>();
  for (const item of items) {
    const key = item.category.trim() || "其他";
    const prev = map.get(key) ?? { min: 0, max: 0 };
    map.set(key, {
      min: prev.min + item.subtotalMin,
      max: prev.max + item.subtotalMax,
    });
  }
  return Array.from(map.entries()).map(([category, range]) => ({
    category,
    min: Math.round(range.min),
    max: Math.round(range.max),
  }));
}

export async function calculateBudget(input: CalculateBudgetInput) {
  const quote = await prisma.quote.findUnique({
    where: { id: input.quoteId },
    include: { project: true },
  });

  if (!quote?.project) {
    throw new Error("Quote not found");
  }

  if (input.organizationId) {
    assertResourceBelongsToTenant(
      quote.project.organizationId,
      input.organizationId,
    );
  }

  const budgetTier: BudgetTier = input.budgetTier ?? "mid";
  const companyInfo = readCompanyInfo(quote.companyInfo);
  const projectInput = projectInputFromQuote({
    project: quote.project,
    companyInfo,
    fallbackCompanySize: input.companySize,
  });

  const headcountSource: BudgetCalculationBasis["headcountSource"] =
    (companyInfo.targetUsers && companyInfo.targetUsers > 0) ||
    (quote.project.targetUsers && quote.project.targetUsers > 0)
      ? "quote"
      : "fallback";

  // In-memory only — do not persist Solution / ProductPlaceholder.
  const selected = applyProductSelections(
    generatePlaceholders(quote.project.id, projectInput),
    companyInfo.productSelections,
  );
  const placeholders = selected.placeholders;
  const generated = generateBudget(quote.project.id, placeholders, {
    priceBand: budgetTier,
  });
  const selectionAssumptions =
    selected.appliedCount > 0 || selected.warnings.length > 0
      ? [
          `已应用方案候选配置 ${selected.appliedCount} 项（参考候选 / 未核实；不引入 SKU 价格，单价仍按预算档位）`,
          ...selected.warnings,
        ]
      : [];

  const categorySubtotals = rollupCategorySubtotals(generated.items);
  const stored = quote.content as StoredQuoteContent | null;
  const statusStep = stored?.runtime?.steps?.find((s) => s.step === "status");
  const syncedStatus = statusStep?.status ?? "synced";

  const structure: BudgetStructure & {
    totalEstimateMin: number;
    totalEstimateMax: number;
    categorySubtotals: Array<{ category: string; min: number; max: number }>;
    detailedItems: typeof generated.items;
  } = {
    currency: generated.currency,
    totalMin: Math.round(generated.totalEstimateMin),
    totalMax: Math.round(generated.totalEstimateMax),
    totalEstimateMin: Math.round(generated.totalEstimateMin),
    totalEstimateMax: Math.round(generated.totalEstimateMax),
    items: categorySubtotals,
    categorySubtotals,
    detailedItems: generated.items,
    assumptions: [
      ...generated.assumptions,
      `基于 quoteId=${quote.id} 的方案器材配置估算`,
      `预算档位（设备单价品质）：${budgetTier}`,
      `方案人数：${projectInput.targetUsers ?? "未提供"}`,
      `方案面积：${projectInput.areaM2 ?? "未提供"}㎡`,
      ...(projectInput.notes
        ? [`方案要求：${projectInput.notes}`]
        : []),
      ...selectionAssumptions,
      `Status Sync：${syncedStatus}`,
    ],
  };

  const basis: BudgetCalculationBasis = {
    quoteId: quote.id,
    ...(projectInput.targetUsers != null
      ? { targetUsers: projectInput.targetUsers }
      : {}),
    ...(projectInput.areaM2 != null ? { areaM2: projectInput.areaM2 } : {}),
    ...(projectInput.notes ? { notes: projectInput.notes } : {}),
    budgetTier,
    headcountSource,
  };

  const budget = await prisma.budget.create({
    data: {
      projectId: quote.projectId,
      currency: generated.currency,
      totalEstimateMin: structure.totalEstimateMin,
      totalEstimateMax: structure.totalEstimateMax,
      items: generated.items as unknown as Prisma.JsonArray,
      assumptions: structure.assumptions as unknown as Prisma.JsonArray,
    },
  });

  return {
    budget,
    engine: { structure, syncedStatus },
    basis,
    quoteContent: stored?.proposal ?? null,
  };
}

export async function getLatestBudgetForProject(projectId: string) {
  return prisma.budget.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

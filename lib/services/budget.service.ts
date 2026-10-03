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
import {
  isProductSlotCategory,
  productSlotKey,
} from "@/lib/product-engine/product-intelligence";
import type { BudgetStructure } from "@/lib/product-engine/types";
import type { QuoteOrchestrationStepResult } from "@/lib/quote-lifecycle";
import { prisma } from "@/lib/prisma";
import { generateBudget } from "@/lib/services/tender/generateBudget";
import { assertQuoteBelongsToProject } from "@/lib/services/quote.service";
import {
  buildPlaceholders,
  resolveQuoteQuantityModel,
} from "@/lib/templates/placeholderTemplates";
import { assertResourceBelongsToTenant } from "@/lib/tenancy/tenant.guard";

export type BudgetTier = "low" | "mid" | "high";

export type CalculateBudgetInput = {
  quoteId: string;
  /** Compatibility fallback only when Quote has no usable targetUsers. */
  companySize?: number;
  budgetTier?: BudgetTier;
  organizationId?: string;
  /** Optional for API compatibility; when provided the Quote must belong to it. */
  projectId?: string;
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

const QUOTE_BASIS_PREFIX = "基于 quoteId=";
const QUOTE_BASIS_SUFFIX = " 的方案器材配置估算";
const BUDGET_TIER_PREFIX = "预算档位（设备单价品质）：";

/** Reads the quote/tier basis that `calculateBudget` writes into `Budget.assumptions`. */
export function readBudgetQuoteBasis(
  assumptions: unknown,
): { quoteId: string; budgetTier?: BudgetTier } | null {
  if (!Array.isArray(assumptions)) return null;
  let quoteId = "";
  let budgetTier: BudgetTier | undefined;
  for (const line of assumptions) {
    if (typeof line !== "string") continue;
    if (line.startsWith(QUOTE_BASIS_PREFIX) && line.endsWith(QUOTE_BASIS_SUFFIX)) {
      quoteId = line
        .slice(QUOTE_BASIS_PREFIX.length, line.length - QUOTE_BASIS_SUFFIX.length)
        .trim();
    } else if (line.startsWith(BUDGET_TIER_PREFIX)) {
      const tier = line.slice(BUDGET_TIER_PREFIX.length).trim();
      if (tier === "low" || tier === "mid" || tier === "high") budgetTier = tier;
    }
  }
  if (!quoteId) return null;
  return { quoteId, ...(budgetTier ? { budgetTier } : {}) };
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
    if (input.projectId?.trim()) {
      assertQuoteBelongsToProject(quote, input.projectId, input.organizationId);
    }
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
    buildPlaceholders(quote.project.id, projectInput, {
      quantityModel: resolveQuoteQuantityModel(quote.content),
    }),
    companyInfo.productSelections,
  );
  const placeholders = selected.placeholders;
  const generated = generateBudget(quote.project.id, placeholders, {
    priceBand: budgetTier,
  });
  const hasVerifiedPrice = placeholders.some((p) => p.priceFact != null);
  const selectionAssumptions =
    selected.appliedCount > 0 || selected.warnings.length > 0
      ? [
          hasVerifiedPrice
            ? `已应用方案候选配置 ${selected.appliedCount} 项（参考候选 / 产品参数未核实；不引入 SKU 目录价格；仅显式提供来源的核实单价按核实价计价，其余单价按预算档位）`
            : `已应用方案候选配置 ${selected.appliedCount} 项（参考候选 / 未核实；不引入 SKU 价格，单价仍按预算档位）`,
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
    /** Response-only; index-aligned with detailedItems (generateBudget maps placeholders 1:1). */
    detailedItemSlotKeys: Array<string | null>;
  } = {
    currency: generated.currency,
    totalMin: Math.round(generated.totalEstimateMin),
    totalMax: Math.round(generated.totalEstimateMax),
    totalEstimateMin: Math.round(generated.totalEstimateMin),
    totalEstimateMax: Math.round(generated.totalEstimateMax),
    items: categorySubtotals,
    categorySubtotals,
    detailedItems: generated.items,
    detailedItemSlotKeys: placeholders.map((p) =>
      isProductSlotCategory(p.category) && p.subCategory?.trim()
        ? productSlotKey(p.category, p.subCategory)
        : null,
    ),
    assumptions: [
      ...generated.assumptions,
      `${QUOTE_BASIS_PREFIX}${quote.id}${QUOTE_BASIS_SUFFIX}`,
      `${BUDGET_TIER_PREFIX}${budgetTier}`,
      `方案人数：${projectInput.targetUsers ?? "未提供"}`,
      `方案面积：${projectInput.areaM2 != null ? `${projectInput.areaM2}㎡` : "待确认"}`,
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

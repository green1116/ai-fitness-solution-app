/**
 * 预算 PDF 对外入口：企业/Pro 走完整 budgetRender 引擎；简版仅作 free 兜底。
 */
import type { UserTier } from "@/lib/commercial/userTier";
import type { BudgetRecord } from "@/lib/domain/tender";
import {
  renderBudgetPdfBuffer,
  type BudgetPdfSection,
} from "@/lib/pdf/budgetRender";
import {
  buildTenderDocumentContext,
  computeTenderPackReqsig,
  type TenderDocumentContext,
} from "@/lib/pdf/tenderDocumentContext";

/** 企业级完整预算书章节（与 budgetRender 支持的 section key 对齐） */
export const FULL_ENTERPRISE_BUDGET_SECTIONS: BudgetPdfSection[] = [
  "header",
  "overall",
  "table",
  "compare",
  "pricing_terms",
  "delivery_terms",
  "payment_terms",
  "after_sales",
  "sign_seal",
  "remarks",
];

/** Tender Pack 合并用：不含签章页（整包末页统一签章） */
export const BUDGET_PACK_MERGE_SECTIONS: BudgetPdfSection[] = FULL_ENTERPRISE_BUDGET_SECTIONS.filter(
  (s) => s !== "sign_seal",
);

type BudgetLike = {
  currency: string;
  totalEstimateMin: number;
  totalEstimateMax: number;
  items: unknown;
  assumptions?: unknown;
};

type LegacyBudgetItem = { category: string; min: number; max: number };

type DetailedBudgetItem = {
  category: string;
  name: string;
  quantity: number;
  unitPriceMin: number;
  unitPriceMax: number;
  subtotalMin: number;
  subtotalMax: number;
  remark?: string;
};

function readDetailedBudgetItems(items: unknown): DetailedBudgetItem[] | null {
  if (!Array.isArray(items) || items.length === 0) return null;
  const out: DetailedBudgetItem[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object") return null;
    const row = raw as Record<string, unknown>;
    if (typeof row.category !== "string" || !row.category.trim()) return null;
    const quantity = Number(row.quantity);
    const unitPriceMin = Number(row.unitPriceMin);
    const unitPriceMax = Number(row.unitPriceMax);
    const subtotalMin = Number(row.subtotalMin);
    const subtotalMax = Number(row.subtotalMax);
    if (
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(unitPriceMin) ||
      !Number.isFinite(unitPriceMax) ||
      !Number.isFinite(subtotalMin) ||
      !Number.isFinite(subtotalMax)
    ) {
      return null;
    }
    const name =
      (typeof row.name === "string" && row.name.trim()) ||
      (typeof row.subCategory === "string" && row.subCategory.trim()) ||
      row.category.trim();
    out.push({
      category: row.category.trim(),
      name,
      quantity: Math.round(quantity),
      unitPriceMin,
      unitPriceMax,
      subtotalMin,
      subtotalMax,
      ...(typeof row.remark === "string" && row.remark.trim()
        ? { remark: row.remark.trim() }
        : {}),
    });
  }
  return out.length > 0 ? out : null;
}

function readLegacyBudgetItems(items: unknown): LegacyBudgetItem[] | null {
  if (!Array.isArray(items) || items.length === 0) return null;
  const out: LegacyBudgetItem[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object") return null;
    const row = raw as { category?: unknown; min?: unknown; max?: unknown };
    if (typeof row.category !== "string" || !row.category.trim()) return null;
    if (typeof row.min !== "number" || typeof row.max !== "number") return null;
    if (!Number.isFinite(row.min) || !Number.isFinite(row.max)) return null;
    out.push({ category: row.category.trim(), min: row.min, max: row.max });
  }
  return out;
}

function summaryFromPersistedBudget(
  budget: BudgetLike,
  ctx: {
    planId: string;
    companyName: string;
    companySize: number;
    budgetTier: "low" | "mid" | "high";
  },
) {
  const totalMin = Number(budget.totalEstimateMin);
  const totalMax = Number(budget.totalEstimateMax);
  if (!Number.isFinite(totalMin) || !Number.isFinite(totalMax)) return null;

  const assumptions = Array.isArray(budget.assumptions)
    ? budget.assumptions.filter((x): x is string => typeof x === "string")
    : [];

  const detailed = readDetailedBudgetItems(budget.items);
  if (detailed) {
    return {
      planId: ctx.planId,
      companyName: ctx.companyName,
      companySize: ctx.companySize,
      tier: ctx.budgetTier,
      overallTotal: { min: totalMin, max: totalMax },
      estimatedBySubtotals: {
        min: detailed.reduce((acc, it) => acc + it.subtotalMin, 0),
        max: detailed.reduce((acc, it) => acc + it.subtotalMax, 0),
      },
      lines: detailed.map((it) => ({
        category: it.category,
        categoryName: it.category,
        qtyText: `${it.name} ${it.quantity}-${it.quantity}`,
        unitPriceText: `${Math.round(it.unitPriceMin)}-${Math.round(it.unitPriceMax)}`,
        subtotal: { min: it.subtotalMin, max: it.subtotalMax },
        note: it.remark,
      })),
      items: detailed.map((it) => ({
        category: it.category,
        name: it.name,
        qty: it.quantity,
        unitPrice: { min: it.unitPriceMin, max: it.unitPriceMax },
        subtotal: { min: it.subtotalMin, max: it.subtotalMax },
        note: it.remark,
      })),
      assumptions,
    };
  }

  const legacy = readLegacyBudgetItems(budget.items);
  if (!legacy) return null;

  return {
    planId: ctx.planId,
    companyName: ctx.companyName,
    companySize: ctx.companySize,
    tier: ctx.budgetTier,
    overallTotal: { min: totalMin, max: totalMax },
    estimatedBySubtotals: {
      min: legacy.reduce((acc, it) => acc + it.min, 0),
      max: legacy.reduce((acc, it) => acc + it.max, 0),
    },
    lines: legacy.map((it) => ({
      category: it.category,
      categoryName: it.category,
      qtyText: "1-1",
      unitPriceText: `${Math.round(it.min)}-${Math.round(it.max)}`,
      subtotal: { min: it.min, max: it.max },
    })),
    items: legacy.map((it) => ({
      category: it.category,
      name: it.category,
      qty: 1,
      unitPrice: { min: it.min, max: it.max },
      subtotal: { min: it.min, max: it.max },
    })),
    assumptions,
  };
}

export type RenderBudgetPdfOptions = {
  tier?: UserTier;
  planId?: string;
  companyName?: string;
  companySize?: number;
  budgetLevel?: "low" | "mid" | "high" | "custom";
  /** 为 Tender Pack 生成内嵌预算档（无独立签章页、无 budget 独立页脚 restamp） */
  packMerge?: boolean;
  /** 与 plan / merged pack 共用同一投标身份 */
  tenderDocument?: TenderDocumentContext;
};

function mapTierToBudgetLevel(
  tier: UserTier,
  budgetLevel?: RenderBudgetPdfOptions["budgetLevel"],
): "low" | "mid" | "high" {
  if (budgetLevel && budgetLevel !== "custom") return budgetLevel;
  if (tier === "enterprise") return "high";
  if (tier === "pro") return "mid";
  return "low";
}

/**
 * 生成预算 PDF。Pro/Enterprise 使用完整 sections + budgetRender 多页模板；
 * free 仍走 saas 精简档（header + overall + table）。
 */
export async function renderBudgetPdf(
  budget: BudgetLike,
  options?: RenderBudgetPdfOptions,
): Promise<Buffer> {
  const tier = options?.tier ?? "enterprise";
  const planId = (options?.planId || "attaguy-plan").trim() || "attaguy-plan";
  const companyName = options?.companyName?.trim() || "投标企业";
  const companySize = Math.max(50, Math.round(options?.companySize ?? 200));
  const budgetTier = mapTierToBudgetLevel(tier, options?.budgetLevel);
  const packMerge = options?.packMerge === true;
  const isEnterpriseLike = tier === "enterprise" || tier === "pro";
  const persistedSummary = summaryFromPersistedBudget(budget, {
    planId,
    companyName,
    companySize,
    budgetTier,
  });

  let tenderDocument =
    options?.tenderDocument ??
    (isEnterpriseLike
      ? buildTenderDocumentContext({
          projectId: planId,
          planId,
          tier,
        })
      : undefined);

  if (tenderDocument && !tenderDocument.reqsig?.trim() && isEnterpriseLike) {
    const reqsig = await computeTenderPackReqsig(tenderDocument, {
      budgetLevel: budgetTier,
      companyName,
    });
    tenderDocument = { ...tenderDocument, reqsig };
  }

  const level = isEnterpriseLike ? "enterprise" : "saas";
  const sections: BudgetPdfSection[] | undefined = isEnterpriseLike
    ? packMerge
      ? BUDGET_PACK_MERGE_SECTIONS
      : FULL_ENTERPRISE_BUDGET_SECTIONS
    : ["header", "overall", "table"];

  const buf = await renderBudgetPdfBuffer(
    {
      planId,
      companyName,
      companySize,
      budgetTier,
    },
    {
      level,
      theme: isEnterpriseLike ? "tender" : "brand",
      sections,
      packEmbed: packMerge,
      reqsig: tenderDocument?.reqsig,
      tenderDocument,
      ...(persistedSummary ? { summary: persistedSummary } : {}),
    },
  );

  return Buffer.from(buf);
}

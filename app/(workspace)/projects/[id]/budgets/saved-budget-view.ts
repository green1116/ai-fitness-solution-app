/**
 * C.7-F1 — Pure presentation of a persisted Budget snapshot (no I/O, no recalculation).
 *
 * Row recognition and the VERIFIED rule mirror the Budget PDF reader so the page and the PDF of the
 * same budgetId agree: a row is only 已核实 when its own snapshot carries a complete price fact whose
 * unit price equals the single persisted unit price.
 */
import {
  PRICE_FACT_SOURCE_LABEL,
  PRICE_FACT_TAX_STATUS_LABEL,
  type BudgetItem,
} from "@/lib/domain/tender";

export type SavedBudgetDetailRow = {
  name: string;
  category: string;
  quantity: number;
  unitPriceMin: number;
  unitPriceMax: number;
  subtotalMin: number;
  subtotalMax: number;
  /** Price fact description when the row is verifiably VERIFIED; null otherwise. */
  verifiedSource: string | null;
};

export type SavedBudgetLegacyRow = { category: string; min: number; max: number };

export type SavedBudgetItemsView =
  | {
      kind: "detailed";
      rows: SavedBudgetDetailRow[];
      /** Snapshot rows for BudgetPriceBasisPanel; an incomplete VERIFIED claim is presented as an estimate. */
      panelItems: BudgetItem[];
    }
  | { kind: "legacy"; rows: SavedBudgetLegacyRow[] }
  | { kind: "unrecognized" };

const TIER_LABEL: Record<"low" | "mid" | "high", string> = {
  low: "基础（单价偏低）",
  mid: "标准（单价适中）",
  high: "高端（单价偏高）",
};

export function savedBudgetTierLabel(tier: "low" | "mid" | "high" | null): string {
  return tier ? TIER_LABEL[tier] : "未记录";
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function readVerifiedSource(row: Record<string, unknown>, unitPriceMin: number, unitPriceMax: number): string | null {
  if (row.priceBasis !== "VERIFIED" || unitPriceMin !== unitPriceMax) return null;
  const fact = row.priceFact;
  if (!isRecord(fact)) return null;
  const sourceType = fact.sourceType;
  const sourceReference = text(fact.sourceReference);
  const quotedAt = text(fact.quotedAt);
  if (
    (sourceType !== "supplier_quote" && sourceType !== "procurement_contract") ||
    !sourceReference ||
    !quotedAt ||
    fact.unitPrice !== unitPriceMin
  ) {
    return null;
  }
  const supplier = text(fact.supplier);
  const taxStatus = fact.taxStatus === "tax_included" || fact.taxStatus === "tax_excluded" ? fact.taxStatus : null;
  const validUntil = text(fact.validUntil);
  return [
    PRICE_FACT_SOURCE_LABEL[sourceType],
    sourceReference,
    `报价日期 ${quotedAt}`,
    ...(supplier ? [`供应商 ${supplier}`] : []),
    ...(taxStatus ? [PRICE_FACT_TAX_STATUS_LABEL[taxStatus]] : []),
    ...(validUntil ? [`有效期至 ${validUntil}`] : []),
  ].join(" · ");
}

function readDetailed(items: unknown[]): Extract<SavedBudgetItemsView, { kind: "detailed" }> | null {
  const rows: SavedBudgetDetailRow[] = [];
  const panelItems: BudgetItem[] = [];
  for (const raw of items) {
    if (!isRecord(raw)) return null;
    const category = text(raw.category);
    if (!category) return null;
    const quantity = Number(raw.quantity);
    const unitPriceMin = Number(raw.unitPriceMin);
    const unitPriceMax = Number(raw.unitPriceMax);
    const subtotalMin = Number(raw.subtotalMin);
    const subtotalMax = Number(raw.subtotalMax);
    if (
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      ![unitPriceMin, unitPriceMax, subtotalMin, subtotalMax].every(Number.isFinite)
    ) {
      return null;
    }
    const name = text(raw.name) || text(raw.subCategory) || category;
    const verifiedSource = readVerifiedSource(raw, unitPriceMin, unitPriceMax);
    rows.push({
      name,
      category,
      quantity: Math.round(quantity),
      unitPriceMin,
      unitPriceMax,
      subtotalMin,
      subtotalMax,
      verifiedSource,
    });
    const { priceFact, priceBasis, ...rest } = raw;
    panelItems.push({
      ...(rest as Omit<BudgetItem, "priceBasis" | "priceFact">),
      category,
      name,
      quantity: Math.round(quantity),
      unitPriceMin,
      unitPriceMax,
      subtotalMin,
      subtotalMax,
      ...(verifiedSource
        ? { priceBasis: "VERIFIED" as const, priceFact: priceFact as BudgetItem["priceFact"] }
        : priceBasis === "ESTIMATE" || priceBasis === "VERIFIED"
          ? { priceBasis: "ESTIMATE" as const }
          : {}),
    });
  }
  return { kind: "detailed", rows, panelItems };
}

function readLegacy(items: unknown[]): SavedBudgetLegacyRow[] | null {
  const rows: SavedBudgetLegacyRow[] = [];
  for (const raw of items) {
    if (!isRecord(raw)) return null;
    const category = text(raw.category);
    if (!category || typeof raw.min !== "number" || typeof raw.max !== "number") return null;
    if (!Number.isFinite(raw.min) || !Number.isFinite(raw.max)) return null;
    rows.push({ category, min: raw.min, max: raw.max });
  }
  return rows;
}

export function readSavedBudgetItems(items: unknown): SavedBudgetItemsView {
  if (!Array.isArray(items) || items.length === 0) return { kind: "unrecognized" };
  const detailed = readDetailed(items);
  if (detailed) return detailed;
  const legacy = readLegacy(items);
  return legacy ? { kind: "legacy", rows: legacy } : { kind: "unrecognized" };
}

export function formatSavedBudgetMoney(value: number): string {
  return `¥${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function formatSavedBudgetRange(min: number, max: number): string {
  return min === max ? formatSavedBudgetMoney(min) : `${formatSavedBudgetMoney(min)} – ${formatSavedBudgetMoney(max)}`;
}

const TIME_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatSavedBudgetTime(date: Date): string {
  return TIME_FORMAT.format(date);
}

export function parseSavedBudgetPage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !/^\d{1,6}$/.test(value)) return 1;
  const page = Number(value);
  return page >= 1 ? page : 1;
}

export const savedBudgetDetailHref = (projectId: string, budgetId: string) =>
  `/projects/${encodeURIComponent(projectId)}/budgets/${encodeURIComponent(budgetId)}`;

export const savedBudgetHistoryHref = (projectId: string, page = 1) =>
  `/projects/${encodeURIComponent(projectId)}/budgets${page > 1 ? `?page=${page}` : ""}`;

export const budgetRecalculateHref = (projectId: string, quoteId: string | null) =>
  `/budget?projectId=${encodeURIComponent(projectId)}${quoteId ? `&quoteId=${encodeURIComponent(quoteId)}` : ""}`;

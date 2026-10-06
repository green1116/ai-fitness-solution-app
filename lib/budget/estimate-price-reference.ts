/**
 * C.6-A — Organization estimate price reference (pure, DB-free, client-safe).
 *
 * An organization may maintain its own unit price range per Budget subcategory × budget tier.
 * Such a range is still an ESTIMATE: it applies only to Budget rows without a VERIFIED priceFact,
 * and a row without a matching active reference keeps the platform generic estimate.
 *
 * Subcategory identity is a closed registry of canonical keys mapped to the exact
 * (category, subCategory) pair the current templates generate; templates / placeholders carry no key.
 */
import type { BudgetEstimateBasis, PriceBand } from "@/lib/domain/tender";

export const ESTIMATE_SUBCATEGORIES = [
  { key: "cardio.commercial_treadmill", category: "有氧设备", subCategory: "商业级跑步机" },
  { key: "cardio.elliptical", category: "有氧设备", subCategory: "椭圆机" },
  { key: "strength.multi_station", category: "力量设备", subCategory: "综合训练器" },
  { key: "strength.free_weight_zone", category: "力量设备", subCategory: "自由力量区设备" },
  { key: "smart.access_membership", category: "智能系统", subCategory: "门禁与会员管理系统" },
  { key: "furniture.lockers", category: "配套家具", subCategory: "储物柜" },
  { key: "furniture.lounge", category: "配套家具", subCategory: "休息与接待家具" },
  { key: "facility.install_materials", category: "配套设施", subCategory: "基础辅材与安装附件" },
  { key: "studio.pilates_reformer", category: "普拉提设备", subCategory: "普拉提核心床（Reformer）" },
  {
    key: "studio.yoga_kit",
    category: "瑜伽垫上设备",
    subCategory: "瑜伽垫与辅具套装（瑜伽垫/瑜伽砖/伸展带）",
  },
  {
    key: "studio.functional_kit",
    category: "功能训练设备",
    subCategory: "功能训练架与小器械组合（壶铃/药球/战绳/训练垫）",
  },
] as const;

export type EstimateSubcategoryKey = (typeof ESTIMATE_SUBCATEGORIES)[number]["key"];

export const ESTIMATE_PRICE_TIERS: readonly PriceBand[] = ["low", "mid", "high"];
export const MAX_ESTIMATE_UNIT_PRICE = 10_000_000;
export const MAX_ESTIMATE_SOURCE_NOTE_LENGTH = 120;

const CONTROL_CHAR_RE = /[\u0000-\u001f\u007f]/;

export function isEstimateSubcategoryKey(value: unknown): value is EstimateSubcategoryKey {
  return typeof value === "string" && ESTIMATE_SUBCATEGORIES.some((s) => s.key === value);
}

function isEstimatePriceTier(value: unknown): value is PriceBand {
  return typeof value === "string" && (ESTIMATE_PRICE_TIERS as readonly string[]).includes(value);
}

/** Exact (category, subCategory) match against the registry; anything else has no key. */
export function resolveEstimateSubcategoryKey(
  category: string,
  subCategory: string | null | undefined,
): EstimateSubcategoryKey | null {
  const c = category.trim();
  const s = (subCategory ?? "").trim();
  return ESTIMATE_SUBCATEGORIES.find((e) => e.category === c && e.subCategory === s)?.key ?? null;
}

/** One active organization reference as handed to Budget generation (persisted shape, active only). */
export type EstimatePriceReference = {
  id: string;
  subcategoryKey: EstimateSubcategoryKey;
  budgetTier: PriceBand;
  unitPriceMin: number;
  unitPriceMax: number;
  sourceNote: string;
  revision: number;
};

export type EstimatePriceReferenceInput = Pick<
  EstimatePriceReference,
  "subcategoryKey" | "budgetTier" | "unitPriceMin" | "unitPriceMax" | "sourceNote"
>;

export type EstimatePriceReferenceValidation =
  | { ok: true; value: EstimatePriceReferenceInput }
  | { ok: false; error: string };

function isUnitPrice(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= MAX_ESTIMATE_UNIT_PRICE
  );
}

function readSourceNote(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const note = value.trim();
  if (!note || note.length > MAX_ESTIMATE_SOURCE_NOTE_LENGTH || CONTROL_CHAR_RE.test(note)) {
    return null;
  }
  return note;
}

export function validateEstimatePriceReferenceInput(
  value: unknown,
): EstimatePriceReferenceValidation {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "价目数据格式无效" };
  }
  const row = value as Record<string, unknown>;
  if (!isEstimateSubcategoryKey(row.subcategoryKey)) {
    return { ok: false, error: "子品类无效" };
  }
  if (!isEstimatePriceTier(row.budgetTier)) {
    return { ok: false, error: "预算档位需为 low / mid / high" };
  }
  if (!isUnitPrice(row.unitPriceMin) || !isUnitPrice(row.unitPriceMax)) {
    return { ok: false, error: `单价需为 1-${MAX_ESTIMATE_UNIT_PRICE} 的整数（元）` };
  }
  if (row.unitPriceMin > row.unitPriceMax) {
    return { ok: false, error: "最低单价不能高于最高单价" };
  }
  const sourceNote = readSourceNote(row.sourceNote);
  if (!sourceNote) {
    return {
      ok: false,
      error: `价格依据说明为必填，最多 ${MAX_ESTIMATE_SOURCE_NOTE_LENGTH} 字，且不能包含控制字符`,
    };
  }
  return {
    ok: true,
    value: {
      subcategoryKey: row.subcategoryKey,
      budgetTier: row.budgetTier,
      unitPriceMin: row.unitPriceMin,
      unitPriceMax: row.unitPriceMax,
      sourceNote,
    },
  };
}

function isUsableReference(reference: EstimatePriceReference): boolean {
  return (
    typeof reference.id === "string" &&
    reference.id.trim() !== "" &&
    Number.isInteger(reference.revision) &&
    reference.revision >= 1 &&
    validateEstimatePriceReferenceInput(reference).ok
  );
}

/**
 * The single active reference for subcategory × tier. Unregistered rows, malformed references and
 * ambiguous (duplicate) matches resolve to null, i.e. the platform generic estimate.
 */
export function matchEstimatePriceReference(
  references: readonly EstimatePriceReference[],
  category: string,
  subCategory: string | null | undefined,
  budgetTier: PriceBand,
): EstimatePriceReference | null {
  const key = resolveEstimateSubcategoryKey(category, subCategory);
  if (!key) return null;
  const hits = references.filter(
    (r) => r.subcategoryKey === key && r.budgetTier === budgetTier && isUsableReference(r),
  );
  return hits.length === 1 ? hits[0] : null;
}

/** Budget row snapshot of the reference used; the row's own unit prices are its values. */
export function estimateBasisFromReference(reference: EstimatePriceReference): BudgetEstimateBasis {
  return {
    source: "organization-price-reference",
    referenceId: reference.id,
    revision: reference.revision,
    subcategoryKey: reference.subcategoryKey,
    budgetTier: reference.budgetTier,
    sourceNote: reference.sourceNote.trim(),
  };
}

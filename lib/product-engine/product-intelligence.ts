/**
 * PI.1 Product Intelligence — requirement status, reference candidates,
 * professional selections. Pure helpers (no DB); persisted only inside Quote JSON.
 *
 * Candidates come from the static/mock SKU catalog and are always
 * "reference-catalog" + "unverified". Selections never carry SKU prices.
 */

import type { PriceBand, ProductPlaceholder } from "@/lib/domain/tender";
import { getSkusByCategory } from "@/lib/tender/sku/skuDatabase";
import type { ProductSKU, SkuCategory } from "@/lib/tender/sku/skuTypes";

import {
  hasBasementNoVentilationConstraint,
  hasStrengthEquipmentEmphasis,
  parseExplicitAreaM2FromNotes,
} from "./quote-revision";

export const PRODUCT_INTELLIGENCE_VERSION = "pi1-product-intelligence-1" as const;

export type RequirementStatus =
  | "IN_SCOPE"
  | "CONDITIONAL"
  | "NEEDS_CLARIFICATION"
  | "CONFLICT"
  | "NEW_SCOPE";

export type RequirementStatusItem = {
  id: string;
  text: string;
  status: RequirementStatus;
  basis: string;
  question?: string;
};

export type ProductCandidateSource = "reference-catalog";
export type ProductCandidateVerificationStatus = "unverified";

export type ProductCandidate = {
  candidateId: string;
  brand: string;
  model: string;
  category: string;
  keySpecs: string[];
  fitReason: string;
  source: ProductCandidateSource;
  verificationStatus: ProductCandidateVerificationStatus;
  openQuestions: string[];
};

export type ProductSelectionAction = "confirm" | "replace" | "remove";

export type ProductSelection = {
  slotKey: string;
  action: ProductSelectionAction;
  /** null = keep current template configuration (quantity change only). */
  candidate: ProductCandidate | null;
  quantity?: number;
  decidedAt: string;
  decidedBy?: string;
};

export type ProductSelectionInput = {
  slotKey: string;
  action: ProductSelectionAction;
  candidateId?: string | null;
  quantity?: number | null;
};

export type ProductCandidateSlot = {
  slotKey: string;
  category: string;
  subCategory: string;
  templateQuantity: number;
  priceBand: PriceBand;
  candidates: ProductCandidate[];
  emptyMessage?: string;
};

export type ProductIntelligenceSnapshot = {
  version: typeof PRODUCT_INTELLIGENCE_VERSION;
  generatedAt: string;
  requirements: RequirementStatusItem[];
  slots: ProductCandidateSlot[];
  appliedSelectionCount: number;
  selectionWarnings: string[];
};

export const PRODUCT_SLOT_CATEGORIES = ["有氧设备", "力量设备"] as const;

export const NO_CANDIDATE_MESSAGE = "暂无已验证候选，保留当前模板配置";

const MAX_SLOT_CANDIDATES = 3;
const MIN_SELECTION_QUANTITY = 1;
const MAX_SELECTION_QUANTITY = 999;

/** Template subCategory → catalog categories. Unmapped / empty => no candidates. */
const SLOT_SKU_CATEGORIES: Record<string, SkuCategory[]> = {
  商业级跑步机: ["treadmill"],
  椭圆机: ["elliptical"],
  综合训练器: ["strength"],
  自由力量区设备: ["rack", "free_weight"],
};

const TIER_LABEL: Record<PriceBand, string> = {
  low: "经济档",
  mid: "中档",
  high: "高档",
};

export function productSlotKey(
  category: string,
  subCategory: string | null | undefined,
): string {
  return `${category.trim()}|${(subCategory ?? "").trim()}`;
}

export function isProductSlotCategory(category: string): boolean {
  return (PRODUCT_SLOT_CATEGORIES as readonly string[]).includes(category.trim());
}

// ---------------------------------------------------------------------------
// Requirement classification (deterministic rules only; advisory)
// ---------------------------------------------------------------------------

const AREA_GLOBAL_RE = /(\d+(?:\.\d+)?)\s*(?:平方米|平米|㎡|m²|m2)/gi;
const AMBIGUOUS_RE = /待定|大概|大约|左右|可能|看情况|尽量|适当|差不多|若干|TBD/i;
const NEW_SCOPE_RE = /游泳池|泳池|餐厅|食堂|装修|土建|改造工程|桑拿/;
const NEGATION_RE = /不含|不需要|无需|不包括|除外|不做/;
const AEROBIC_EMPHASIS_RE = /偏重有氧|有氧为主|以有氧为主/;

function splitRequirementClauses(notes: string): string[] {
  return notes
    .split(/[，,；;。\n！!？?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function classifyClause(
  clause: string,
  wholeNotes: string,
): Omit<RequirementStatusItem, "id"> {
  const area = parseExplicitAreaM2FromNotes(clause);

  if (AMBIGUOUS_RE.test(clause)) {
    return {
      text: clause,
      status: "NEEDS_CLARIFICATION",
      basis:
        area != null
          ? `已按 ${area}㎡ 暂估，但表述含不确定用语，需确认准确数值`
          : "表述含不确定用语，无法按确定规则落实到配置",
      question: "请提供明确的数值或范围",
    };
  }

  if (NEW_SCOPE_RE.test(clause)) {
    if (NEGATION_RE.test(clause)) {
      return {
        text: clause,
        status: "IN_SCOPE",
        basis: "明确排除项，当前方案本就不包含",
      };
    }
    return {
      text: clause,
      status: "NEW_SCOPE",
      basis: "明确提及健身器材配置以外的工程/设施，当前方案与预算不包含",
      question: "是否需要单独立项或另行报价？",
    };
  }

  if (area != null) {
    return {
      text: clause,
      status: "IN_SCOPE",
      basis: `已识别面积 ${area}㎡，并用于方案面积与器材数量测算`,
    };
  }

  if (hasStrengthEquipmentEmphasis(clause)) {
    return {
      text: clause,
      status: "IN_SCOPE",
      basis: "已按力量优先调整分区占比与器材数量",
    };
  }

  if (
    hasBasementNoVentilationConstraint(wholeNotes) &&
    /地下室|通风/.test(clause)
  ) {
    return {
      text: clause,
      status: "CONDITIONAL",
      basis: "已写入场地约束；有氧设备布置以通风/新风条件落实为前提",
      question: "现场能否增设新风或机械通风？",
    };
  }

  return {
    text: clause,
    status: "NEEDS_CLARIFICATION",
    basis: "当前规则未自动识别该要求，是否影响配置需专业人员确认",
  };
}

export function classifyRequirements(
  notes: string | null | undefined,
): RequirementStatusItem[] {
  const text = notes?.trim() || "";
  if (!text) return [];

  const items: RequirementStatusItem[] = splitRequirementClauses(text).map(
    (clause, index) => ({ id: `req-${index + 1}`, ...classifyClause(clause, text) }),
  );

  const areas = Array.from(text.matchAll(AREA_GLOBAL_RE))
    .map((m) => Math.round(Number(m[1])))
    .filter((n) => Number.isFinite(n) && n > 0);
  const uniqueAreas = Array.from(new Set(areas));
  if (uniqueAreas.length > 1) {
    items.push({
      id: "conflict-area",
      text: uniqueAreas.map((a) => `${a}㎡`).join(" / "),
      status: "CONFLICT",
      basis: `出现多个面积数值，当前按首个识别值 ${uniqueAreas[0]}㎡ 计算`,
      question: "请确认最终面积",
    });
  }

  if (hasStrengthEquipmentEmphasis(text) && AEROBIC_EMPHASIS_RE.test(text)) {
    items.push({
      id: "conflict-emphasis",
      text: "力量优先 / 有氧优先",
      status: "CONFLICT",
      basis: "同时出现力量优先与有氧优先要求，当前按力量优先执行",
      question: "请确认训练侧重",
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// Reference candidates (static/mock catalog; never verified; no price)
// ---------------------------------------------------------------------------

function skuKeySpecs(sku: ProductSKU): string[] {
  const specs: string[] = [];
  if (sku.specs.maxSpeedKmH != null) specs.push(`最高速度 ${sku.specs.maxSpeedKmH} km/h`);
  if (sku.specs.incline != null) specs.push(`坡度 ${sku.specs.incline}`);
  if (sku.specs.maxLoadKg != null) specs.push(`最大承重 ${sku.specs.maxLoadKg} kg`);
  if (sku.specs.power) specs.push(`电机 ${sku.specs.power}`);
  if (sku.specs.dimensions) specs.push(`规格 ${sku.specs.dimensions}`);
  if (sku.warrantyYears != null) specs.push(`质保 ${sku.warrantyYears} 年`);
  if (sku.leadTimeDays != null) specs.push(`供货周期约 ${sku.leadTimeDays} 天`);
  if (sku.certifications?.length) specs.push(`认证 ${sku.certifications.join("/")}`);
  return specs;
}

function skuToCandidate(
  sku: ProductSKU,
  slot: { subCategory: string; priceBand: PriceBand },
): ProductCandidate {
  const skuTier = TIER_LABEL[sku.productTier];
  const slotTier = TIER_LABEL[slot.priceBand];
  const tierFit =
    sku.productTier === slot.priceBand
      ? `档次（${skuTier}）与当前方案配置档位一致`
      : `档次（${skuTier}）与方案档位（${slotTier}）不同，作为替代参考`;
  const tags = sku.tenderTags?.length ? `；目录标签：${sku.tenderTags.join("/")}` : "";
  return {
    candidateId: sku.id,
    brand: sku.brand,
    model: sku.model,
    category: slot.subCategory,
    keySpecs: skuKeySpecs(sku),
    fitReason: `${tierFit}${tags}`,
    source: "reference-catalog",
    verificationStatus: "unverified",
    openQuestions: [
      "参数与型号来自参考目录，需向供应商索取最新参数表核实",
      "供货周期与本地安装/售后能力待确认",
    ],
  };
}

export function listCandidatesForSlot(slot: {
  subCategory: string;
  priceBand: PriceBand;
}): ProductCandidate[] {
  const categories = SLOT_SKU_CATEGORIES[slot.subCategory.trim()] ?? [];
  const skus = categories
    .flatMap((c) => getSkusByCategory(c))
    .filter((s) => s.brand?.trim() && s.model?.trim());
  const ranked = [
    ...skus.filter((s) => s.productTier === slot.priceBand),
    ...skus.filter((s) => s.productTier !== slot.priceBand),
  ];
  return ranked
    .slice(0, MAX_SLOT_CANDIDATES)
    .map((sku) => skuToCandidate(sku, slot));
}

export function buildCandidateSlots(
  placeholders: ProductPlaceholder[],
): ProductCandidateSlot[] {
  return placeholders
    .filter((p) => isProductSlotCategory(p.category) && p.subCategory?.trim())
    .map((p) => {
      const subCategory = p.subCategory!.trim();
      const candidates = listCandidatesForSlot({
        subCategory,
        priceBand: p.priceBand,
      });
      return {
        slotKey: productSlotKey(p.category, subCategory),
        category: p.category,
        subCategory,
        templateQuantity: p.quantity,
        priceBand: p.priceBand,
        candidates,
        ...(candidates.length === 0 ? { emptyMessage: NO_CANDIDATE_MESSAGE } : {}),
      };
    });
}

// ---------------------------------------------------------------------------
// Selections
// ---------------------------------------------------------------------------

function toStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim())
        .filter(Boolean)
    : [];
}

function readQuantity(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const n = Math.round(value);
  if (n < MIN_SELECTION_QUANTITY || n > MAX_SELECTION_QUANTITY) return undefined;
  return n;
}

function readStoredCandidate(value: unknown): ProductCandidate | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const brand = typeof row.brand === "string" ? row.brand.trim() : "";
  const model = typeof row.model === "string" ? row.model.trim() : "";
  if (!brand || !model) return null;
  return {
    candidateId: typeof row.candidateId === "string" ? row.candidateId : "",
    brand,
    model,
    category: typeof row.category === "string" ? row.category : "",
    keySpecs: toStringList(row.keySpecs),
    fitReason: typeof row.fitReason === "string" ? row.fitReason : "",
    // Never trust stored/client claims of verification.
    source: "reference-catalog",
    verificationStatus: "unverified",
    openQuestions: toStringList(row.openQuestions),
  };
}

/** Parse selections stored in Quote.companyInfo; invalid rows are dropped. */
export function readStoredProductSelections(value: unknown): ProductSelection[] {
  if (!Array.isArray(value)) return [];
  const bySlot = new Map<string, ProductSelection>();
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const slotKey = typeof row.slotKey === "string" ? row.slotKey.trim() : "";
    const action = row.action;
    if (!slotKey || (action !== "confirm" && action !== "replace" && action !== "remove")) {
      continue;
    }
    const quantity = readQuantity(row.quantity);
    bySlot.set(slotKey, {
      slotKey,
      action,
      candidate: action === "remove" ? null : readStoredCandidate(row.candidate),
      ...(quantity != null ? { quantity } : {}),
      decidedAt: typeof row.decidedAt === "string" ? row.decidedAt : "",
      ...(typeof row.decidedBy === "string" && row.decidedBy
        ? { decidedBy: row.decidedBy }
        : {}),
    });
  }
  return Array.from(bySlot.values());
}

export class ProductSelectionInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductSelectionInputError";
  }
}

/**
 * Resolve client input against the server-side slots/candidates.
 * Candidate data is always re-read from the catalog (client cannot inject products).
 */
export function resolveProductSelectionInputs(input: {
  inputs: unknown;
  slots: ProductCandidateSlot[];
  decidedAt: string;
  decidedBy?: string;
}): ProductSelection[] {
  if (!Array.isArray(input.inputs)) {
    throw new ProductSelectionInputError("selections 必须为数组");
  }
  const slotMap = new Map(input.slots.map((s) => [s.slotKey, s]));
  const bySlot = new Map<string, ProductSelection>();

  for (const raw of input.inputs) {
    if (!raw || typeof raw !== "object") {
      throw new ProductSelectionInputError("选型项格式无效");
    }
    const row = raw as Record<string, unknown>;
    const slotKey = typeof row.slotKey === "string" ? row.slotKey.trim() : "";
    const slot = slotMap.get(slotKey);
    if (!slot) {
      throw new ProductSelectionInputError(`当前方案中不存在该设备位：${slotKey || "(空)"}`);
    }
    const action = row.action;
    if (action !== "confirm" && action !== "replace" && action !== "remove") {
      throw new ProductSelectionInputError(`不支持的操作：${String(action)}`);
    }

    let quantity: number | undefined;
    if (row.quantity != null && row.quantity !== "") {
      quantity = readQuantity(Number(row.quantity));
      if (quantity == null) {
        throw new ProductSelectionInputError(
          `数量需为 ${MIN_SELECTION_QUANTITY}-${MAX_SELECTION_QUANTITY} 的整数：${slot.subCategory}`,
        );
      }
    }

    let candidate: ProductCandidate | null = null;
    if (action !== "remove") {
      const candidateId =
        typeof row.candidateId === "string" ? row.candidateId.trim() : "";
      if (candidateId) {
        candidate = slot.candidates.find((c) => c.candidateId === candidateId) ?? null;
        if (!candidate) {
          throw new ProductSelectionInputError(`候选不存在：${slot.subCategory}`);
        }
      } else if (action === "replace") {
        throw new ProductSelectionInputError(`替换需指定候选：${slot.subCategory}`);
      }
    }

    bySlot.set(slotKey, {
      slotKey,
      action,
      candidate: action === "remove" ? null : candidate,
      ...(action !== "remove" && quantity != null ? { quantity } : {}),
      decidedAt: input.decidedAt,
      ...(input.decidedBy ? { decidedBy: input.decidedBy } : {}),
    });
  }

  return Array.from(bySlot.values());
}

export type ApplyProductSelectionsResult<T extends ProductPlaceholder> = {
  placeholders: T[];
  appliedCount: number;
  warnings: string[];
};

/**
 * Single shared overlay used by Quote Plan/PDF and Budget.
 * No selections => returns the input placeholders unchanged.
 * Never touches priceBand (budget keeps tier pricing).
 */
export function applyProductSelections<T extends ProductPlaceholder>(
  placeholders: T[],
  selections: ProductSelection[] | null | undefined,
): ApplyProductSelectionsResult<T> {
  if (!selections || selections.length === 0) {
    return { placeholders, appliedCount: 0, warnings: [] };
  }

  const warnings: string[] = [];
  const bySlot = new Map<string, ProductSelection>();
  const slotKeys = new Set(
    placeholders
      .filter((p) => isProductSlotCategory(p.category))
      .map((p) => productSlotKey(p.category, p.subCategory)),
  );
  for (const s of selections) {
    if (!slotKeys.has(s.slotKey)) {
      warnings.push(`设备位「${s.slotKey}」在当前方案中不存在，已忽略该选型`);
      continue;
    }
    bySlot.set(s.slotKey, s);
  }

  let appliedCount = 0;
  const out: T[] = [];
  for (const p of placeholders) {
    const selection = isProductSlotCategory(p.category)
      ? bySlot.get(productSlotKey(p.category, p.subCategory))
      : undefined;
    if (!selection) {
      out.push(p);
      continue;
    }
    if (selection.action === "remove") {
      appliedCount += 1;
      continue;
    }
    if (selection.action === "replace" && !selection.candidate) {
      warnings.push(`设备位「${selection.slotKey}」替换缺少有效候选，已保留模板配置`);
      out.push(p);
      continue;
    }
    const next: T = { ...p };
    if (selection.quantity != null) next.quantity = selection.quantity;
    if (selection.candidate) {
      next.brand = selection.candidate.brand;
      next.model = selection.candidate.model;
      next.skuName = `${selection.candidate.brand} ${selection.candidate.model}`;
      if (selection.candidate.candidateId) next.skuId = selection.candidate.candidateId;
    }
    appliedCount += 1;
    out.push(next);
  }

  return { placeholders: out, appliedCount, warnings };
}

export function buildProductIntelligenceSnapshot(input: {
  notes: string | null | undefined;
  templatePlaceholders: ProductPlaceholder[];
  selections: ProductSelection[] | null | undefined;
  generatedAt?: string;
}): ProductIntelligenceSnapshot {
  const applied = applyProductSelections(input.templatePlaceholders, input.selections);
  return {
    version: PRODUCT_INTELLIGENCE_VERSION,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    requirements: classifyRequirements(input.notes),
    slots: buildCandidateSlots(input.templatePlaceholders),
    appliedSelectionCount: applied.appliedCount,
    selectionWarnings: applied.warnings,
  };
}

function readStoredSlots(value: unknown): ProductCandidateSlot[] | null {
  if (!Array.isArray(value)) return null;
  const slots: ProductCandidateSlot[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const slotKey = typeof row.slotKey === "string" ? row.slotKey : "";
    const category = typeof row.category === "string" ? row.category : "";
    const subCategory = typeof row.subCategory === "string" ? row.subCategory : "";
    if (!slotKey || !category) continue;
    const priceBand: PriceBand =
      row.priceBand === "low" || row.priceBand === "high" ? row.priceBand : "mid";
    const candidates = Array.isArray(row.candidates)
      ? row.candidates
          .map(readStoredCandidate)
          .filter((c): c is ProductCandidate => c != null)
      : [];
    slots.push({
      slotKey,
      category,
      subCategory,
      templateQuantity:
        typeof row.templateQuantity === "number" ? row.templateQuantity : 0,
      priceBand,
      candidates,
      ...(candidates.length === 0 ? { emptyMessage: NO_CANDIDATE_MESSAGE } : {}),
    });
  }
  return slots;
}

/** Read a stored snapshot from Quote.content; null when absent/invalid (old Quote). */
export function readStoredProductIntelligence(
  value: unknown,
): ProductIntelligenceSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (row.version !== PRODUCT_INTELLIGENCE_VERSION) return null;
  const slots = readStoredSlots(row.slots);
  if (!slots) return null;
  const requirements = Array.isArray(row.requirements)
    ? (row.requirements as unknown[]).filter(
        (r): r is RequirementStatusItem =>
          !!r &&
          typeof r === "object" &&
          typeof (r as RequirementStatusItem).text === "string" &&
          typeof (r as RequirementStatusItem).status === "string",
      )
    : [];
  return {
    version: PRODUCT_INTELLIGENCE_VERSION,
    generatedAt: typeof row.generatedAt === "string" ? row.generatedAt : "",
    requirements,
    slots,
    appliedSelectionCount:
      typeof row.appliedSelectionCount === "number" ? row.appliedSelectionCount : 0,
    selectionWarnings: toStringList(row.selectionWarnings),
  };
}

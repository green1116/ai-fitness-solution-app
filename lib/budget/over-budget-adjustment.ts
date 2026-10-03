/**
 * C.1 — Over-Budget Adjustment v1 (deterministic, client-safe).
 *
 * Options are quantified quantity reductions on existing Product Intelligence slots only.
 * Nothing here ranks equipment, marks items mandatory/optional or decides what to cut.
 */
import type { BudgetItem } from "@/lib/domain/tender";
import type {
  ProductCandidateSlot,
  ProductSelection,
  ProductSelectionInput,
} from "@/lib/product-engine/product-intelligence";

export type BudgetTargetStatus = "OVER_BUDGET" | "TARGET_WITHIN_RANGE" | "WITHIN_BUDGET";

/** Technical minimum enforced by Product Intelligence selection input. */
export const ADJUSTMENT_MIN_QUANTITY = 1;

export function parseTargetBudget(raw: string): number | null {
  const text = raw.trim().replace(/,/g, "");
  if (!text) return null;
  const value = Number(text);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function classifyBudgetTarget(
  targetBudget: number,
  totalEstimateMin: number,
  totalEstimateMax: number,
): BudgetTargetStatus {
  if (targetBudget < totalEstimateMin) return "OVER_BUDGET";
  if (targetBudget < totalEstimateMax) return "TARGET_WITHIN_RANGE";
  return "WITHIN_BUDGET";
}

export type QuantityReductionOption = {
  slotKey: string;
  category: string;
  subCategory: string;
  currentQuantity: number;
  minQuantity: number;
  unitPriceMin: number;
  unitPriceMax: number;
  priceBasis: "VERIFIED" | "ESTIMATE";
};

export type NonAdjustableBudgetRow = {
  category: string;
  name: string;
  quantity: number;
  reason: "NOT_PRODUCT_SLOT" | "AT_MINIMUM";
};

/**
 * Eligibility = aligned canonical slotKey is non-null AND present in the current Quote PI slots.
 * Budget row order is preserved; no ranking is applied.
 */
export function buildQuantityReductionOptions(input: {
  items: BudgetItem[];
  slotKeys: Array<string | null>;
  slots: ProductCandidateSlot[];
}): { options: QuantityReductionOption[]; nonAdjustable: NonAdjustableBudgetRow[] } {
  const slotsByKey = new Map(input.slots.map((s) => [s.slotKey, s]));
  const aligned = input.slotKeys.length === input.items.length;
  const keyCounts = new Map<string, number>();
  if (aligned) {
    for (const key of input.slotKeys) {
      if (key) keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
    }
  }

  const options: QuantityReductionOption[] = [];
  const nonAdjustable: NonAdjustableBudgetRow[] = [];
  input.items.forEach((item, index) => {
    const key = aligned ? input.slotKeys[index] : null;
    const slot = key && keyCounts.get(key) === 1 ? slotsByKey.get(key) : undefined;
    const row = {
      category: item.category,
      name: item.name ?? item.category,
      quantity: item.quantity,
    };
    if (!key || !slot) {
      nonAdjustable.push({ ...row, reason: "NOT_PRODUCT_SLOT" });
      return;
    }
    if (!(item.quantity > ADJUSTMENT_MIN_QUANTITY)) {
      nonAdjustable.push({ ...row, reason: "AT_MINIMUM" });
      return;
    }
    options.push({
      slotKey: key,
      category: slot.category,
      subCategory: slot.subCategory,
      currentQuantity: item.quantity,
      minQuantity: ADJUSTMENT_MIN_QUANTITY,
      unitPriceMin: item.unitPriceMin,
      unitPriceMax: item.unitPriceMax,
      priceBasis: item.priceBasis === "VERIFIED" ? "VERIFIED" : "ESTIMATE",
    });
  });
  return { options, nonAdjustable };
}

export type ApprovedQuantities = Record<string, number>;

export type ApprovedQuantityResult =
  | { ok: true; approved: ApprovedQuantities }
  | { ok: false; errors: string[] };

/** Blank / unchanged drafts are ignored; anything else must be an integer in [1, current - 1]. */
export function readApprovedQuantities(
  options: QuantityReductionOption[],
  drafts: Record<string, string>,
): ApprovedQuantityResult {
  const approved: ApprovedQuantities = {};
  const errors: string[] = [];
  for (const option of options) {
    const text = (drafts[option.slotKey] ?? "").trim();
    if (!text) continue;
    const value = Number(text);
    if (value === option.currentQuantity) continue;
    if (
      !Number.isInteger(value) ||
      value < option.minQuantity ||
      value > option.currentQuantity - 1
    ) {
      errors.push(
        `${option.subCategory}：数量需为 ${option.minQuantity}-${option.currentQuantity - 1} 的整数`,
      );
      continue;
    }
    approved[option.slotKey] = value;
  }
  return errors.length > 0 ? { ok: false, errors } : { ok: true, approved };
}

export type AdjustedEstimate = {
  totalEstimateMin: number;
  totalEstimateMax: number;
  reductionMin: number;
  reductionMax: number;
};

/** Deterministic projection only; the authoritative figure comes from recalculating the new Quote. */
export function estimateAdjustedTotals(input: {
  totalEstimateMin: number;
  totalEstimateMax: number;
  options: QuantityReductionOption[];
  approved: ApprovedQuantities;
}): AdjustedEstimate {
  let reductionMin = 0;
  let reductionMax = 0;
  for (const option of input.options) {
    const next = input.approved[option.slotKey];
    if (next == null) continue;
    const delta = option.currentQuantity - next;
    reductionMin += delta * option.unitPriceMin;
    reductionMax += delta * option.unitPriceMax;
  }
  return {
    totalEstimateMin: input.totalEstimateMin - reductionMin,
    totalEstimateMax: input.totalEstimateMax - reductionMax,
    reductionMin,
    reductionMax,
  };
}

export type AdjustedSnapshotResult =
  | { ok: true; selections: ProductSelectionInput[] }
  | { ok: false; blockedSlots: string[] };

/**
 * Full configuration snapshot over every current PI slot (same contract as the Quote page).
 * Existing selections keep action, candidate, quantity and priceFact; only approved slots get a
 * new quantity. Slots without a selection become explicit template confirmations.
 * A customer-specified candidate (as emitted by the canonical stored-selection reader) is re-sent
 * as `customProduct: { brand, model }`; the server re-derives its identity on save.
 */
export function buildAdjustedSelectionSnapshot(input: {
  slots: ProductCandidateSlot[];
  selections: ProductSelection[];
  approved: ApprovedQuantities;
}): AdjustedSnapshotResult {
  const bySlot = new Map(input.selections.map((s) => [s.slotKey, s]));
  const blockedSlots: string[] = [];
  const out: ProductSelectionInput[] = [];

  for (const slot of input.slots) {
    const approvedQuantity = input.approved[slot.slotKey];
    const existing = bySlot.get(slot.slotKey);

    if (!existing) {
      out.push({
        slotKey: slot.slotKey,
        action: "confirm",
        candidateId: null,
        ...(approvedQuantity != null ? { quantity: approvedQuantity } : {}),
      });
      continue;
    }

    if (existing.action === "remove") {
      if (approvedQuantity != null) blockedSlots.push(slot.subCategory);
      else out.push({ slotKey: slot.slotKey, action: "remove" });
      continue;
    }

    const custom = existing.candidate?.source === "customer-specified" ? existing.candidate : null;
    if (custom) {
      const brand = typeof custom.brand === "string" ? custom.brand : "";
      const model = typeof custom.model === "string" ? custom.model : "";
      if (
        existing.action !== "replace" ||
        custom.verificationStatus !== "unverified" ||
        !brand.trim() ||
        !model.trim()
      ) {
        blockedSlots.push(slot.subCategory);
        continue;
      }
      const customQuantity = approvedQuantity ?? existing.quantity;
      out.push({
        slotKey: slot.slotKey,
        action: "replace",
        customProduct: { brand, model },
        ...(customQuantity != null ? { quantity: customQuantity } : {}),
        ...(existing.priceFact ? { priceFact: existing.priceFact } : {}),
      });
      continue;
    }

    const candidateId = existing.candidate?.candidateId?.trim() ?? "";
    if (candidateId && !slot.candidates.some((c) => c.candidateId === candidateId)) {
      blockedSlots.push(slot.subCategory);
      continue;
    }
    if (!candidateId && existing.action === "replace") {
      blockedSlots.push(slot.subCategory);
      continue;
    }

    const quantity = approvedQuantity ?? existing.quantity;
    out.push({
      slotKey: slot.slotKey,
      action: existing.action,
      candidateId: candidateId || null,
      ...(quantity != null ? { quantity } : {}),
      ...(candidateId && existing.priceFact ? { priceFact: existing.priceFact } : {}),
    });
  }

  for (const key of Object.keys(input.approved)) {
    if (!input.slots.some((s) => s.slotKey === key)) blockedSlots.push(key);
  }

  return blockedSlots.length > 0 ? { ok: false, blockedSlots } : { ok: true, selections: out };
}

/**
 * Product Core v2 — C.1 Over-Budget Adjustment v1 verification.
 * Three-state target status, canonical slotKey alignment, quantity-only reduction options,
 * full-snapshot apply through the existing PI version flow, and recalculation.
 * Runs the real quote/budget services with an in-memory Prisma stub. No DB, no network.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";

import type { BudgetItem, ProjectInput } from "../lib/domain/tender";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

// ---------------------------------------------------------------------------
// In-memory Prisma stub
// ---------------------------------------------------------------------------

type Row = Record<string, unknown> & { id: string };

const db = {
  projects: new Map<string, Row>(),
  quotes: new Map<string, Row>(),
  budgets: [] as Row[],
  seq: 0,
};

function stubModule(rel: string, exports: Record<string, unknown>) {
  const filename = require.resolve(path.join(ROOT, rel));
  const mod = new Module(filename);
  mod.filename = filename;
  mod.loaded = true;
  mod.exports = exports;
  require.cache[filename] = mod;
}

stubModule("lib/prisma", {
  prisma: {
    project: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        const row = db.projects.get(where.id);
        return row ? structuredClone(row) : null;
      },
    },
    quote: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const row: Row = {
          id: `q-new-${++db.seq}`,
          content: null,
          orchestrationId: null,
          createdAt: new Date(),
          ...structuredClone(data),
        };
        db.quotes.set(row.id, row);
        return structuredClone(row);
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = db.quotes.get(where.id);
        if (!row) throw new Error(`quote ${where.id} not found`);
        Object.assign(row, structuredClone(data));
        return structuredClone(row);
      },
      findUnique: async ({
        where,
        include,
      }: {
        where: { id: string };
        include?: { project?: boolean };
      }) => {
        const row = db.quotes.get(where.id);
        if (!row) return null;
        const out = structuredClone(row) as Row & { project?: Row };
        if (include?.project) {
          const project = db.projects.get(String(row.projectId));
          out.project = project ? structuredClone(project) : undefined;
        }
        return out;
      },
    },
    budget: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const row: Row = { id: `b-${++db.seq}`, createdAt: new Date(), ...structuredClone(data) };
        db.budgets.push(row);
        return structuredClone(row);
      },
    },
  },
});

/* eslint-disable @typescript-eslint/no-require-imports */
const adjustment = require("../lib/budget/over-budget-adjustment") as typeof import("../lib/budget/over-budget-adjustment");
const quoteService = require("../lib/services/quote.service") as typeof import("../lib/services/quote.service");
const budgetService = require("../lib/services/budget.service") as typeof import("../lib/services/budget.service");
const templates = require("../lib/templates/placeholderTemplates") as typeof import("../lib/templates/placeholderTemplates");
const pi = require("../lib/product-engine/product-intelligence") as typeof import("../lib/product-engine/product-intelligence");
/* eslint-enable @typescript-eslint/no-require-imports */

const {
  ADJUSTMENT_MIN_QUANTITY,
  buildAdjustedSelectionSnapshot,
  buildQuantityReductionOptions,
  classifyBudgetTarget,
  estimateAdjustedTotals,
  parseTargetBudget,
  readApprovedQuantities,
} = adjustment;

type Selection = import("../lib/product-engine/product-intelligence").ProductSelection;
type SelectionInput = import("../lib/product-engine/product-intelligence").ProductSelectionInput;

const ORG = "org-c1";
const PROJECT = "p-c1";
const TREADMILL_SLOT = "有氧设备|商业级跑步机";
const ELLIPTICAL_SLOT = "有氧设备|椭圆机";
const STRENGTH_SLOT = "力量设备|综合训练器";
const PRICE_FACT = {
  unitPrice: 30000,
  currency: "CNY",
  sourceType: "supplier_quote",
  sourceReference: "SQ-C1-001",
  quotedAt: "2025-01-15",
};

function sameFact(a: unknown, b: Record<string, unknown>) {
  if (!a || typeof a !== "object") return false;
  const row = a as Record<string, unknown>;
  return (
    Object.keys(row).length === Object.keys(b).length &&
    Object.entries(b).every(([k, v]) => row[k] === v)
  );
}

// ---------------------------------------------------------------------------
// A. three-state status
// ---------------------------------------------------------------------------

function checkStatus() {
  const min = 400_000;
  const max = 800_000;
  assert(classifyBudgetTarget(399_999, min, max) === "OVER_BUDGET", "target < min → OVER_BUDGET");
  assert(classifyBudgetTarget(1, min, max) === "OVER_BUDGET", "far below min → OVER_BUDGET");
  assert(classifyBudgetTarget(min, min, max) === "TARGET_WITHIN_RANGE", "target = min → TARGET_WITHIN_RANGE");
  assert(classifyBudgetTarget(600_000, min, max) === "TARGET_WITHIN_RANGE", "min < target < max → TARGET_WITHIN_RANGE");
  assert(classifyBudgetTarget(max - 1, min, max) === "TARGET_WITHIN_RANGE", "max - 1 → TARGET_WITHIN_RANGE");
  assert(classifyBudgetTarget(max, min, max) === "WITHIN_BUDGET", "target = max → WITHIN_BUDGET");
  assert(classifyBudgetTarget(max + 1, min, max) === "WITHIN_BUDGET", "target > max → WITHIN_BUDGET");
  assert(classifyBudgetTarget(500_000, 500_000, 500_000) === "WITHIN_BUDGET", "min = max = target → WITHIN_BUDGET");

  assert(parseTargetBudget("500000") === 500_000, "parse plain amount");
  assert(parseTargetBudget(" 500,000 ") === 500_000, "parse thousands separators");
  for (const bad of ["", "  ", "abc", "0", "-1", "NaN"]) {
    assert(parseTargetBudget(bad) === null, `invalid target "${bad}" → null`);
  }

  const lib = read("lib/budget/over-budget-adjustment.ts");
  assert(!/midpoint|\/\s*2\b|guarantee/i.test(lib), "no midpoint / guaranteed price in status logic");
  console.log("✓ A. three-state status (incl. target = min, target = max)");
}

// ---------------------------------------------------------------------------
// Real-service fixtures
// ---------------------------------------------------------------------------

function seedProject() {
  db.projects.set(PROJECT, {
    id: PROJECT,
    name: "C1 Project",
    clientName: "C1 Corp",
    industry: "enterprise",
    siteType: "office",
    areaM2: 400,
    targetUsers: 200,
    city: "上海市",
    budgetLevel: "mid",
    budgetLabel: "30-80万",
    deliveryMode: "standard",
    notes: null,
    organizationId: ORG,
  });
}

async function calculate(quoteId: string) {
  const result = await budgetService.calculateBudget({
    quoteId,
    organizationId: ORG,
    projectId: PROJECT,
    budgetTier: "mid",
  });
  const s = result.engine.structure;
  return {
    items: s.detailedItems as unknown as BudgetItem[],
    slotKeys: s.detailedItemSlotKeys,
    min: s.totalEstimateMin,
    max: s.totalEstimateMax,
  };
}

async function view(quoteId: string) {
  return quoteService.getQuoteProductIntelligence({ quoteId, organizationId: ORG, projectId: PROJECT });
}

function expectedSlotKeys(quoteId: string): Array<string | null> {
  const row = db.quotes.get(quoteId)!;
  const companyInfo = row.companyInfo as {
    targetUsers?: number;
    areaM2?: number;
    productSelections?: Selection[];
  };
  const input = {
    name: "C1 Project",
    clientName: "C1 Corp",
    industry: "enterprise",
    siteType: "office",
    targetUsers: companyInfo.targetUsers ?? 200,
    areaM2: companyInfo.areaM2 ?? 400,
    budgetLevel: "mid",
    deliveryMode: "standard",
  } as ProjectInput;
  const placeholders = templates.buildPlaceholders(PROJECT, input, {
    quantityModel: templates.resolveQuoteQuantityModel(row.content),
  });
  const applied = pi.applyProductSelections(placeholders, companyInfo.productSelections).placeholders;
  return applied.map((p) =>
    pi.isProductSlotCategory(p.category) && p.subCategory?.trim()
      ? pi.productSlotKey(p.category, p.subCategory)
      : null,
  );
}

// ---------------------------------------------------------------------------
// B/C/D/E. real flow
// ---------------------------------------------------------------------------

async function checkFlow() {
  seedProject();
  const generated = await quoteService.generateQuote({
    projectId: PROJECT,
    workspaceId: "ws-c1",
    organizationId: ORG,
    companyInfo: { companyName: "C1 Corp", targetUsers: 200, areaM2: 400 },
  });
  const baseId = generated.quote.id;
  const baseView = await view(baseId);
  const strengthCandidate = baseView.slots.find((s) => s.slotKey === STRENGTH_SLOT)?.candidates[0];
  assert(Boolean(strengthCandidate), "fixture: strength slot has a candidate");

  // Version 1 — user decisions made on the Quote page (candidate + verified price, template qty 1).
  const v1 = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: baseId,
    organizationId: ORG,
    projectId: PROJECT,
    selections: [
      {
        slotKey: STRENGTH_SLOT,
        action: "confirm",
        candidateId: strengthCandidate!.candidateId,
        quantity: 9,
        priceFact: PRICE_FACT,
      },
      { slotKey: TREADMILL_SLOT, action: "confirm", candidateId: null, quantity: 1 },
    ],
  });
  const v1Id = v1.quote.id;
  const v1View = await view(v1Id);
  const quotesBeforeCalc = db.quotes.size;
  const v1Budget = await calculate(v1Id);
  assert(db.quotes.size === quotesBeforeCalc, "calculateBudget never creates a Quote");

  // B. canonical slotKey alignment
  assert(
    Array.isArray(v1Budget.slotKeys) && v1Budget.slotKeys.length === v1Budget.items.length,
    "detailedItemSlotKeys is index-aligned with detailedItems",
  );
  const expected = expectedSlotKeys(v1Id);
  assert(
    JSON.stringify(v1Budget.slotKeys) === JSON.stringify(expected),
    "slotKeys = productSlotKey(placeholder.category, placeholder.subCategory) for PI categories, else null",
  );
  const strengthIndex = v1Budget.slotKeys.indexOf(STRENGTH_SLOT);
  assert(strengthIndex >= 0, "strength slot present in budget");
  const strengthItem = v1Budget.items[strengthIndex];
  assert(
    strengthItem.name !== "综合训练器" && strengthItem.name!.includes(strengthCandidate!.brand),
    "candidate row display name differs from the slot identity (brand/model suffix)",
  );
  assert(strengthItem.priceBasis === "VERIFIED" && strengthItem.quantity === 9, "fixture: verified row qty 9");
  let nonPiRows = 0;
  v1Budget.items.forEach((item, i) => {
    if (!pi.isProductSlotCategory(item.category)) {
      nonPiRows += 1;
      assert(v1Budget.slotKeys[i] === null, `non-PI row "${item.category}" has slotKey null`);
    } else {
      assert(v1Budget.slotKeys[i] !== null, `PI row "${item.category}" has a slotKey`);
    }
  });
  assert(nonPiRows > 0, "fixture contains non-PI rows");
  const persisted = db.budgets[db.budgets.length - 1];
  assert(
    JSON.stringify(persisted.items) === JSON.stringify(v1Budget.items),
    "Budget.items persists detailedItems unchanged",
  );
  assert(
    !JSON.stringify(persisted).includes("detailedItemSlotKeys") &&
      !JSON.stringify(persisted.items).includes("slotKey"),
    "slotKeys are response-only (not persisted to Budget)",
  );
  console.log("✓ B. canonical slotKey alignment (placeholder 1:1, response-only, not name-based)");

  // C. options
  const quotesBeforeOptions = db.quotes.size;
  const reduction = buildQuantityReductionOptions({
    items: v1Budget.items,
    slotKeys: v1Budget.slotKeys,
    slots: v1View.slots,
  });
  const again = buildQuantityReductionOptions({
    items: v1Budget.items,
    slotKeys: v1Budget.slotKeys,
    slots: v1View.slots,
  });
  assert(JSON.stringify(reduction) === JSON.stringify(again), "options are deterministic");
  const slotKeySet = new Set(v1View.slots.map((s) => s.slotKey));
  assert(reduction.options.length > 0, "fixture produces options");
  for (const option of reduction.options) {
    assert(slotKeySet.has(option.slotKey), `option ${option.slotKey} exists in current PI slots`);
    assert(pi.isProductSlotCategory(option.category), `option ${option.slotKey} is a PI category`);
    assert(option.minQuantity === 1 && ADJUSTMENT_MIN_QUANTITY === 1, "minimum quantity is 1");
    assert(option.currentQuantity > 1, "options only for quantity > 1");
    assert(
      Object.keys(option).every((k) =>
        [
          "slotKey",
          "category",
          "subCategory",
          "currentQuantity",
          "minQuantity",
          "unitPriceMin",
          "unitPriceMax",
          "priceBasis",
        ].includes(k),
      ),
      "options carry no priority / mandatory / ranking fields",
    );
  }
  const optionOrder = reduction.options.map((o) => v1Budget.slotKeys.indexOf(o.slotKey));
  assert(
    optionOrder.every((v, i) => i === 0 || v > optionOrder[i - 1]),
    "options keep original budget order (no ranking)",
  );
  assert(!reduction.options.some((o) => o.slotKey === TREADMILL_SLOT), "quantity-1 row is not reducible");
  assert(
    reduction.nonAdjustable.some((r) => r.reason === "AT_MINIMUM" && r.quantity === 1),
    "quantity-1 row reported AT_MINIMUM",
  );
  assert(
    reduction.nonAdjustable.filter((r) => r.reason === "NOT_PRODUCT_SLOT").length === nonPiRows,
    "every non-PI row is non-adjustable",
  );
  const strengthOption = reduction.options.find((o) => o.slotKey === STRENGTH_SLOT)!;
  assert(
    strengthOption.priceBasis === "VERIFIED" && strengthOption.unitPriceMin === PRICE_FACT.unitPrice,
    "verified unit price carried into the option",
  );

  const renamed = v1Budget.items.map((item, i) => ({ ...item, name: `renamed-${i}` }));
  const renamedReduction = buildQuantityReductionOptions({
    items: renamed,
    slotKeys: v1Budget.slotKeys,
    slots: v1View.slots,
  });
  assert(
    JSON.stringify(renamedReduction.options) === JSON.stringify(reduction.options),
    "eligibility independent of display names",
  );
  const noKeys = buildQuantityReductionOptions({
    items: v1Budget.items,
    slotKeys: v1Budget.slotKeys.map(() => null),
    slots: v1View.slots,
  });
  assert(noKeys.options.length === 0, "rows without slotKey are never adjustable (no name fallback)");
  const misaligned = buildQuantityReductionOptions({
    items: v1Budget.items,
    slotKeys: v1Budget.slotKeys.slice(1),
    slots: v1View.slots,
  });
  assert(misaligned.options.length === 0, "misaligned slotKeys → no options");
  const dupKeys = v1Budget.slotKeys.map((k) => (k === ELLIPTICAL_SLOT ? STRENGTH_SLOT : k));
  const dup = buildQuantityReductionOptions({ items: v1Budget.items, slotKeys: dupKeys, slots: v1View.slots });
  assert(!dup.options.some((o) => o.slotKey === STRENGTH_SLOT), "duplicate slotKey rows are not adjustable");
  const unknownSlots = buildQuantityReductionOptions({
    items: v1Budget.items,
    slotKeys: v1Budget.slotKeys,
    slots: v1View.slots.filter((s) => s.slotKey !== ELLIPTICAL_SLOT),
  });
  assert(
    !unknownSlots.options.some((o) => o.slotKey === ELLIPTICAL_SLOT),
    "slotKey absent from current PI slots is not adjustable",
  );

  const ellipticalOption = reduction.options.find((o) => o.slotKey === ELLIPTICAL_SLOT)!;
  assert(Boolean(ellipticalOption), "fixture: elliptical template slot reducible");
  const check = (drafts: Record<string, string>) => readApprovedQuantities(reduction.options, drafts);
  assert(!check({ [STRENGTH_SLOT]: "0" }).ok, "quantity 0 rejected (never below 1)");
  assert(!check({ [STRENGTH_SLOT]: "-2" }).ok, "negative quantity rejected");
  assert(!check({ [STRENGTH_SLOT]: "1.5" }).ok, "non-integer rejected");
  assert(!check({ [STRENGTH_SLOT]: "10" }).ok, "increase rejected (reduction only)");
  const unchanged = check({ [STRENGTH_SLOT]: "9", [ELLIPTICAL_SLOT]: "" });
  assert(unchanged.ok && Object.keys(unchanged.approved).length === 0, "blank / unchanged drafts ignored");
  const atOne = check({ [STRENGTH_SLOT]: "1" });
  assert(atOne.ok && atOne.approved[STRENGTH_SLOT] === 1, "reduce to exactly 1 allowed");
  const approvedResult = check({ [STRENGTH_SLOT]: "4", [ELLIPTICAL_SLOT]: "2" });
  assert(approvedResult.ok, "valid reductions accepted");
  const approved = approvedResult.ok ? approvedResult.approved : {};

  const projected = estimateAdjustedTotals({
    totalEstimateMin: v1Budget.min,
    totalEstimateMax: v1Budget.max,
    options: reduction.options,
    approved,
  });
  const ellipticalDelta = ellipticalOption.currentQuantity - 2;
  assert(
    projected.reductionMin === 5 * PRICE_FACT.unitPrice + ellipticalDelta * ellipticalOption.unitPriceMin &&
      projected.reductionMax === 5 * PRICE_FACT.unitPrice + ellipticalDelta * ellipticalOption.unitPriceMax,
    "projected reduction = Σ (current − approved) × unit price",
  );
  assert(db.quotes.size === quotesBeforeOptions, "building options never mutates Quotes");
  console.log("✓ C. options (PI-slot only, ≥ 1, no ranking, deterministic, no name fallback)");

  // D. full-snapshot apply
  const quotesBeforeSnapshot = db.quotes.size;
  const snapshot = buildAdjustedSelectionSnapshot({
    slots: v1View.slots,
    selections: v1View.selections,
    approved,
  });
  assert(snapshot.ok, "snapshot builds");
  assert(db.quotes.size === quotesBeforeSnapshot, "building the snapshot never mutates Quotes");
  const selections = snapshot.ok ? snapshot.selections : [];
  assert(
    JSON.stringify(selections.map((s) => s.slotKey)) === JSON.stringify(v1View.slots.map((s) => s.slotKey)),
    "snapshot covers every current PI slot (full configuration)",
  );
  assert(!selections.some((s) => s.action === "remove"), "snapshot never generates remove");
  const bySlot = new Map(selections.map((s) => [s.slotKey, s] as const));
  const strengthSel = bySlot.get(STRENGTH_SLOT)!;
  assert(
    strengthSel.candidateId === strengthCandidate!.candidateId &&
      strengthSel.quantity === 4 &&
      sameFact(strengthSel.priceFact, PRICE_FACT),
    "approved candidate slot: candidate + verified priceFact preserved, quantity overridden",
  );
  const treadmillSel = bySlot.get(TREADMILL_SLOT)!;
  assert(
    treadmillSel.action === "confirm" && treadmillSel.candidateId === null && treadmillSel.quantity === 1,
    "unchanged quantity-only selection preserved",
  );
  const ellipticalSel = bySlot.get(ELLIPTICAL_SLOT)!;
  assert(
    ellipticalSel.action === "confirm" && ellipticalSel.candidateId === null && ellipticalSel.quantity === 2,
    "approved template slot: explicit confirm with approved quantity",
  );
  for (const sel of selections) {
    if ([STRENGTH_SLOT, TREADMILL_SLOT, ELLIPTICAL_SLOT].includes(sel.slotKey)) continue;
    assert(
      sel.action === "confirm" && sel.candidateId === null && sel.quantity === undefined && !sel.priceFact,
      `untouched template slot ${sel.slotKey}: explicit confirmation, no quantity change`,
    );
  }

  // Blocking + pass-through rules.
  const staleSelections: Selection[] = v1View.selections.map((s) =>
    s.slotKey === STRENGTH_SLOT && s.candidate
      ? { ...s, candidate: { ...s.candidate, candidateId: "stale-candidate" } }
      : s,
  );
  const stale = buildAdjustedSelectionSnapshot({ slots: v1View.slots, selections: staleSelections, approved });
  assert(!stale.ok && stale.blockedSlots.length > 0, "unresolvable existing candidate blocks apply");
  const staleUnapproved = buildAdjustedSelectionSnapshot({
    slots: v1View.slots,
    selections: staleSelections,
    approved: { [ELLIPTICAL_SLOT]: 2 },
  });
  assert(!staleUnapproved.ok, "unresolvable candidate blocks even when its slot is not being adjusted");
  const freeWeightSlot = v1View.slots.find(
    (s) => ![STRENGTH_SLOT, TREADMILL_SLOT, ELLIPTICAL_SLOT].includes(s.slotKey),
  )!;
  const removed: Selection = {
    slotKey: freeWeightSlot.slotKey,
    action: "remove",
    candidate: null,
    decidedAt: "2026-10-01T00:00:00Z",
  };
  const withRemove = buildAdjustedSelectionSnapshot({
    slots: v1View.slots,
    selections: [...v1View.selections, removed],
    approved,
  });
  assert(
    withRemove.ok &&
      withRemove.selections.filter((s) => s.action === "remove").length === 1 &&
      withRemove.selections.find((s) => s.action === "remove")!.slotKey === freeWeightSlot.slotKey,
    "existing user remove is preserved, never added",
  );
  const removeApproved = buildAdjustedSelectionSnapshot({
    slots: v1View.slots,
    selections: [...v1View.selections, removed],
    approved: { [freeWeightSlot.slotKey]: 1 },
  });
  assert(!removeApproved.ok, "quantity on a removed slot is blocked");
  const unknownApproved = buildAdjustedSelectionSnapshot({
    slots: v1View.slots,
    selections: v1View.selections,
    approved: { "有氧设备|不存在": 1 },
  });
  assert(!unknownApproved.ok, "approved slot outside current PI slots is blocked");

  // Explicit apply → existing PI version flow.
  const v1Before = JSON.stringify(db.quotes.get(v1Id));
  const v2 = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: v1Id,
    organizationId: ORG,
    projectId: PROJECT,
    selections: selections as SelectionInput[],
  });
  const v2Id = v2.quote.id;
  assert(v2Id !== v1Id && db.quotes.get(v2Id)?.status === "READY", "apply creates a NEW READY Quote version");
  assert(JSON.stringify(db.quotes.get(v1Id)) === v1Before, "source Quote is immutable");
  const v1Stored = (db.quotes.get(v1Id)!.companyInfo as { productSelections?: Selection[] }).productSelections ?? [];
  const v2Stored = (db.quotes.get(v2Id)!.companyInfo as { productSelections?: Selection[] }).productSelections ?? [];
  const v2Strength = v2Stored.find((s) => s.slotKey === STRENGTH_SLOT)!;
  const v1Strength = v1Stored.find((s) => s.slotKey === STRENGTH_SLOT)!;
  assert(
    v2Strength.candidate?.candidateId === v1Strength.candidate?.candidateId &&
      JSON.stringify(v2Strength.candidate) === JSON.stringify(v1Strength.candidate) &&
      sameFact(v2Strength.priceFact, PRICE_FACT) &&
      v2Strength.quantity === 4,
    "new version keeps candidate + verified priceFact, quantity 4",
  );
  assert(
    v2Stored.find((s) => s.slotKey === TREADMILL_SLOT)?.quantity === 1,
    "new version keeps unchanged quantity-only selection",
  );
  assert(!v2Stored.some((s) => s.action === "remove"), "new version contains no remove");
  console.log("✓ D. full-snapshot apply (quantity-only, candidate/priceFact preserved, blocking, new version)");

  // E. recalculate on the new quoteId
  const v2Budget = await calculate(v2Id);
  assert(
    JSON.stringify(v2Budget.slotKeys) === JSON.stringify(v1Budget.slotKeys),
    "slot identity stable across versions",
  );
  v2Budget.items.forEach((item, i) => {
    const key = v2Budget.slotKeys[i];
    const before = v1Budget.items[i];
    if (key === STRENGTH_SLOT) {
      assert(
        item.quantity === 4 &&
          item.priceBasis === "VERIFIED" &&
          item.unitPriceMin === PRICE_FACT.unitPrice &&
          item.subtotalMax === PRICE_FACT.unitPrice * 4,
        "recalculated verified row: qty 4 × verified unit price",
      );
    } else if (key === ELLIPTICAL_SLOT) {
      assert(item.quantity === 2, "recalculated elliptical qty 2");
    } else {
      assert(
        item.quantity === before.quantity && item.unitPriceMin === before.unitPriceMin,
        `unchanged row ${item.category}/${item.name} keeps quantity and price`,
      );
    }
  });
  assert(
    v2Budget.min === projected.totalEstimateMin && v2Budget.max === projected.totalEstimateMax,
    "recalculated [min, max] equals the projected range",
  );
  const target = v2Budget.min;
  assert(
    classifyBudgetTarget(target, v1Budget.min, v1Budget.max) === "OVER_BUDGET" &&
      classifyBudgetTarget(target, v2Budget.min, v2Budget.max) === "TARGET_WITHIN_RANGE",
    "same transient target re-evaluated against the new range",
  );
  const latestBudget = db.budgets[db.budgets.length - 1];
  assert(
    (latestBudget.assumptions as string[]).some((a) => a.includes(v2Id)),
    "recalculated budget is bound to the new quoteId",
  );
  console.log("✓ E. recalculation on the new Quote (new range, status re-evaluated)");
}

// ---------------------------------------------------------------------------
// Static wiring
// ---------------------------------------------------------------------------

function sliceBetween(src: string, start: string, end: string) {
  const a = src.indexOf(start);
  const b = src.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `locate ${start}`);
  return src.slice(a, b);
}

function checkStatic() {
  const lib = read("lib/budget/over-budget-adjustment.ts");
  assert(!/^import (?!type )/m.test(lib), "adjustment lib has type-only imports (pure, client-safe)");
  assert(!/prisma|fetch\(|sessionStorage|localStorage/.test(lib), "adjustment lib performs no IO");
  assert(!/skuId/.test(lib), "skuId is not used as slot identity");
  assert(
    !/\.name\s*(===|!==|==)|name\??\.(startsWith|includes|indexOf|endsWith)|subCategory\s*===/.test(lib),
    "no display-name matching in adjustment lib",
  );
  assert(
    (lib.match(/action: "remove"/g) ?? []).length === 1 &&
      /else out\.push\(\{ slotKey: slot\.slotKey, action: "remove" \}\)/.test(lib),
    "remove only appears as pass-through of an existing user decision",
  );
  assert(!/priority|mandatory|optional|rank/i.test(lib.replace(/\/\*\*[\s\S]*?\*\//g, "")), "no priority / mandatory / ranking logic");

  const svc = read("lib/services/budget.service.ts");
  assert(
    /detailedItemSlotKeys: placeholders\.map\(\(p\) =>\s*isProductSlotCategory\(p\.category\) && p\.subCategory\?\.trim\(\)\s*\? productSlotKey\(p\.category, p\.subCategory\)\s*: null,/.test(svc),
    "budget.service derives slotKeys from aligned placeholders via productSlotKey / isProductSlotCategory",
  );
  const createBlock = sliceBetween(svc, "prisma.budget.create(", "});");
  assert(!createBlock.includes("detailedItemSlotKeys"), "slotKeys not persisted by budget.create");
  assert(createBlock.includes("items: generated.items as unknown as Prisma.JsonArray"), "Budget.items unchanged");

  const page = read("app/(product)/budget/page.tsx");
  assert(page.includes("detailedItemSlotKeys"), "page consumes server slotKeys");
  assert(!/name\??\.(startsWith|includes)|\.name\s*===/.test(page), "page does not match on display names");
  assert(!/action: "remove"/.test(page), "page never generates remove");
  const applyFn = sliceBetween(page, "async function handleApplyAdjustment()", "async function handleDownloadPdf()");
  assert(
    applyFn.includes('fetch("/api/quote/product-intelligence"') && applyFn.includes('method: "POST"'),
    "apply posts the existing PI contract",
  );
  assert(applyFn.includes("buildAdjustedSelectionSnapshot("), "apply sends the full snapshot");
  assert(
    /data\.ok === true && data\.status === "READY"/.test(applyFn) && applyFn.includes("await handleCalculate(nextQuoteId)"),
    "apply requires a READY new version, then recalculates on it",
  );
  assert(
    (page.match(/\/api\/quote\/product-intelligence"/g) ?? []).length === 1,
    "only one PI POST in the page (inside apply)",
  );
  const applyRefs = page.match(/handleApplyAdjustment\(/g) ?? [];
  assert(
    applyRefs.length === 2 && page.includes("onClick={() => void handleApplyAdjustment()}"),
    "apply only runs from an explicit button click",
  );
  const calcFn = sliceBetween(page, "async function handleCalculate(", "async function handleApplyAdjustment()");
  assert(!/targetBudget|handleApplyAdjustment|product-intelligence", \{\s*method: "POST"/.test(calcFn), "calculate never mutates the Quote");
  for (const line of page.split(/\r?\n/)) {
    if (!line.includes("targetBudget")) continue;
    assert(
      !/Storage|writeStored|productHref|JSON\.stringify/.test(line),
      "target budget is transient (not stored / not in URL / not sent)",
    );
  }
  assert(page.includes("不构成最终成交价或预算保证"), "no-guarantee disclaimer shown");
  const adjustmentUi = sliceBetween(page, "目标预算对照（仅本页参考，不保存）", "不构成最终成交价或预算保证");
  assert(
    /\{targetStatus === "OVER_BUDGET" \? \(\s*!reduction \?/.test(adjustmentUi) &&
      (adjustmentUi.match(/!reduction \?/g) ?? []).length === 1 &&
      !/targetStatus\s*!==/.test(adjustmentUi),
    'quantity-adjustment workflow gated only by targetStatus === "OVER_BUDGET"',
  );
  assert(!adjustmentUi.includes("仅有氧/力量"), "C.1 adjustment UI does not duplicate cardio/strength category semantics");
  console.log("✓ static wiring (pure lib, response-only slotKeys, explicit apply, transient target)");
}

// ---------------------------------------------------------------------------
// C.1 UX consistency (quote workflow + budget flow)
// ---------------------------------------------------------------------------

function checkQuoteWorkflowUx() {
  const quote = read("app/(product)/quote/page.tsx");

  // B. one current step
  assert(
    quote.includes("const showBudgetStepCard = reviewingPanel == null;") &&
      /\{showBudgetStepCard \? \(\s*<>\s*\{currentQuoteId && productConfigConfirmed \? \(/.test(quote),
    "Step 5 card gated by the visibility condition around the unchanged confirmed condition",
  );
  const gateOpen = quote.indexOf("{currentQuoteId && productConfigConfirmed ? (");
  assert(
    gateOpen > 0 && quote.indexOf(") : currentQuoteId ? (", gateOpen) > gateOpen,
    "confirmed / locked Step 5 structure preserved",
  );
  assert(
    quote.includes('const budgetIsCurrent = workflowStage === "ready_for_budget" && reviewingPanel == null;') &&
      quote.includes('{activePanel === "products" && !budgetIsCurrent && quoteReady && piView ? ('),
    "full Step 4 editor is not the default view once Budget is current",
  );
  const summary = sliceBetween(quote, "{budgetIsCurrent && quoteReady && piView ? (", "{showBudgetStepCard ? (");
  assert(
    summary.includes("已完成步骤") && !summary.includes('productHref("/budget"'),
    "completed-step summaries render before Step 5 without an extra Budget link",
  );
  assert(quote.includes("返回当前步骤：第 "), "review mode offers 返回当前步骤");
  assert(quote.includes('aria-current="step"'), 'current step uses aria-current="step"');
  assert(quote.includes("（查看中）"), "reviewed step marked 查看中");
  assert(!/\bcurrentStep\b/.test(quote), "identifier currentStep not introduced");
  console.log("✓ quote workflow UX (single current step, review mode, Step 5 gate preserved)");

  // C. Step 3 / Step 4 semantics
  const step3 = sliceBetween(quote, "第 3 步：方案策略", "确认方案策略，继续产品配置");
  for (const phrase of ["AI 建议配置", "AI 建议数量", "非最终采购数量"]) {
    assert(step3.includes(phrase), `Step 3 shows ${phrase}`);
  }
  const step4 = sliceBetween(quote, "第 4 步：产品配置", '"确认产品配置"');
  for (const phrase of ["AI 建议数量", "当前方案数量", "当前参考目录", "参考候选 / 未核实"]) {
    assert(step4.includes(phrase), `Step 4 shows ${phrase}`);
  }
  assert(
    !/templateQuantity\s*[-+*/%]|[-+*/%]\s*(slot\.)?templateQuantity/.test(quote),
    "no arithmetic on templateQuantity",
  );
  const payload = sliceBetween(quote, "function buildSelectionPayload(", "function isValidDraftQuantity(");
  assert(
    payload.includes("} else if (quantity != null && quantity !== slot.templateQuantity) {") &&
      payload.includes('draft.candidateId === slot.candidates[0]?.candidateId ? "confirm" : "replace"'),
    "buildSelectionPayload quantity behaviour preserved",
  );
  console.log("✓ Step 3 / Step 4 semantics (AI 建议数量 vs 当前方案数量, no new quantity logic)");
}

function checkBudgetUx() {
  const page = read("app/(product)/budget/page.tsx");

  // D. flow + transient target + cache boundary
  const order = ["当前方案预算", "客户目标预算对照", "数量调整选项", "确认后保存为新方案版本，并自动重新计算预算"].map(
    (phrase) => page.indexOf(phrase),
  );
  assert(
    order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1])),
    "budget flow order: 当前方案预算 → 客户目标预算对照 → 数量调整选项 → 确认后保存为新方案版本",
  );
  const dirtyFn = sliceBetween(page, "function isBudgetDraftDirty(", "function BudgetForm()");
  assert(
    !dirtyFn.includes("targetBudget") &&
      page.includes("isBudgetDraftDirty(companySize, budgetTier, budgetSummary)"),
    "targetBudget is not part of the dirty / recalculation comparison",
  );
  assert(page.includes("当前预算与方案一致，修改目标预算无需重新计算。"), "no-recalculation hint for target changes");

  const hydrate = sliceBetween(page, "async function hydrate()", "async function handleCalculate(");
  assert(
    !hydrate.includes("/api/budget/calculate") && !hydrate.includes("handleCalculate("),
    "page-load restore never calls /api/budget/calculate or handleCalculate",
  );
  assert(
    /readStoredAdjustmentDetail\(\{\s*projectId: ownedProjectId,\s*quoteId: resolvedQuoteId,\s*budgetId: acceptedBudgetId,\s*\}\)/.test(
      hydrate,
    ) && hydrate.includes("fetchProductIntelligenceSnapshot("),
    "restore reads cached detail for the restored project + quote + budget, then reads current PI",
  );
  const reader = sliceBetween(page, "function readStoredAdjustmentDetail(", "function resolveBoundBudgetSummary(");
  for (const field of ["projectId", "quoteId", "budgetId"]) {
    assert(
      reader.includes(`trimBindingId(detail.${field}) !== ${field}`),
      `cached detail rejected on ${field} mismatch`,
    );
  }
  assert(
    (page.match(/readStoredAdjustmentDetail\(/g) ?? []).length === 2,
    "cached detail is only read by the restore path",
  );
  assert(
    /writeStoredAdjustmentDetail\(\s*\{ projectId: boundProjectId, quoteId: calculatedQuoteId, budgetId: data\.budgetId \}/.test(page),
    "cache written with projectId + quoteId + budgetId of the calculation",
  );
  const applyFn = sliceBetween(page, "async function handleApplyAdjustment()", "async function reloadPiSnapshot()");
  const discardAt = applyFn.indexOf("discardStoredAdjustmentDetail()");
  assert(
    discardAt > 0 && discardAt < applyFn.indexOf("setQuoteId(nextQuoteId)"),
    "new Quote switch invalidates the old adjustment-detail cache first",
  );
  assert(
    page.includes("正在加载数量调整依据") &&
      page.includes("onClick={() => void reloadPiSnapshot()}") &&
      page.includes("重新计算不会改变方案或产品配置"),
    "loading / PI-retry / no-cache copy present",
  );
  const reloadFn = sliceBetween(page, "async function reloadPiSnapshot()", "async function handleDownloadPdf()");
  assert(
    reloadFn.includes("fetchProductIntelligenceSnapshot(") && !reloadFn.includes("/api/budget/calculate"),
    "retry re-reads PI only",
  );

  // E. transient before/after comparison
  assert(
    /const \[preAdjustmentRange, setPreAdjustmentRange\] = useState<\{\s*quoteId: string;\s*min: number;\s*max: number;\s*\} \| null>\(null\);/.test(page),
    "transient pre-adjustment range state",
  );
  const captureAt = applyFn.indexOf("const rangeBeforeAdjustment");
  assert(
    captureAt > 0 && captureAt < applyFn.indexOf('fetch("/api/quote/product-intelligence"'),
    "pre-adjustment range captured immediately before applying",
  );
  assert(
    page.includes("调整前 {preAdjustmentRange.min}–{preAdjustmentRange.max} → 调整后 {estimateMin}–"),
    "completion UI renders before / after range",
  );
  for (const line of page.split(/\r?\n/)) {
    if (!/preAdjustmentRange|rangeBeforeAdjustment/.test(line)) continue;
    assert(
      !/Storage|writeStored|productHref|JSON\.stringify/.test(line),
      "before / after comparison is not persisted",
    );
  }
  console.log("✓ budget UX (explicit flow, transient target, identity-bound cache, before / after range)");
}

function checkScope() {
  const lines = (cmd: string) =>
    execSync(cmd, { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  const changed = lines("git diff --name-only HEAD");
  const untracked = lines("git ls-files --others --exclude-standard");
  const allowed = new Set([
    "app/(product)/quote/page.tsx",
    "app/(product)/budget/page.tsx",
    "scripts/verify-c1-over-budget-adjustment.ts",
  ]);
  const knownDirty = new Set([
    "lib/commercial/action-delivery/index.ts",
    "lib/payments/wechatProvider.ts",
    "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql",
    "login-gzip.html",
  ]);
  for (const file of [...changed, ...untracked]) {
    if (knownDirty.has(file)) continue;
    assert(allowed.has(file), `C.1 scope: unexpected change ${file}`);
    assert(!file.startsWith("prisma/"), `C.1: no Prisma / schema / migration change (${file})`);
  }
  console.log("✓ scope (quote page + budget page + this verifier; no Prisma / schema / migration change)");
}

async function main() {
  checkStatus();
  await checkFlow();
  checkStatic();
  checkQuoteWorkflowUx();
  checkBudgetUx();
  checkScope();
  console.log("\nverify-c1-over-budget-adjustment: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

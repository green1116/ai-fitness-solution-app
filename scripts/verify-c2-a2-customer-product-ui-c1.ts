/**
 * Product Core v2 — C.2-A2 Quote UI + C.1 Snapshot Compatibility verification.
 * Step 4 draft / payload helpers (extracted from the Quote page and transpiled in memory),
 * customer-specified save → new Quote version → Budget, and C.1 snapshot compatibility.
 * Legacy behaviour is checked differentially against the HEAD page helpers and HEAD C.1 lib.
 * Runs the real quote/budget services with an in-memory Prisma stub. No DB, no network, no files.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

import type { BudgetItem } from "../lib/domain/tender";

const ROOT = path.resolve(__dirname, "..");
const QUOTE_PAGE = "app/(product)/quote/page.tsx";
const ADJUSTMENT_LIB = "lib/budget/over-budget-adjustment.ts";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function json(value: unknown) {
  return JSON.stringify(value);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) deepFreeze(v);
    Object.freeze(value);
  }
  return value;
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
const pi = require("../lib/product-engine/product-intelligence") as typeof import("../lib/product-engine/product-intelligence");
const adjustment = require("../lib/budget/over-budget-adjustment") as typeof import("../lib/budget/over-budget-adjustment");
const workflow = require("../app/(product)/quote/quote-workflow") as typeof import("../app/(product)/quote/quote-workflow");
const quoteService = require("../lib/services/quote.service") as typeof import("../lib/services/quote.service");
const budgetService = require("../lib/services/budget.service") as typeof import("../lib/services/budget.service");
/* eslint-enable @typescript-eslint/no-require-imports */

type Adjustment = typeof adjustment;
type Selection = import("../lib/product-engine/product-intelligence").ProductSelection;
type PiView = Awaited<ReturnType<typeof quoteService.getQuoteProductIntelligence>>;

type Draft = {
  mode: string;
  candidateId?: string;
  customBrand?: string;
  customModel?: string;
  quantity: string;
  unitPrice?: string;
  priceSourceType?: string;
  priceSourceReference?: string;
  priceQuotedAt?: string;
};
type PayloadItem = Record<string, unknown> & { slotKey: string };
type PageHelpers = {
  initialSlotDrafts(view: unknown): { drafts: Record<string, Draft>; warnings: string[] };
  buildSelectionPayload(slots: unknown[], drafts: Record<string, Draft>): PayloadItem[];
  priceDraftError(draft: Draft): string | null;
  isValidDraftQuantity(value: string): boolean;
  customDraftError?: (draft: Draft) => string | null;
};

function transpile(source: string, module: ts.ModuleKind) {
  return ts.transpileModule(source, {
    compilerOptions: { module, target: ts.ScriptTarget.ES2020, alwaysStrict: true },
  }).outputText;
}

/** Step 4 helpers live inside the page module (App Router pages cannot export them). */
function loadPageHelpers(source: string): PageHelpers {
  const start = source.indexOf("type ProductCandidateView = {");
  const end = source.indexOf("const QUOTE_PROPOSAL_KEY");
  assert(start > 0 && end > start, "locate Step 4 helper region in the Quote page");
  const region = source.slice(start, end);
  const names = [
    "initialSlotDrafts",
    "buildSelectionPayload",
    "priceDraftError",
    "isValidDraftQuantity",
    "customDraftError",
  ].filter((n) => region.includes(`function ${n}(`));
  const js = transpile(`function __factory() {\n${region}\nreturn { ${names.join(", ")} };\n}`, ts.ModuleKind.None);
  return vm.runInThisContext(`(function () {${js}\nreturn __factory();\n})()`) as PageHelpers;
}

function loadLegacyAdjustment(): Adjustment {
  const source = execSync(`git show HEAD:${ADJUSTMENT_LIB}`, { cwd: ROOT, encoding: "utf8" });
  assert(!/^import (?!type )/m.test(source), "HEAD C.1 lib has type-only imports");
  const js = transpile(source, ts.ModuleKind.CommonJS);
  const mod = { exports: {} as Record<string, unknown> };
  const fn = vm.runInThisContext(`(function (exports, module) {${js}\n})`) as (
    exports: Record<string, unknown>,
    module: { exports: Record<string, unknown> },
  ) => void;
  fn(mod.exports, mod);
  return mod.exports as unknown as Adjustment;
}

const page = loadPageHelpers(fs.readFileSync(path.join(ROOT, QUOTE_PAGE), "utf8"));
const legacyPage = loadPageHelpers(
  execSync(`git show "HEAD:${QUOTE_PAGE}"`, { cwd: ROOT, encoding: "utf8" }),
);
const legacyAdjustment = loadLegacyAdjustment();
assert(typeof page.customDraftError === "function" && legacyPage.customDraftError === undefined, "oracles: current page vs HEAD page");

const ORG = "org-c2a2";
const PROJECT = "p-c2a2";
const TREADMILL_SLOT = "有氧设备|商业级跑步机";
const ELLIPTICAL_SLOT = "有氧设备|椭圆机";
const STRENGTH_SLOT = "力量设备|综合训练器";
const FREE_WEIGHT_SLOT = "力量设备|自由力量区设备";
const PRICE_FACT = {
  unitPrice: 18800,
  currency: "CNY",
  sourceType: "supplier_quote",
  sourceReference: "SQ-C2A2-001",
  quotedAt: "2026-09-20",
};
const PRICE_DRAFT = {
  unitPrice: "18800",
  priceSourceType: "supplier_quote",
  priceSourceReference: "SQ-C2A2-001",
  priceQuotedAt: "2026-09-20",
};

async function piView(quoteId: string): Promise<PiView> {
  const view = await quoteService.getQuoteProductIntelligence({ quoteId, organizationId: ORG, projectId: PROJECT });
  return JSON.parse(json(view)) as PiView;
}

async function calculate(quoteId: string) {
  const result = await budgetService.calculateBudget({ quoteId, organizationId: ORG, projectId: PROJECT, budgetTier: "mid" });
  const s = result.engine.structure;
  const items = s.detailedItems as unknown as BudgetItem[];
  const slotKeys = s.detailedItemSlotKeys;
  return {
    items,
    slotKeys,
    min: s.totalEstimateMin,
    max: s.totalEstimateMax,
    row: (slotKey: string) => items[slotKeys.indexOf(slotKey)],
  };
}

async function saveVersion(baseQuoteId: string, selections: unknown) {
  const result = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId,
    organizationId: ORG,
    projectId: PROJECT,
    decidedBy: "user-c2a2",
    selections: JSON.parse(json(selections)),
  });
  return result.quote.id;
}

function storedSelections(quoteId: string): Selection[] {
  return (db.quotes.get(quoteId)!.companyInfo as { productSelections?: Selection[] }).productSelections ?? [];
}

function draftsValid(drafts: Record<string, Draft>) {
  return Object.values(drafts).every(
    (d) => page.isValidDraftQuantity(d.quantity) && page.priceDraftError(d) == null && page.customDraftError!(d) == null,
  );
}

function hasKeyDeep(value: unknown, keys: string[]): boolean {
  if (!value || typeof value !== "object") return false;
  return Object.entries(value as Record<string, unknown>).some(
    ([k, v]) => keys.includes(k) || hasKeyDeep(v, keys),
  );
}

function seedProject() {
  db.projects.set(PROJECT, {
    id: PROJECT,
    name: "C2A2 Project",
    clientName: "C2A2 Corp",
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

// ---------------------------------------------------------------------------
// A + B. UI payload, hydration, versioning, Budget
// ---------------------------------------------------------------------------

async function checkUiVersioningBudget() {
  seedProject();
  const base = await quoteService.generateQuote({
    projectId: PROJECT,
    workspaceId: "ws-c2a2",
    organizationId: ORG,
    companyInfo: { companyName: "C2A2 Corp", targetUsers: 200, areaM2: 400 },
  });
  const baseId = base.quote.id;
  const view0 = await piView(baseId);
  const elliptical0 = view0.slots.find((s) => s.slotKey === ELLIPTICAL_SLOT)!;
  const freeWeight0 = view0.slots.find((s) => s.slotKey === FREE_WEIGHT_SLOT)!;
  assert(elliptical0.candidates.length === 0 && freeWeight0.candidates.length === 0, "fixture: elliptical / free-weight have zero reference candidates");

  // 1. zero-candidate slot enters customer-specified mode
  const init0 = page.initialSlotDrafts(view0);
  const drafts1: Record<string, Draft> = {
    ...init0.drafts,
    [ELLIPTICAL_SLOT]: {
      mode: "custom",
      candidateId: "SKU-TM-LF-T5",
      customBrand: "  Precor ",
      customModel: " EFX 885",
      quantity: "4",
      ...PRICE_DRAFT,
    },
    [FREE_WEIGHT_SLOT]: { mode: "custom", customBrand: "Hammer Strength", customModel: "HD Elite Rack", quantity: "" },
  };
  assert(draftsValid(drafts1), "customer-specified drafts on zero-candidate slots are valid");
  assert(
    page.customDraftError!({ mode: "custom", customBrand: "", customModel: "X", quantity: "" }) === "请填写客户指定产品的品牌" &&
      page.customDraftError!({ mode: "custom", customBrand: "B", customModel: "  ", quantity: "" }) === "请填写客户指定产品的型号" &&
      page.customDraftError!({ mode: "custom", customBrand: "B".repeat(101), customModel: "X", quantity: "" }) != null &&
      page.customDraftError!({ mode: "candidate", candidateId: "x", quantity: "" }) === null,
    "incomplete / overlong custom drafts block confirmation; other modes unaffected",
  );
  assert(
    page.buildSelectionPayload(view0.slots, { [ELLIPTICAL_SLOT]: { mode: "custom", customBrand: "B", customModel: "", quantity: "3" } }).length === 0,
    "incomplete custom draft never emits a template / candidate fallback row",
  );
  console.log("✓ 1. zero-candidate slots (椭圆机 / 自由力量区设备) enter customer-specified mode");

  // 2. payload
  const payload = page.buildSelectionPayload(view0.slots, drafts1);
  const ellipticalItem = payload.find((p) => p.slotKey === ELLIPTICAL_SLOT)!;
  assert(
    json(ellipticalItem) ===
      json({ slotKey: ELLIPTICAL_SLOT, action: "replace", customProduct: { brand: "Precor", model: "EFX 885" }, quantity: 4, priceFact: PRICE_FACT }),
    `custom payload = replace + customProduct + quantity + priceFact (got ${json(ellipticalItem)})`,
  );
  const freeWeightItem = payload.find((p) => p.slotKey === FREE_WEIGHT_SLOT)!;
  assert(
    json(freeWeightItem) === json({ slotKey: FREE_WEIGHT_SLOT, action: "replace", customProduct: { brand: "Hammer Strength", model: "HD Elite Rack" } }),
    "custom payload without quantity / price keeps AI suggested quantity",
  );
  for (const item of [ellipticalItem, freeWeightItem]) {
    assert(!hasKeyDeep(item, ["candidateId", "source", "verificationStatus", "candidate"]), "custom payload carries no candidateId / source / verificationStatus");
  }
  console.log("✓ 2. payload = customProduct { brand, model }; no client candidateId / source / verificationStatus");

  // 5 / 6 / 7. save through the existing PI version flow
  const confirmed = workflow.withExplicitTemplateConfirmations(view0.slots, payload);
  const baseBefore = json(db.quotes.get(baseId));
  const quotesBefore = db.quotes.size;
  const v1Id = await saveVersion(baseId, confirmed);
  assert(v1Id !== baseId && db.quotes.size === quotesBefore + 1 && db.quotes.get(v1Id)?.status === "READY", "5. save creates a NEW READY Quote version");
  assert(json(db.quotes.get(baseId)) === baseBefore, "6. old Quote unchanged");
  const v1Stored = storedSelections(v1Id);
  const v1Elliptical = v1Stored.find((s) => s.slotKey === ELLIPTICAL_SLOT)!;
  assert(
    v1Elliptical.action === "replace" &&
      v1Elliptical.quantity === 4 &&
      json(v1Elliptical.priceFact) === json(PRICE_FACT) &&
      v1Elliptical.candidate?.source === "customer-specified" &&
      v1Elliptical.candidate.verificationStatus === "unverified" &&
      v1Elliptical.candidate.brand === "Precor" &&
      v1Elliptical.candidate.model === "EFX 885" &&
      v1Elliptical.candidate.candidateId === pi.customProductCandidateId("Precor", "EFX 885"),
    "7. new Quote stores the canonical customer-specified candidate (server identity, unverified)",
  );
  assert(
    json(pi.readStoredProductSelections(v1Stored)) === json(v1Stored),
    "7. stored selections are exactly what the canonical reader accepts",
  );
  console.log("✓ 5–7. save → NEW Quote version, old Quote immutable, canonical custom candidate stored");

  // 3 / 4. hydrate back
  const view1 = await piView(v1Id);
  const init1 = page.initialSlotDrafts(view1);
  assert(init1.warnings.length === 0, "hydration raises no 'not in candidate list' fallback warning");
  assert(
    json(init1.drafts[ELLIPTICAL_SLOT]) ===
      json({ mode: "custom", customBrand: "Precor", customModel: "EFX 885", quantity: "4", ...PRICE_DRAFT }),
    `3/4. custom selection hydrates brand / model / quantity / priceFact (got ${json(init1.drafts[ELLIPTICAL_SLOT])})`,
  );
  assert(
    json(init1.drafts[FREE_WEIGHT_SLOT]) === json({ mode: "custom", customBrand: "Hammer Strength", customModel: "HD Elite Rack", quantity: "" }),
    "custom selection without quantity hydrates with blank quantity (AI suggested quantity kept)",
  );
  assert(
    json(page.buildSelectionPayload(view1.slots, init1.drafts)) === json(payload),
    "hydrated drafts rebuild the identical payload (refresh does not fall back to template / is not dirty)",
  );
  console.log("✓ 3–4. existing custom selection hydrates into the draft without loss; refresh stays custom");

  // 8 / 9. Budget (existing generic path)
  const baseBudget = await calculate(baseId);
  const budget1 = await calculate(v1Id);
  const verifiedRow = budget1.row(ELLIPTICAL_SLOT);
  assert(
    verifiedRow.priceBasis === "VERIFIED" &&
      verifiedRow.unitPriceMin === PRICE_FACT.unitPrice &&
      verifiedRow.unitPriceMax === PRICE_FACT.unitPrice &&
      verifiedRow.quantity === 4 &&
      verifiedRow.subtotalMin === PRICE_FACT.unitPrice * 4,
    "8. custom + priceFact → VERIFIED at the exact unit price",
  );
  const estimateRow = budget1.row(FREE_WEIGHT_SLOT);
  const templateRow = baseBudget.row(FREE_WEIGHT_SLOT);
  assert(
    estimateRow.priceBasis === "ESTIMATE" &&
      estimateRow.unitPriceMin === templateRow.unitPriceMin &&
      estimateRow.unitPriceMax === templateRow.unitPriceMax &&
      estimateRow.quantity === templateRow.quantity,
    "9. custom without priceFact → ESTIMATE with the unchanged category × tier price",
  );
  console.log(`✓ 8–9. Budget: VERIFIED ${verifiedRow.name} ×${verifiedRow.quantity} @ ${verifiedRow.unitPriceMin}; ESTIMATE ${estimateRow.name} ${estimateRow.unitPriceMin}-${estimateRow.unitPriceMax}`);

  return { baseId, v1Id, view1, budget1 };
}

// ---------------------------------------------------------------------------
// C. C.1 compatibility
// ---------------------------------------------------------------------------

async function checkC1Compatibility(ctx: Awaited<ReturnType<typeof checkUiVersioningBudget>>) {
  const { v1Id, view1, budget1 } = ctx;
  const reduction = adjustment.buildQuantityReductionOptions({ items: budget1.items, slotKeys: budget1.slotKeys, slots: view1.slots });
  const option = reduction.options.find((o) => o.slotKey === ELLIPTICAL_SLOT)!;
  assert(option && option.priceBasis === "VERIFIED" && option.unitPriceMin === PRICE_FACT.unitPrice && option.currentQuantity === 4, "custom slot is an ordinary reduction option");
  const approvedResult = adjustment.readApprovedQuantities(reduction.options, { [ELLIPTICAL_SLOT]: "2" });
  assert(approvedResult.ok, "approved reduction accepted");
  const approved = approvedResult.ok ? approvedResult.approved : {};
  const projected = adjustment.estimateAdjustedTotals({
    totalEstimateMin: budget1.min,
    totalEstimateMax: budget1.max,
    options: reduction.options,
    approved,
  });
  assert(projected.reductionMin === 2 * PRICE_FACT.unitPrice && projected.reductionMax === 2 * PRICE_FACT.unitPrice, "projection = Δqty × verified price");

  const snapshot = adjustment.buildAdjustedSelectionSnapshot({ slots: view1.slots, selections: view1.selections, approved });
  assert(snapshot.ok, `10. C.1 snapshot on a custom-product slot succeeds (${json(snapshot)})`);
  const bySlot = new Map((snapshot.ok ? snapshot.selections : []).map((s) => [s.slotKey, s] as const));
  assert(
    json(bySlot.get(ELLIPTICAL_SLOT)) ===
      json({ slotKey: ELLIPTICAL_SLOT, action: "replace", customProduct: { brand: "Precor", model: "EFX 885" }, quantity: 2, priceFact: PRICE_FACT }),
    `11–13. snapshot re-sends custom brand / model, exact priceFact, approved quantity (got ${json(bySlot.get(ELLIPTICAL_SLOT))})`,
  );
  assert(
    json(bySlot.get(FREE_WEIGHT_SLOT)) ===
      json({ slotKey: FREE_WEIGHT_SLOT, action: "replace", customProduct: { brand: "Hammer Strength", model: "HD Elite Rack" } }),
    "14. unadjusted custom slot re-sent unchanged (no quantity, no priceFact added)",
  );
  assert(!hasKeyDeep(bySlot.get(ELLIPTICAL_SLOT), ["candidateId", "source", "verificationStatus"]), "snapshot never forwards custom candidateId / source / verificationStatus");

  const v1Before = json(db.quotes.get(v1Id));
  const v2Id = await saveVersion(v1Id, snapshot.ok ? snapshot.selections : []);
  assert(v2Id !== v1Id && json(db.quotes.get(v1Id)) === v1Before, "apply creates a new version; adjusted-from Quote immutable");
  const v1Stored = storedSelections(v1Id);
  const v2Stored = storedSelections(v2Id);
  const pick = (rows: Selection[], key: string) => rows.find((s) => s.slotKey === key)!;
  assert(
    json(pick(v2Stored, ELLIPTICAL_SLOT).candidate) === json(pick(v1Stored, ELLIPTICAL_SLOT).candidate) &&
      json(pick(v2Stored, ELLIPTICAL_SLOT).priceFact) === json(PRICE_FACT) &&
      pick(v2Stored, ELLIPTICAL_SLOT).quantity === 2,
    "11–13. new version: same canonical custom candidate, exact priceFact, quantity 2",
  );
  assert(
    json(pick(v2Stored, FREE_WEIGHT_SLOT).candidate) === json(pick(v1Stored, FREE_WEIGHT_SLOT).candidate) &&
      pick(v2Stored, FREE_WEIGHT_SLOT).quantity === undefined &&
      pick(v2Stored, FREE_WEIGHT_SLOT).priceFact === undefined,
    "14. new version: unadjusted custom slot unchanged",
  );
  const budget2 = await calculate(v2Id);
  assert(
    budget2.row(ELLIPTICAL_SLOT).priceBasis === "VERIFIED" &&
      budget2.row(ELLIPTICAL_SLOT).quantity === 2 &&
      budget2.row(ELLIPTICAL_SLOT).unitPriceMin === PRICE_FACT.unitPrice &&
      budget2.min === projected.totalEstimateMin &&
      budget2.max === projected.totalEstimateMax,
    "recalculated Budget: VERIFIED custom row qty 2, totals equal the projection",
  );
  console.log("✓ 10–14. C.1 adjustment on custom slots succeeds; brand / model / priceFact survive; quantity applied");

  // 15. stale reference-catalog candidate still blocks
  const strengthSlot = view1.slots.find((s) => s.slotKey === STRENGTH_SLOT)!;
  const staleRef: Selection = {
    slotKey: STRENGTH_SLOT,
    action: "confirm",
    candidate: { ...strengthSlot.candidates[0], candidateId: "stale-candidate" },
    decidedAt: "2026-10-01T00:00:00Z",
  };
  const withStale = [...view1.selections.filter((s) => s.slotKey !== STRENGTH_SLOT), staleRef];
  for (const appr of [approved, {}]) {
    const r = adjustment.buildAdjustedSelectionSnapshot({ slots: view1.slots, selections: withStale, approved: appr });
    assert(!r.ok && r.blockedSlots.includes("综合训练器"), `15. stale reference candidate still BLOCKS (approved ${json(appr)})`);
  }
  console.log("✓ 15. stale reference-catalog candidate still blocks");

  // 16. spoofed / malformed custom candidates are not trusted
  const canonical = pick(v1Stored, ELLIPTICAL_SLOT);
  const others = view1.selections.filter((s) => s.slotKey !== ELLIPTICAL_SLOT);
  const blocks = (selection: unknown, label: string) => {
    const r = adjustment.buildAdjustedSelectionSnapshot({
      slots: view1.slots,
      selections: [...others, selection as Selection],
      approved: {},
    });
    assert(!r.ok && r.blockedSlots.includes("椭圆机"), `16. ${label} → blocked (got ${json(r)})`);
  };
  const rawStored = pi.readStoredProductSelections([
    { ...canonical, candidate: { ...canonical.candidate, candidateId: "custom:forged" } },
  ])[0];
  assert(rawStored.candidate === null && rawStored.priceFact === undefined, "canonical reader drops a forged custom: id");
  blocks(rawStored, "raw stored JSON with forged custom: id (after canonical read)");
  blocks({ ...canonical, candidate: { ...canonical.candidate, source: "reference-catalog" } }, "custom: id relabelled reference-catalog");
  blocks({ ...canonical, candidate: { ...canonical.candidate, verificationStatus: "verified" } }, "custom candidate claiming verified");
  blocks({ ...canonical, candidate: { ...canonical.candidate, brand: " " } }, "custom candidate with blank brand");
  blocks({ ...canonical, candidate: { ...canonical.candidate, model: "" } }, "custom candidate with empty model");
  blocks({ ...canonical, action: "confirm" }, "custom candidate under action confirm");

  const tampered = adjustment.buildAdjustedSelectionSnapshot({
    slots: view1.slots,
    selections: [...others, { ...canonical, candidate: { ...canonical.candidate!, brand: " precor  " } }],
    approved: {},
  });
  assert(tampered.ok, "fixture: structurally valid tampered brand passes the client snapshot");
  const resolved = pi.resolveProductSelectionInputs({
    inputs: tampered.ok ? tampered.selections : [],
    slots: view1.slots,
    decidedAt: "2026-10-02T00:00:00.000Z",
  });
  const resolvedElliptical = resolved.find((s) => s.slotKey === ELLIPTICAL_SLOT)!;
  assert(
    resolvedElliptical.candidate?.source === "customer-specified" &&
      resolvedElliptical.candidate.verificationStatus === "unverified" &&
      resolvedElliptical.candidate.brand === "precor" &&
      resolvedElliptical.candidate.candidateId === pi.customProductCandidateId("Precor", "EFX 885"),
    "server re-derives normalized identity on save; tampering can never yield a reference-catalog / verified product",
  );

  const spoofView = {
    ...view1,
    selections: [{ ...canonical, candidate: { ...canonical.candidate, source: "reference-catalog" } }],
  };
  const spoofInit = page.initialSlotDrafts(spoofView);
  assert(
    spoofInit.drafts[ELLIPTICAL_SLOT].mode === "template" && spoofInit.warnings.length === 1,
    "page never treats a non-customer-specified custom: id as customer-specified (existing fallback + warning)",
  );
  console.log("✓ 16. forged / malformed custom candidates block or are re-derived server-side; never silently trusted");
}

// ---------------------------------------------------------------------------
// D. regression (differential vs HEAD) + mutation
// ---------------------------------------------------------------------------

async function checkRegression(ctx: Awaited<ReturnType<typeof checkUiVersioningBudget>>) {
  const view0 = await piView(ctx.baseId);
  const treadmill = view0.slots.find((s) => s.slotKey === TREADMILL_SLOT)!;
  const strength = view0.slots.find((s) => s.slotKey === STRENGTH_SLOT)!;
  const t0 = treadmill.candidates[0];
  const t1 = treadmill.candidates[1];

  // 17 / 18. page helpers identical to HEAD for reference / template / remove
  const legacyViews = [
    { ...view0, selections: [] },
    {
      ...view0,
      selections: [
        { slotKey: TREADMILL_SLOT, action: "confirm", candidate: t0, quantity: 3, priceFact: PRICE_FACT },
        { slotKey: STRENGTH_SLOT, action: "replace", candidate: strength.candidates[1] },
        { slotKey: ELLIPTICAL_SLOT, action: "confirm", candidate: null, quantity: 2 },
        { slotKey: FREE_WEIGHT_SLOT, action: "remove", candidate: null },
      ],
    },
    { ...view0, selections: [{ slotKey: TREADMILL_SLOT, action: "replace", candidate: { ...t1, candidateId: "SKU-GONE" }, quantity: 5 }] },
  ];
  for (const v of legacyViews) {
    assert(
      json(page.initialSlotDrafts(structuredClone(v))) === json(legacyPage.initialSlotDrafts(structuredClone(v))),
      `17/18. initialSlotDrafts identical to HEAD for ${json(v.selections)}`,
    );
  }
  const draftSets: Array<Record<string, Draft>> = [
    {},
    { [TREADMILL_SLOT]: { mode: "template", quantity: "" } },
    { [TREADMILL_SLOT]: { mode: "template", quantity: String(treadmill.templateQuantity) } },
    { [TREADMILL_SLOT]: { mode: "template", quantity: "7" } },
    { [TREADMILL_SLOT]: { mode: "candidate", candidateId: t0.candidateId, quantity: "" } },
    { [TREADMILL_SLOT]: { mode: "candidate", candidateId: t1.candidateId, quantity: "6", ...PRICE_DRAFT } },
    { [TREADMILL_SLOT]: { mode: "candidate", candidateId: t1.candidateId, quantity: "", unitPrice: "100" } },
    { [TREADMILL_SLOT]: { mode: "candidate", quantity: "3" } },
    { [FREE_WEIGHT_SLOT]: { mode: "remove", quantity: "" }, [ELLIPTICAL_SLOT]: { mode: "template", quantity: "1" } },
  ];
  for (const drafts of draftSets) {
    assert(
      json(page.buildSelectionPayload(view0.slots, structuredClone(drafts))) ===
        json(legacyPage.buildSelectionPayload(view0.slots, structuredClone(drafts))),
      `17/18. buildSelectionPayload identical to HEAD for ${json(drafts)}`,
    );
    for (const d of Object.values(drafts)) {
      assert(page.priceDraftError(d) === legacyPage.priceDraftError(d), "priceDraftError identical to HEAD");
      assert(page.isValidDraftQuantity(d.quantity) === legacyPage.isValidDraftQuantity(d.quantity), "isValidDraftQuantity identical to HEAD");
      assert(page.customDraftError!(d) === null, "customDraftError inert outside custom mode");
    }
  }
  console.log(`✓ 17–18. reference / template / confirm / remove UI behaviour identical to HEAD (${legacyViews.length} views, ${draftSets.length} draft sets)`);

  // 19. C.1 identical to HEAD for reference-only configurations
  const vRefId = await saveVersion(ctx.baseId, [
    { slotKey: STRENGTH_SLOT, action: "confirm", candidateId: strength.candidates[0].candidateId, quantity: 9, priceFact: PRICE_FACT },
    { slotKey: TREADMILL_SLOT, action: "confirm", candidateId: null, quantity: 1 },
    { slotKey: FREE_WEIGHT_SLOT, action: "remove" },
  ]);
  const viewRef = await piView(vRefId);
  const budgetRef = await calculate(vRefId);
  const cmp = (label: string, f: (m: Adjustment) => unknown) =>
    assert(json(f(adjustment)) === json(f(legacyAdjustment)), `19. ${label} identical to HEAD`);
  for (const target of [1, budgetRef.min - 1, budgetRef.min, budgetRef.max - 1, budgetRef.max, budgetRef.max + 1]) {
    cmp(`classifyBudgetTarget(${target})`, (m) => m.classifyBudgetTarget(target, budgetRef.min, budgetRef.max));
  }
  for (const text of ["", "abc", "0", "-1", "500,000", " 12345 "]) cmp(`parseTargetBudget("${text}")`, (m) => m.parseTargetBudget(text));
  cmp("ADJUSTMENT_MIN_QUANTITY", (m) => m.ADJUSTMENT_MIN_QUANTITY);
  const options = (m: Adjustment) => m.buildQuantityReductionOptions({ items: budgetRef.items, slotKeys: budgetRef.slotKeys, slots: viewRef.slots });
  cmp("buildQuantityReductionOptions", options);
  const refOptions = options(adjustment).options;
  for (const drafts of [{ [STRENGTH_SLOT]: "4" }, { [STRENGTH_SLOT]: "0" }, { [STRENGTH_SLOT]: "10" }, { [ELLIPTICAL_SLOT]: "1" }]) {
    cmp(`readApprovedQuantities(${json(drafts)})`, (m) => m.readApprovedQuantities(refOptions, drafts));
  }
  cmp("estimateAdjustedTotals", (m) =>
    m.estimateAdjustedTotals({ totalEstimateMin: budgetRef.min, totalEstimateMax: budgetRef.max, options: refOptions, approved: { [STRENGTH_SLOT]: 4, [ELLIPTICAL_SLOT]: 1 } }),
  );
  const staleSelections = viewRef.selections.map((s) =>
    s.slotKey === STRENGTH_SLOT && s.candidate ? { ...s, candidate: { ...s.candidate, candidateId: "stale" } } : s,
  );
  for (const [label, selections, approvedQty] of [
    ["reference snapshot", viewRef.selections, { [STRENGTH_SLOT]: 4 }],
    ["reference snapshot (no approval)", viewRef.selections, {}],
    ["remove slot approval", viewRef.selections, { [FREE_WEIGHT_SLOT]: 1 }],
    ["stale reference", staleSelections, { [ELLIPTICAL_SLOT]: 1 }],
    ["unknown approved slot", viewRef.selections, { "有氧设备|不存在": 1 }],
  ] as Array<[string, Selection[], Record<string, number>]>) {
    cmp(label, (m) => m.buildAdjustedSelectionSnapshot({ slots: viewRef.slots, selections, approved: approvedQty }));
  }
  console.log("✓ 19. C.1 status / options / min quantity / projection / snapshot identical to HEAD for reference configurations");

  // 20. no source object mutation
  const view1 = deepFreeze(await piView(ctx.v1Id));
  const view1Json = json(view1);
  const init = page.initialSlotDrafts(view1);
  const frozenDrafts = deepFreeze(structuredClone(init.drafts));
  page.buildSelectionPayload(view1.slots, frozenDrafts);
  const frozenApproved = deepFreeze({ [ELLIPTICAL_SLOT]: 2 });
  const snap = adjustment.buildAdjustedSelectionSnapshot({ slots: view1.slots, selections: view1.selections, approved: frozenApproved });
  assert(json(view1) === view1Json && json(frozenDrafts) === json(init.drafts), "20. helpers / snapshot never mutate view, drafts or selections");
  if (snap.ok) {
    const out = snap.selections.find((s) => s.slotKey === ELLIPTICAL_SLOT)!;
    const source = view1.selections.find((s) => s.slotKey === ELLIPTICAL_SLOT)!;
    assert(out.priceFact === source.priceFact || json(out.priceFact) === json(source.priceFact), "priceFact forwarded exactly");
  }
  console.log("✓ 20. no mutation of views, drafts, selections or approvals");
}

// ---------------------------------------------------------------------------
// static + scope
// ---------------------------------------------------------------------------

function sliceBetween(src: string, start: string, end: string) {
  const a = src.indexOf(start);
  const b = src.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `locate ${start}`);
  return src.slice(a, b);
}

function checkStaticAndScope() {
  const quote = fs.readFileSync(path.join(ROOT, QUOTE_PAGE), "utf8");
  const step4 = sliceBetween(quote, "第 4 步：产品配置", '"确认产品配置"');
  assert(step4.includes("{REFERENCE_CANDIDATE_BADGE}") && step4.includes("{CUSTOMER_SPECIFIED_BADGE}"), "Step 4 renders both source badges");
  assert(quote.includes('const REFERENCE_CANDIDATE_BADGE = "参考候选 / 未核实";') && quote.includes('const CUSTOMER_SPECIFIED_BADGE = "客户指定 / 参数未核实";'), "badge copy");
  const customBlock = sliceBetween(step4, 'checked={draft.mode === "custom"}', "{draft.mode === \"custom\" ? (");
  assert(!customBlock.includes("REFERENCE_CANDIDATE_BADGE") && !customBlock.includes("参考候选"), "customer-specified option is never labelled a reference candidate");
  const payloadFn = sliceBetween(quote, "function buildSelectionPayload(", "function isValidDraftQuantity(");
  assert(!/source|verificationStatus/.test(payloadFn), "payload builder never emits source / verificationStatus");
  for (const line of ["AI 建议数量", "当前方案数量", "确认数量（留空则采用 AI 建议数量）"]) {
    assert(step4.includes(line), `quantity semantics copy kept: ${line}`);
  }
  const lib = fs.readFileSync(path.join(ROOT, ADJUSTMENT_LIB), "utf8");
  assert(!/^import (?!type )/m.test(lib), "C.1 lib keeps type-only imports (client-safe)");
  assert(!/custom:/.test(lib), "C.1 lib does not parse custom: ids (trusts the canonical reader's source field)");

  const lines = (cmd: string) =>
    execSync(cmd, { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  const allowed = new Set([
    "lib/product-engine/product-intelligence.ts",
    "scripts/verify-c2-a1-customer-specified-product.ts",
    QUOTE_PAGE,
    ADJUSTMENT_LIB,
    "scripts/verify-c2-a2-customer-product-ui-c1.ts",
    "lib/domain/tender.ts",
    "lib/services/tender/generateBudget.ts",
    "lib/pdf/budgetRender.ts",
    "lib/pdf/renderPlanPdf.ts",
    "lib/services/quote.service.ts",
    "scripts/verify-c2-a3-delivery-semantics.ts",
  ]);
  const knownDirty = new Set([
    "lib/commercial/action-delivery/index.ts",
    "lib/payments/wechatProvider.ts",
    "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql",
    "login-gzip.html",
  ]);
  for (const file of [...lines("git diff --name-only HEAD"), ...lines("git ls-files --others --exclude-standard")]) {
    if (knownDirty.has(file)) continue;
    assert(allowed.has(file), `C.2-A2 scope: unexpected change ${file}`);
    assert(!file.startsWith("prisma/"), `C.2-A2: no Prisma / schema / migration change (${file})`);
  }
  console.log("✓ static + scope (C.2-A1/A2/A3 files only; no Prisma change)");
}

async function main() {
  const ctx = await checkUiVersioningBudget();
  await checkC1Compatibility(ctx);
  await checkRegression(ctx);
  checkStaticAndScope();
  console.log("\nverify-c2-a2-customer-product-ui-c1: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

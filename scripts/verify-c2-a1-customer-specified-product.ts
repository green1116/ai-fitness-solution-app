/**
 * Product Core v2 — C.2-A1 Customer-Specified Product Foundation verification.
 * Customer-specified products on existing PI slots: server-side identity, trust boundary,
 * canonical stored reads, priceFact attachment, and byte-identical legacy behaviour
 * (differential against the HEAD implementation, transpiled in memory).
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
const PI_FILE = "lib/product-engine/product-intelligence.ts";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function json(value: unknown) {
  return JSON.stringify(value);
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
const templates = require("../lib/templates/placeholderTemplates") as typeof import("../lib/templates/placeholderTemplates");
const skuDb = require("../lib/tender/sku/skuDatabase") as typeof import("../lib/tender/sku/skuDatabase");
const adjustment = require("../lib/budget/over-budget-adjustment") as typeof import("../lib/budget/over-budget-adjustment");
const quoteService = require("../lib/services/quote.service") as typeof import("../lib/services/quote.service");
const budgetService = require("../lib/services/budget.service") as typeof import("../lib/services/budget.service");
/* eslint-enable @typescript-eslint/no-require-imports */

type PI = typeof pi;
type Selection = import("../lib/product-engine/product-intelligence").ProductSelection;
type Slot = import("../lib/product-engine/product-intelligence").ProductCandidateSlot;

/** HEAD implementation of product-intelligence.ts, transpiled in memory (legacy oracle). */
function loadLegacyPi(): PI {
  const source = execSync(`git show HEAD:${PI_FILE}`, { cwd: ROOT, encoding: "utf8" });
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const dir = path.join(ROOT, path.dirname(PI_FILE));
  /* eslint-disable @typescript-eslint/no-require-imports */
  const localRequire = (spec: string) =>
    spec.startsWith("@/")
      ? require(path.join(ROOT, spec.slice(2)))
      : spec.startsWith(".")
        ? require(path.join(dir, spec))
        : require(spec);
  /* eslint-enable @typescript-eslint/no-require-imports */
  const mod = { exports: {} as Record<string, unknown> };
  const fn = vm.runInThisContext(`(function (exports, require, module) {${js}\n})`) as (
    exports: Record<string, unknown>,
    require: (spec: string) => unknown,
    module: { exports: Record<string, unknown> },
  ) => void;
  fn(mod.exports, localRequire, mod);
  return mod.exports as unknown as PI;
}

const legacy = loadLegacyPi();

const ORG = "org-c2a1";
const PROJECT = "p-c2a1";
const TREADMILL_SLOT = "有氧设备|商业级跑步机";
const ELLIPTICAL_SLOT = "有氧设备|椭圆机";
const STRENGTH_SLOT = "力量设备|综合训练器";
const FREE_WEIGHT_SLOT = "力量设备|自由力量区设备";
const DECIDED_AT = "2026-10-01T00:00:00.000Z";
const PRICE_FACT = {
  unitPrice: 18800,
  currency: "CNY",
  sourceType: "supplier_quote",
  sourceReference: "SQ-C2A1-001",
  quotedAt: "2026-09-20",
};

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) deepFreeze(v);
    Object.freeze(value);
  }
  return value;
}

function fixturePlaceholders() {
  return templates.buildPlaceholders(PROJECT, {
    name: "C2A1",
    siteType: "office",
    targetUsers: 200,
    areaM2: 400,
    city: "上海市",
    budgetLevel: "mid",
    deliveryMode: "standard",
  });
}

function resolveOrError(impl: PI, inputs: unknown, slots: Slot[]) {
  try {
    return { ok: true, value: impl.resolveProductSelectionInputs({ inputs, slots, decidedAt: DECIDED_AT, decidedBy: "u1" }) };
  } catch (err) {
    return { ok: false, error: `${(err as Error).name}:${(err as Error).message}` };
  }
}

function resolveCustom(slots: Slot[], row: Record<string, unknown>) {
  return pi.resolveProductSelectionInputs({ inputs: [row], slots, decidedAt: DECIDED_AT })[0];
}

function expectReject(slots: Slot[], row: Record<string, unknown>, fragment: string, label: string) {
  const r = resolveOrError(pi, [row], slots);
  assert(!r.ok && String(r.error).startsWith("ProductSelectionInputError:") && String(r.error).includes(fragment), `${label} (got ${json(r)})`);
}

// ---------------------------------------------------------------------------
// 1. reference-catalog behaviour unchanged (differential vs HEAD)
// ---------------------------------------------------------------------------

function checkReferenceUnchanged() {
  const placeholders = fixturePlaceholders();
  const slots = pi.buildCandidateSlots(placeholders);
  assert(json(slots) === json(legacy.buildCandidateSlots(placeholders)), "buildCandidateSlots identical to HEAD");
  assert(json(pi.PRODUCT_SLOT_CATEGORIES) === json(["有氧设备", "力量设备"]), "PRODUCT_SLOT_CATEGORIES unchanged");
  for (const slot of slots) {
    for (const c of slot.candidates) {
      assert(c.source === "reference-catalog" && c.verificationStatus === "unverified", "slot candidates stay reference-catalog / unverified");
    }
  }
  const treadmill = slots.find((s) => s.slotKey === TREADMILL_SLOT)!;
  const strength = slots.find((s) => s.slotKey === STRENGTH_SLOT)!;
  assert(treadmill.candidates.length > 1 && strength.candidates.length > 0, "fixture: catalog candidates present");

  const cases: unknown[] = [
    [],
    [{ slotKey: TREADMILL_SLOT, action: "confirm", candidateId: treadmill.candidates[0].candidateId, quantity: 3, priceFact: PRICE_FACT }],
    [{ slotKey: TREADMILL_SLOT, action: "replace", candidateId: treadmill.candidates[1].candidateId }],
    [{ slotKey: ELLIPTICAL_SLOT, action: "confirm", candidateId: null, quantity: 2 }],
    [{ slotKey: FREE_WEIGHT_SLOT, action: "remove", candidateId: treadmill.candidates[0].candidateId, quantity: 4 }],
    [{ slotKey: ` ${STRENGTH_SLOT} `, action: "confirm", candidateId: ` ${strength.candidates[0].candidateId} `, quantity: "5" }],
    [
      { slotKey: STRENGTH_SLOT, action: "confirm", candidateId: strength.candidates[0].candidateId },
      { slotKey: STRENGTH_SLOT, action: "replace", candidateId: strength.candidates[strength.candidates.length - 1].candidateId },
    ],
    // error paths
    "not-an-array",
    [null],
    [{ slotKey: "有氧设备|不存在", action: "confirm" }],
    [{ slotKey: TREADMILL_SLOT, action: "upgrade" }],
    [{ slotKey: TREADMILL_SLOT, action: "confirm", quantity: 0 }],
    [{ slotKey: TREADMILL_SLOT, action: "confirm", candidateId: "SKU-NOPE" }],
    [{ slotKey: ELLIPTICAL_SLOT, action: "confirm", candidateId: "custom:fake:id" }],
    [{ slotKey: ELLIPTICAL_SLOT, action: "replace" }],
    [{ slotKey: ELLIPTICAL_SLOT, action: "confirm", priceFact: PRICE_FACT }],
    [{ slotKey: TREADMILL_SLOT, action: "confirm", candidateId: treadmill.candidates[0].candidateId, priceFact: { ...PRICE_FACT, currency: "USD" } }],
  ];
  for (const inputs of cases) {
    const a = resolveOrError(pi, structuredClone(inputs), slots);
    const b = resolveOrError(legacy, structuredClone(inputs), slots);
    assert(json(a) === json(b), `resolve identical to HEAD for ${json(inputs)}\n  new: ${json(a)}\n  old: ${json(b)}`);
  }

  const customInput = [{ slotKey: ELLIPTICAL_SLOT, action: "replace", customProduct: { brand: "B", model: "M" } }];
  const oracle = resolveOrError(legacy, customInput, slots);
  assert(
    legacy !== pi && !oracle.ok && String(oracle.error).includes("替换需指定候选"),
    "oracle is the HEAD implementation (rejects customProduct as a candidate-less replace)",
  );
  const selections = pi.resolveProductSelectionInputs({ inputs: cases[1], slots, decidedAt: DECIDED_AT });
  assert(
    json(pi.applyProductSelections(placeholders, selections)) === json(legacy.applyProductSelections(placeholders, selections)),
    "applyProductSelections identical to HEAD for reference selections",
  );
  console.log(`✓ 1. reference-catalog behaviour identical to HEAD (${cases.length} resolve cases, slots, apply)`);
}

// ---------------------------------------------------------------------------
// 2–7. customer-specified product
// ---------------------------------------------------------------------------

function checkCustomProduct() {
  const placeholders = fixturePlaceholders();
  const slots = pi.buildCandidateSlots(placeholders);
  const elliptical = slots.find((s) => s.slotKey === ELLIPTICAL_SLOT)!;
  assert(Boolean(elliptical) && elliptical.candidates.length === 0, "fixture: elliptical slot exists with no catalog candidate");

  // 2. resolve on a slot without catalog candidates
  const sel = resolveCustom(slots, {
    slotKey: ELLIPTICAL_SLOT,
    action: "replace",
    customProduct: { brand: "Precor", model: "EFX 885" },
    quantity: 3,
  });
  assert(sel.action === "replace" && sel.quantity === 3 && sel.slotKey === ELLIPTICAL_SLOT, "custom selection keeps slot / action / quantity");
  assert(
    sel.candidate?.brand === "Precor" &&
      sel.candidate.model === "EFX 885" &&
      sel.candidate.source === "customer-specified" &&
      sel.candidate.verificationStatus === "unverified" &&
      sel.candidate.category === elliptical.subCategory,
    "elliptical resolves a customer-specified brand + model",
  );
  console.log("✓ 2. slot without catalog candidates (椭圆机) resolves a customer-specified product");

  // 3. normalization
  const messy = resolveCustom(slots, {
    slotKey: ELLIPTICAL_SLOT,
    action: "replace",
    customProduct: { brand: "  Life \t Fitness\n", model: " Cafe\u0301   X1 " },
  });
  assert(messy.candidate?.brand === "Life Fitness", "brand: surrounding whitespace trimmed, inner runs collapsed");
  assert(messy.candidate?.model === "Caf\u00e9 X1", "model: NFC-normalized, whitespace collapsed");
  const again = resolveCustom(slots, {
    slotKey: ELLIPTICAL_SLOT,
    action: "replace",
    customProduct: { brand: "Life Fitness", model: "Caf\u00e9 X1" },
  });
  assert(json(again.candidate) === json(messy.candidate), "normalization is deterministic (equivalent inputs → identical candidate)");
  console.log("✓ 3. brand / model normalization deterministic (trim, collapse, NFC)");

  // 4. identity
  const id = sel.candidate!.candidateId;
  assert(id === pi.customProductCandidateId("Precor", "EFX 885"), "candidateId generated by the server helper");
  assert(id.startsWith(pi.CUSTOM_CANDIDATE_ID_PREFIX) && pi.CUSTOM_CANDIDATE_ID_PREFIX === "custom:", "custom: prefix");
  const same = resolveCustom(slots, { slotKey: ELLIPTICAL_SLOT, action: "replace", customProduct: { brand: "PRECOR", model: "efx 885" } });
  assert(same.candidate!.candidateId === id, "candidateId case-insensitive and deterministic");
  assert(same.candidate!.brand === "PRECOR", "display text keeps the customer's casing");
  assert(
    pi.customProductCandidateId("a:b", "c") !== pi.customProductCandidateId("a", "b:c"),
    "separator injection cannot collide two different products",
  );
  assert(pi.customProductCandidateId("Precor", "EFX 885") !== pi.customProductCandidateId("Precor", "EFX 835"), "different model → different id");
  assert(!skuDb.getAllSkus().some((s) => s.id.startsWith("custom:")), "no reference catalog id uses the custom: prefix");
  const onCatalogSlot = resolveCustom(slots, {
    slotKey: TREADMILL_SLOT,
    action: "replace",
    customProduct: { brand: "Life Fitness", model: "T5" },
  });
  const catalogT5 = slots.find((s) => s.slotKey === TREADMILL_SLOT)!.candidates.find((c) => c.model === "T5")!;
  assert(
    onCatalogSlot.candidate!.source === "customer-specified" && onCatalogSlot.candidate!.candidateId !== catalogT5.candidateId,
    "custom product with catalog brand/model never collides with or becomes the catalog candidate",
  );
  console.log("✓ 4. candidateId deterministic, server-generated, collision-free with catalog ids");

  // 5. invalid input
  const base = { slotKey: ELLIPTICAL_SLOT, action: "replace" };
  expectReject(slots, { ...base, customProduct: { brand: "", model: "X" } }, "请填写客户指定产品的品牌", "empty brand rejected");
  expectReject(slots, { ...base, customProduct: { brand: "   ", model: "X" } }, "请填写客户指定产品的品牌", "whitespace-only brand rejected");
  expectReject(slots, { ...base, customProduct: { brand: "B", model: " \n " } }, "请填写客户指定产品的型号", "whitespace-only model rejected");
  expectReject(slots, { ...base, customProduct: { brand: "B" } }, "请填写客户指定产品的型号", "missing model rejected");
  expectReject(slots, { ...base, customProduct: { brand: 7, model: "X" } }, "请填写客户指定产品的品牌", "non-string brand rejected");
  expectReject(slots, { ...base, customProduct: "Precor EFX" }, "客户指定产品格式无效", "non-object customProduct rejected");
  expectReject(slots, { ...base, customProduct: ["Precor", "EFX"] }, "客户指定产品格式无效", "array customProduct rejected");
  expectReject(slots, { ...base, customProduct: { brand: "B".repeat(101), model: "X" } }, "不超过 100 字", "overlong brand rejected");
  assert(Boolean(resolveCustom(slots, { ...base, customProduct: { brand: "B".repeat(100), model: "X" } }).candidate), "100-char brand accepted");
  expectReject(slots, { ...base, customProduct: { brand: "B\u0000", model: "X" } }, "包含无效字符", "control character rejected");
  expectReject(slots, { ...base, action: "confirm", customProduct: { brand: "B", model: "X" } }, "需使用替换操作", "confirm + customProduct rejected");
  expectReject(slots, { ...base, action: "remove", customProduct: { brand: "B", model: "X" } }, "需使用替换操作", "remove + customProduct rejected");
  expectReject(slots, { ...base, slotKey: "智能系统|门禁与会员管理系统", customProduct: { brand: "B", model: "X" } }, "当前方案中不存在该设备位", "non-PI category rejected (no new slots)");
  expectReject(slots, { ...base, slotKey: "有氧设备|动感单车", customProduct: { brand: "B", model: "X" } }, "当前方案中不存在该设备位", "unknown slot rejected");
  console.log("✓ 5. empty / malformed / overlong brand-model and wrong action / slot rejected");

  // 6. spoofing
  const spoof = resolveCustom(slots, {
    slotKey: ELLIPTICAL_SLOT,
    action: "replace",
    customProduct: {
      brand: "Precor",
      model: "EFX 885",
      source: "reference-catalog",
      verificationStatus: "verified",
      candidateId: catalogT5.candidateId,
      keySpecs: ["伪造参数"],
    },
    source: "reference-catalog",
    verificationStatus: "verified",
  });
  assert(
    json(spoof.candidate) === json(sel.candidate),
    "client source / verificationStatus / candidateId / keySpecs inside or beside customProduct are ignored",
  );
  expectReject(
    slots,
    { slotKey: TREADMILL_SLOT, action: "replace", candidateId: catalogT5.candidateId, customProduct: { brand: "Precor", model: "EFX 885" } },
    "不能同时指定参考候选",
    "customProduct combined with a catalog candidateId rejected",
  );
  expectReject(slots, { slotKey: ELLIPTICAL_SLOT, action: "replace", candidateId: id }, "候选不存在", "replaying a custom: id without customProduct rejected");
  expectReject(slots, { slotKey: ELLIPTICAL_SLOT, action: "replace", candidateId: catalogT5.candidateId }, "候选不存在", "catalog id from another slot rejected");

  const stored = (candidate: Record<string, unknown>, priceFact: unknown = PRICE_FACT) =>
    pi.readStoredProductSelections([{ slotKey: ELLIPTICAL_SLOT, action: "replace", candidate, priceFact, decidedAt: DECIDED_AT }])[0];
  const canonical = sel.candidate as unknown as Record<string, unknown>;
  const kept = stored(canonical);
  assert(json(kept.candidate) === json(sel.candidate) && json(kept.priceFact) === json(PRICE_FACT), "canonical stored custom candidate + priceFact preserved");
  const rejectedStored: Array<[string, Record<string, unknown>]> = [
    ["verified claim", { ...canonical, verificationStatus: "verified" }],
    ["non-canonical id", { ...canonical, candidateId: "custom:anything" }],
    ["catalog id with custom source", { ...canonical, candidateId: catalogT5.candidateId }],
    ["custom id relabelled reference-catalog", { ...canonical, source: "reference-catalog" }],
    ["custom id without source", { ...canonical, source: undefined }],
    ["untrimmed brand", { ...canonical, brand: " Precor " }],
    ["brand changed under same id", { ...canonical, brand: "Matrix" }],
    ["empty model", { ...canonical, model: "" }],
  ];
  for (const [label, candidate] of rejectedStored) {
    const read = stored(candidate);
    assert(read.candidate === null && read.priceFact === undefined, `stored ${label} → candidate dropped (never elevated), priceFact dropped`);
  }
  const snapshotWithCustom = pi.readStoredProductIntelligence({
    version: pi.PRODUCT_INTELLIGENCE_VERSION,
    slots: [{ slotKey: ELLIPTICAL_SLOT, category: "有氧设备", subCategory: "椭圆机", templateQuantity: 2, priceBand: "mid", candidates: [canonical] }],
    requirements: [],
  });
  assert(snapshotWithCustom!.slots[0].candidates.length === 0, "stored PI slots never list customer-specified candidates");
  console.log("✓ 6. spoofed source / verificationStatus / catalog identity cannot elevate a custom product");

  // 7. priceFact
  const priced = resolveCustom(slots, {
    slotKey: ELLIPTICAL_SLOT,
    action: "replace",
    customProduct: { brand: "Precor", model: "EFX 885" },
    quantity: 4,
    priceFact: PRICE_FACT,
  });
  assert(json(priced.priceFact) === json(PRICE_FACT), "existing ProductPriceFact attached to the custom selection");
  expectReject(
    slots,
    { slotKey: ELLIPTICAL_SLOT, action: "replace", customProduct: { brand: "Precor", model: "EFX 885" }, priceFact: { ...PRICE_FACT, sourceReference: "" } },
    "请填写价格来源凭据",
    "invalid priceFact on a custom product rejected by the existing validator",
  );
  const roundTrip = pi.readStoredProductSelections(JSON.parse(json([priced])));
  assert(json(roundTrip) === json([priced]), "custom selection + priceFact round-trips through stored JSON");
  const applied = pi.applyProductSelections(placeholders, [priced]);
  const row = applied.placeholders.find((p) => p.subCategory === "椭圆机")!;
  assert(
    applied.appliedCount === 1 &&
      row.brand === "Precor" &&
      row.model === "EFX 885" &&
      row.quantity === 4 &&
      row.skuId === priced.candidate!.candidateId &&
      json(row.priceFact) === json(PRICE_FACT),
    "shared overlay carries custom brand / model / quantity / priceFact onto the existing slot",
  );
  assert(skuDb.getSkuById(row.skuId!) === undefined, "custom skuId never resolves to a catalog SKU");
  console.log("✓ 7. existing ProductPriceFact stays attached through resolve → store → read → overlay");
}

// ---------------------------------------------------------------------------
// 8. legacy stored selections unchanged; 9. no mutation
// ---------------------------------------------------------------------------

function checkLegacyAndMutation() {
  const placeholders = fixturePlaceholders();
  const slots = pi.buildCandidateSlots(placeholders);
  const treadmill = slots.find((s) => s.slotKey === TREADMILL_SLOT)!;
  const legacyStored = [
    { slotKey: TREADMILL_SLOT, action: "confirm", candidate: treadmill.candidates[0], quantity: 3, priceFact: PRICE_FACT, decidedAt: DECIDED_AT, decidedBy: "u1" },
    { slotKey: STRENGTH_SLOT, action: "replace", candidate: { candidateId: "SKU-OLD", brand: " Old ", model: " M1 ", source: "whatever", verificationStatus: "verified", keySpecs: ["a", 1, " b "] }, decidedAt: DECIDED_AT },
    { slotKey: ELLIPTICAL_SLOT, action: "confirm", candidate: null, quantity: 2, decidedAt: DECIDED_AT },
    { slotKey: FREE_WEIGHT_SLOT, action: "remove", candidate: treadmill.candidates[0], quantity: 5, priceFact: PRICE_FACT },
    { slotKey: "有氧设备|无效", action: "upgrade" },
    { slotKey: "", action: "confirm" },
    null,
    { slotKey: TREADMILL_SLOT, action: "replace", candidate: { candidateId: "", brand: "B", model: "" }, priceFact: PRICE_FACT },
    { slotKey: STRENGTH_SLOT, action: "confirm", candidate: { brand: "NoId", model: "M" }, priceFact: { ...PRICE_FACT, unitPrice: -1 } },
  ];
  const before = json(legacyStored);
  const a = pi.readStoredProductSelections(structuredClone(legacyStored));
  const b = legacy.readStoredProductSelections(structuredClone(legacyStored));
  assert(json(a) === json(b), `legacy stored selections read identically to HEAD\n  new: ${json(a)}\n  old: ${json(b)}`);
  assert(json(pi.readStoredProductSelections("x")) === json(legacy.readStoredProductSelections("x")), "non-array stored value identical");

  const legacySnapshot = legacy.buildProductIntelligenceSnapshot({
    notes: "面积 400㎡，偏重力量",
    templatePlaceholders: placeholders,
    selections: b,
    generatedAt: DECIDED_AT,
  });
  const storedSnapshot = JSON.parse(json(legacySnapshot));
  assert(
    json(pi.readStoredProductIntelligence(storedSnapshot)) === json(legacy.readStoredProductIntelligence(storedSnapshot)),
    "legacy stored PI snapshot read identically to HEAD",
  );
  assert(
    json(pi.buildProductIntelligenceSnapshot({ notes: "面积 400㎡，偏重力量", templatePlaceholders: placeholders, selections: b, generatedAt: DECIDED_AT })) ===
      json(legacySnapshot),
    "buildProductIntelligenceSnapshot identical to HEAD",
  );
  console.log("✓ 8. legacy stored selections / PI snapshots read identically to HEAD");

  // 9. no source object mutation (frozen inputs would throw on write in strict mode)
  const frozenInputs = deepFreeze([
    { slotKey: ELLIPTICAL_SLOT, action: "replace", customProduct: { brand: "  Precor ", model: "EFX 885" }, quantity: 2, priceFact: { ...PRICE_FACT } },
    { slotKey: TREADMILL_SLOT, action: "confirm", candidateId: treadmill.candidates[0].candidateId },
  ]);
  const frozenSlots = deepFreeze(structuredClone(slots));
  const inputsBefore = json(frozenInputs);
  const resolved = pi.resolveProductSelectionInputs({ inputs: frozenInputs, slots: frozenSlots, decidedAt: DECIDED_AT });
  assert(json(frozenInputs) === inputsBefore && json(frozenSlots) === json(slots), "resolve does not mutate inputs or slots");
  const frozenResolved = deepFreeze(structuredClone(resolved));
  const frozenPlaceholders = deepFreeze(structuredClone(placeholders));
  pi.applyProductSelections(frozenPlaceholders, frozenResolved);
  assert(json(frozenPlaceholders) === json(placeholders), "overlay does not mutate placeholders");
  const frozenStored = deepFreeze(structuredClone(legacyStored));
  pi.readStoredProductSelections(frozenStored);
  pi.readStoredProductSelections(deepFreeze(JSON.parse(json(resolved))));
  assert(json(legacyStored) === before, "stored reads do not mutate stored JSON");
  assert(resolved[0].candidate !== resolved[1].candidate, "fresh candidate objects per selection");
  const second = pi.resolveProductSelectionInputs({ inputs: frozenInputs, slots: frozenSlots, decidedAt: DECIDED_AT });
  assert(second[0].candidate!.openQuestions !== resolved[0].candidate!.openQuestions, "custom openQuestions not shared between selections");
  console.log("✓ 9. no mutation of inputs, slots, placeholders or stored JSON");
}

// ---------------------------------------------------------------------------
// Service flow + C.1 limitation
// ---------------------------------------------------------------------------

async function checkServiceFlowAndC1Limitation() {
  db.projects.set(PROJECT, {
    id: PROJECT,
    name: "C2A1 Project",
    clientName: "C2A1 Corp",
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
  const base = await quoteService.generateQuote({
    projectId: PROJECT,
    workspaceId: "ws-c2a1",
    organizationId: ORG,
    companyInfo: { companyName: "C2A1 Corp", targetUsers: 200, areaM2: 400 },
  });
  const baseBefore = json(db.quotes.get(base.quote.id));
  const v1 = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: base.quote.id,
    organizationId: ORG,
    projectId: PROJECT,
    decidedBy: "user-c2a1",
    selections: [
      {
        slotKey: ELLIPTICAL_SLOT,
        action: "replace",
        customProduct: { brand: " Precor ", model: "EFX 885", source: "reference-catalog", verificationStatus: "verified" },
        quantity: 4,
        priceFact: PRICE_FACT,
      },
    ],
  });
  const v1Id = v1.quote.id;
  assert(v1Id !== base.quote.id && db.quotes.get(v1Id)?.status === "READY", "custom selection saved as a NEW READY Quote version");
  assert(json(db.quotes.get(base.quote.id)) === baseBefore, "base Quote immutable");
  const storedSelections = (db.quotes.get(v1Id)!.companyInfo as { productSelections?: Selection[] }).productSelections ?? [];
  const storedCustom = storedSelections.find((s) => s.slotKey === ELLIPTICAL_SLOT)!;
  assert(
    storedCustom.candidate?.source === "customer-specified" &&
      storedCustom.candidate.verificationStatus === "unverified" &&
      storedCustom.candidate.brand === "Precor" &&
      storedCustom.candidate.candidateId === pi.customProductCandidateId("Precor", "EFX 885") &&
      storedCustom.decidedBy === "user-c2a1" &&
      json(storedCustom.priceFact) === json(PRICE_FACT),
    "Quote.companyInfo.productSelections stores the canonical custom candidate + priceFact",
  );
  const view = await quoteService.getQuoteProductIntelligence({ quoteId: v1Id, organizationId: ORG, projectId: PROJECT });
  const viewCustom = view.selections.find((s) => s.slotKey === ELLIPTICAL_SLOT)!;
  assert(json(viewCustom.candidate) === json(storedCustom.candidate), "PI view reads the custom selection back unchanged");
  const viewElliptical = view.slots.find((s) => s.slotKey === ELLIPTICAL_SLOT)!;
  assert(viewElliptical.candidates.length === 0, "PI slot candidates remain catalog-only (custom product not injected)");
  console.log("✓ service: custom product persisted in Quote.productSelections via the existing PI version flow");

  // Existing generic downstream path (unchanged code): Budget consumes brand / model / priceFact.
  const budget = await budgetService.calculateBudget({ quoteId: v1Id, organizationId: ORG, projectId: PROJECT, budgetTier: "mid" });
  const items = budget.engine.structure.detailedItems as unknown as BudgetItem[];
  const slotKeys = budget.engine.structure.detailedItemSlotKeys;
  const ellipticalItem = items[slotKeys.indexOf(ELLIPTICAL_SLOT)];
  assert(
    ellipticalItem.priceBasis === "VERIFIED" &&
      ellipticalItem.unitPriceMin === PRICE_FACT.unitPrice &&
      ellipticalItem.quantity === 4 &&
      ellipticalItem.name === "椭圆机（Precor EFX 885）",
    "observed: custom row priced VERIFIED from its priceFact",
  );
  console.log("✓ observed: Budget path prices the custom row from its priceFact (pricing unchanged)");

  // The A1 limitation (C.1 snapshot blocking customer-specified candidates) is resolved by C.2-A2;
  // the snapshot must re-send the product, never replace or drop it.
  const reduction = adjustment.buildQuantityReductionOptions({ items, slotKeys, slots: view.slots });
  const otherOption = reduction.options.find((o) => o.slotKey !== ELLIPTICAL_SLOT)!;
  assert(Boolean(otherOption), "fixture: another slot is reducible");
  const selectionsBefore = json(view.selections);
  const quoteCount = db.quotes.size;
  for (const approved of [{ [ELLIPTICAL_SLOT]: 2 }, { [otherOption.slotKey]: 1 }, {}]) {
    const snapshot = adjustment.buildAdjustedSelectionSnapshot({ slots: view.slots, selections: view.selections, approved });
    const custom = snapshot.ok ? snapshot.selections.find((s) => s.slotKey === ELLIPTICAL_SLOT) : undefined;
    assert(
      snapshot.ok &&
        custom?.action === "replace" &&
        json(custom.customProduct) === json({ brand: "Precor", model: "EFX 885" }) &&
        json(custom.priceFact) === json(PRICE_FACT) &&
        custom.quantity === (approved[ELLIPTICAL_SLOT] ?? 4),
      `C.1 snapshot re-sends the customer-specified product (approved ${json(approved)})`,
    );
  }
  assert(json(view.selections) === selectionsBefore, "snapshot leaves the selections untouched");
  assert(db.quotes.size === quoteCount, "building a snapshot creates no Quote version");
  console.log("✓ C.1 snapshot re-sends a customer-specified candidate (A1 limitation resolved in C.2-A2)");
}

// ---------------------------------------------------------------------------
// 10. static + scope
// ---------------------------------------------------------------------------

function checkStaticAndScope() {
  const src = fs.readFileSync(path.join(ROOT, PI_FILE), "utf8");
  assert(!/from "node:|require\("node:/.test(src), "product-intelligence stays free of node: imports");
  assert(!/priceBand\?\.|sku\.priceBand|\.priceBand\.(min|max)/.test(src), "skuDatabase priceBand not consumed");
  const tender = fs.readFileSync(path.join(ROOT, "lib/domain/tender.ts"), "utf8");
  assert(!/supplierName|taxIncluded|validUntil/.test(tender), "ProductPriceFact not expanded in A1");

  const lines = (cmd: string) =>
    execSync(cmd, { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  const changed = lines("git diff --name-only HEAD");
  const untracked = lines("git ls-files --others --exclude-standard");
  const allowed = new Set([
    PI_FILE,
    "scripts/verify-c2-a1-customer-specified-product.ts",
    "app/(product)/quote/page.tsx",
    "lib/budget/over-budget-adjustment.ts",
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
  for (const file of [...changed, ...untracked]) {
    if (knownDirty.has(file)) continue;
    assert(allowed.has(file), `C.2-A1 scope: unexpected change ${file}`);
    assert(!file.startsWith("prisma/"), `C.2-A1: no Prisma / schema / migration change (${file})`);
  }
  console.log("✓ 10. scope (C.2-A1/A2/A3 files only; no Prisma / schema / migration change)");
}

async function main() {
  checkReferenceUnchanged();
  checkCustomProduct();
  checkLegacyAndMutation();
  await checkServiceFlowAndC1Limitation();
  checkStaticAndScope();
  console.log("\nverify-c2-a1-customer-specified-product: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

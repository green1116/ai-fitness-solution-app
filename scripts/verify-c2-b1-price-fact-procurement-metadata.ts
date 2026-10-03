/**
 * Product Core v2 — C.2-B1 Procurement Pricing Facts verification.
 * Optional ProductPriceFact metadata (supplier / taxStatus / validUntil): write-mode validation,
 * lenient stored reads, exact legacy shape (differential against the pre-B1 implementation at
 * PRE_B1_REF, transpiled in memory), round-trip through Quote versions / C.1 snapshot / overlay /
 * Budget, and numeric invariance. Runs the real quote/budget services with an in-memory Prisma stub.
 * No DB, no network, no files.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

import type { BudgetItem, ProductPlaceholder } from "../lib/domain/tender";

const ROOT = path.resolve(__dirname, "..");
const PI_FILE = "lib/product-engine/product-intelligence.ts";
/** C.2-A production-accepted commit; the last implementation without procurement metadata. */
const PRE_B1_REF = "9ba68bb0";

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
const tender = require("../lib/domain/tender") as typeof import("../lib/domain/tender");
const templates = require("../lib/templates/placeholderTemplates") as typeof import("../lib/templates/placeholderTemplates");
const adjustment = require("../lib/budget/over-budget-adjustment") as typeof import("../lib/budget/over-budget-adjustment");
const budgetGen = require("../lib/services/tender/generateBudget") as typeof import("../lib/services/tender/generateBudget");
const quoteService = require("../lib/services/quote.service") as typeof import("../lib/services/quote.service");
const budgetService = require("../lib/services/budget.service") as typeof import("../lib/services/budget.service");
/* eslint-enable @typescript-eslint/no-require-imports */

type PI = typeof pi;
type Selection = import("../lib/product-engine/product-intelligence").ProductSelection;
type Slot = import("../lib/product-engine/product-intelligence").ProductCandidateSlot;

/** Pre-B1 implementation of product-intelligence.ts, transpiled in memory (legacy oracle). */
function loadLegacyPi(): PI {
  const source = execSync(`git show ${PRE_B1_REF}:${PI_FILE}`, { cwd: ROOT, encoding: "utf8" });
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

const ORG = "org-c2b1";
const PROJECT = "p-c2b1";
const TREADMILL_SLOT = "有氧设备|商业级跑步机";
const ELLIPTICAL_SLOT = "有氧设备|椭圆机";
const STRENGTH_SLOT = "力量设备|综合训练器";
const DECIDED_AT = "2026-10-01T00:00:00.000Z";
const BASE_KEYS = ["unitPrice", "currency", "sourceType", "sourceReference", "quotedAt"];

const PRICE_FACT = {
  unitPrice: 18800,
  currency: "CNY",
  sourceType: "supplier_quote",
  sourceReference: "SQ-C2B1-001",
  quotedAt: "2026-09-20",
} as const;
const META = { supplier: "上海力健器材有限公司", taxStatus: "tax_included", validUntil: "2026-12-31" } as const;
const FULL_FACT = { ...PRICE_FACT, ...META };
/** Historical quotation: expired before today but valid for its own quote date. */
const EXPIRED_FACT = {
  unitPrice: 26600,
  currency: "CNY",
  sourceType: "procurement_contract",
  sourceReference: "PC-C2B1-002",
  quotedAt: "2025-01-15",
  supplier: "Life Fitness 华东代理",
  taxStatus: "tax_excluded",
  validUntil: "2025-06-30",
} as const;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) deepFreeze(v);
    Object.freeze(value);
  }
  return value;
}

function fixturePlaceholders() {
  return templates.buildPlaceholders(PROJECT, {
    name: "C2B1",
    siteType: "office",
    targetUsers: 200,
    areaM2: 400,
    city: "上海市",
    budgetLevel: "mid",
    deliveryMode: "standard",
  });
}

const SLOTS: Slot[] = pi.buildCandidateSlots(fixturePlaceholders());
const TREADMILL_CANDIDATE = SLOTS.find((s) => s.slotKey === TREADMILL_SLOT)!.candidates[0];
const STRENGTH_CANDIDATE = SLOTS.find((s) => s.slotKey === STRENGTH_SLOT)!.candidates[0];
assert(Boolean(TREADMILL_CANDIDATE && STRENGTH_CANDIDATE), "fixture: catalog candidates present");
assert(SLOTS.find((s) => s.slotKey === ELLIPTICAL_SLOT)!.candidates.length === 0, "fixture: 椭圆机 has no catalog candidate");

/** Write mode: the server-side trust boundary used by Quote version creation. */
function resolveFact(priceFact: unknown, impl: PI = pi) {
  try {
    const [sel] = impl.resolveProductSelectionInputs({
      inputs: [{ slotKey: TREADMILL_SLOT, action: "confirm", candidateId: TREADMILL_CANDIDATE.candidateId, priceFact }],
      slots: SLOTS,
      decidedAt: DECIDED_AT,
    });
    return { ok: true as const, priceFact: sel.priceFact };
  } catch (err) {
    return { ok: false as const, error: `${(err as Error).name}:${(err as Error).message}` };
  }
}

function expectWriteOk(priceFact: unknown, expected: unknown, label: string) {
  const r = resolveFact(priceFact);
  assert(r.ok && json(r.priceFact) === json(expected), `${label} (got ${json(r)})`);
}

function expectWriteReject(priceFact: unknown, fragment: string, label: string) {
  const r = resolveFact(priceFact);
  assert(
    !r.ok && r.error.startsWith("ProductSelectionInputError:") && r.error.includes(fragment),
    `${label} (got ${json(r)})`,
  );
}

/** Read mode: the canonical stored-selection reader used by every downstream consumer. */
function readStoredFact(priceFact: unknown, impl: PI = pi) {
  return impl.readStoredProductSelections([
    { slotKey: TREADMILL_SLOT, action: "confirm", candidate: TREADMILL_CANDIDATE, priceFact, decidedAt: DECIDED_AT },
  ])[0]?.priceFact;
}

// ---------------------------------------------------------------------------
// 1. legacy 5-field fact: exact shape, identical to pre-B1
// ---------------------------------------------------------------------------

function checkLegacyShape() {
  const legacyFacts: unknown[] = [
    PRICE_FACT,
    { ...PRICE_FACT, sourceType: "procurement_contract", unitPrice: 12345.678, sourceReference: "  PC-9 ", quotedAt: " 2026-01-02 " },
    { ...PRICE_FACT, verified: true, taxRate: 0.13 },
    { ...PRICE_FACT, supplier: null, taxStatus: null, validUntil: null },
    { ...PRICE_FACT, supplier: undefined, taxStatus: undefined, validUntil: undefined },
    { ...PRICE_FACT, supplier: "   " },
    { ...PRICE_FACT, supplier: "" },
    { ...PRICE_FACT, currency: "USD" },
    { ...PRICE_FACT, sourceReference: "" },
    { ...PRICE_FACT, quotedAt: "2026-02-30" },
    { ...PRICE_FACT, quotedAt: "2027-01-01" },
    { ...PRICE_FACT, unitPrice: 0 },
    null,
    "18800",
  ];
  for (const fact of legacyFacts) {
    deepFreeze(fact);
    assert(json(resolveFact(fact)) === json(resolveFact(fact, legacy)), `write identical to pre-B1 for ${json(fact)}`);
    assert(json(readStoredFact(fact)) === json(readStoredFact(fact, legacy)), `read identical to pre-B1 for ${json(fact)}`);
    assert(
      json(pi.validatePriceFact(fact, { now: new Date(DECIDED_AT) })) ===
        json(legacy.validatePriceFact(fact, { now: new Date(DECIDED_AT) })),
      `validatePriceFact identical to pre-B1 for ${json(fact)}`,
    );
  }
  const written = resolveFact(PRICE_FACT);
  assert(written.ok && json(written.priceFact) === json(PRICE_FACT), "old fact written exactly");
  assert(json(Object.keys(written.ok ? written.priceFact! : {})) === json(BASE_KEYS), "no new / undefined / null keys; key order preserved");
  const read = readStoredFact(PRICE_FACT);
  assert(json(read) === json(PRICE_FACT) && json(Object.keys(read!)) === json(BASE_KEYS), "old fact read exactly");

  const legacySelections = [
    { slotKey: TREADMILL_SLOT, action: "confirm", candidate: TREADMILL_CANDIDATE, quantity: 3, priceFact: PRICE_FACT, decidedAt: DECIDED_AT, decidedBy: "u1" },
    { slotKey: STRENGTH_SLOT, action: "replace", candidate: STRENGTH_CANDIDATE, priceFact: { ...PRICE_FACT, unitPrice: -1 } },
    { slotKey: ELLIPTICAL_SLOT, action: "remove", candidate: null, priceFact: PRICE_FACT },
  ];
  deepFreeze(legacySelections);
  assert(
    json(pi.readStoredProductSelections(legacySelections)) === json(legacy.readStoredProductSelections(legacySelections)),
    "legacy stored selections read identically to pre-B1",
  );
  console.log(`✓ 1. old 5-field fact round-trips exactly (${legacyFacts.length} write/read/validate cases identical to pre-B1)`);
}

// ---------------------------------------------------------------------------
// 2–5. write-mode validation
// ---------------------------------------------------------------------------

function checkSupplier() {
  expectWriteOk({ ...PRICE_FACT, supplier: "上海力健器材有限公司" }, { ...PRICE_FACT, supplier: "上海力健器材有限公司" }, "supplier accepted");
  expectWriteOk({ ...PRICE_FACT, supplier: "  ACME   Fitness\u3000 Co. " }, { ...PRICE_FACT, supplier: "ACME Fitness Co." }, "supplier: whitespace collapsed + trimmed");
  const decomposed = "Cafe\u0301 Sports";
  expectWriteOk({ ...PRICE_FACT, supplier: decomposed }, { ...PRICE_FACT, supplier: "Caf\u00e9 Sports" }, "supplier: NFC normalized");
  for (const empty of ["", "   ", "\u3000"]) {
    const r = resolveFact({ ...PRICE_FACT, supplier: empty });
    assert(r.ok && json(r.priceFact) === json(PRICE_FACT) && !("supplier" in r.priceFact!), `supplier ${json(empty)} → key omitted`);
  }
  expectWriteOk({ ...PRICE_FACT, supplier: "x".repeat(pi.MAX_PRICE_FACT_SUPPLIER_LENGTH) }, { ...PRICE_FACT, supplier: "x".repeat(100) }, "supplier: 100 chars accepted");
  assert(pi.MAX_PRICE_FACT_SUPPLIER_LENGTH === 100, "MAX_PRICE_FACT_SUPPLIER_LENGTH = 100");
  expectWriteReject({ ...PRICE_FACT, supplier: "x".repeat(101) }, "供应商不超过 100 字", "supplier: 101 chars rejected");
  for (const ctl of ["ACME\u0000", "AC\u0007ME", "ACME\u007f", "\u001bACME"]) {
    expectWriteReject({ ...PRICE_FACT, supplier: ctl }, "供应商包含无效字符", `supplier control char ${json(ctl)} rejected`);
  }
  for (const bad of [123, true, { name: "ACME" }, ["ACME"]]) {
    expectWriteReject({ ...PRICE_FACT, supplier: bad }, "供应商需为文本", `supplier non-string ${json(bad)} rejected`);
  }
  console.log("✓ 2. supplier: NFC / collapse / trim, empty → omitted, >100 / control char / non-string rejected on write");
}

function checkTaxStatus() {
  for (const status of ["tax_included", "tax_excluded"] as const) {
    expectWriteOk({ ...PRICE_FACT, taxStatus: status }, { ...PRICE_FACT, taxStatus: status }, `taxStatus ${status} accepted`);
  }
  for (const bad of ["unknown", "TAX_INCLUDED", "含税", "tax_included ", "", 13, 0, true, {}]) {
    expectWriteReject({ ...PRICE_FACT, taxStatus: bad }, "含税状态需为含税或不含税", `taxStatus ${json(bad)} rejected`);
  }
  assert(json(tender.PRICE_FACT_TAX_STATUS_LABEL) === json({ tax_included: "含税", tax_excluded: "不含税" }), "PRICE_FACT_TAX_STATUS_LABEL");
  console.log("✓ 3. taxStatus: tax_included / tax_excluded only; unknown / arbitrary string / number rejected");
}

function checkValidUntil() {
  expectWriteOk({ ...PRICE_FACT, validUntil: "2026-12-31" }, { ...PRICE_FACT, validUntil: "2026-12-31" }, "validUntil accepted");
  expectWriteOk({ ...PRICE_FACT, validUntil: "2026-09-20" }, { ...PRICE_FACT, validUntil: "2026-09-20" }, "validUntil = quotedAt accepted");
  expectWriteOk({ ...PRICE_FACT, validUntil: "2030-01-01" }, { ...PRICE_FACT, validUntil: "2030-01-01" }, "later validUntil accepted");
  expectWriteOk({ ...PRICE_FACT, validUntil: " 2026-12-31 " }, { ...PRICE_FACT, validUntil: "2026-12-31" }, "validUntil trimmed like quotedAt");
  expectWriteReject({ ...PRICE_FACT, validUntil: "2026-09-19" }, "报价有效期不能早于报价日期", "validUntil < quotedAt rejected");
  for (const bad of ["2026-02-30", "2026-13-01", "2026-9-1", "20261231", "2026-12-31T00:00:00Z", "2026-12-31T00:00:00.000Z", "", 20261231]) {
    expectWriteReject({ ...PRICE_FACT, validUntil: bad }, "报价有效期格式需为 YYYY-MM-DD", `validUntil ${json(bad)} rejected`);
  }
  // Expired before "now" (DECIDED_AT 2026-10-01) but >= its own quotedAt.
  expectWriteOk(EXPIRED_FACT, EXPIRED_FACT, "historical expired validUntil accepted (no >= today rule)");
  const live = pi.validatePriceFact(EXPIRED_FACT, { now: new Date() });
  assert(live.ok && json(live.priceFact) === json(EXPIRED_FACT), "expired validUntil accepted against the real current date");
  console.log("✓ 4. validUntil: date-only, real calendar date, >= quotedAt; timestamps rejected; expired history accepted");
}

function checkUnknownKeysAndFullShape() {
  const spoofed = deepFreeze({
    ...FULL_FACT,
    verified: true,
    taxRate: 0.13,
    taxAmount: 2444,
    priceBasis: "VERIFIED",
    verificationStatus: "verified",
    supplierId: "sup-1",
  });
  expectWriteOk(spoofed, FULL_FACT, "unknown keys stripped on write");
  assert(json(readStoredFact(spoofed)) === json(FULL_FACT), "unknown keys stripped on read");
  const r = resolveFact(spoofed);
  assert(
    r.ok && json(Object.keys(r.priceFact!)) === json([...BASE_KEYS, "supplier", "taxStatus", "validUntil"]),
    "canonical key order: base fields, then supplier / taxStatus / validUntil",
  );
  const reordered = { validUntil: META.validUntil, taxStatus: META.taxStatus, supplier: META.supplier, ...PRICE_FACT };
  expectWriteOk(reordered, FULL_FACT, "input key order does not leak into the canonical shape");
  console.log("✓ 5. unknown keys (verified / taxRate / taxAmount / priceBasis / …) stripped; canonical key order fixed");
}

// ---------------------------------------------------------------------------
// 6. read mode: malformed metadata dropped individually, verified price kept
// ---------------------------------------------------------------------------

function checkLenientRead() {
  const cases: Array<[string, Record<string, unknown>, Record<string, unknown>]> = [
    ["supplier number", { ...FULL_FACT, supplier: 42 }, { ...PRICE_FACT, taxStatus: META.taxStatus, validUntil: META.validUntil }],
    ["supplier overlong", { ...FULL_FACT, supplier: "x".repeat(101) }, { ...PRICE_FACT, taxStatus: META.taxStatus, validUntil: META.validUntil }],
    ["supplier control char", { ...FULL_FACT, supplier: "AC\u0000ME" }, { ...PRICE_FACT, taxStatus: META.taxStatus, validUntil: META.validUntil }],
    ["taxStatus unknown", { ...FULL_FACT, taxStatus: "unknown" }, { ...PRICE_FACT, supplier: META.supplier, validUntil: META.validUntil }],
    ["taxStatus number", { ...FULL_FACT, taxStatus: 13 }, { ...PRICE_FACT, supplier: META.supplier, validUntil: META.validUntil }],
    ["validUntil before quotedAt", { ...FULL_FACT, validUntil: "2026-01-01" }, { ...PRICE_FACT, supplier: META.supplier, taxStatus: META.taxStatus }],
    ["validUntil invalid date", { ...FULL_FACT, validUntil: "2026-02-30" }, { ...PRICE_FACT, supplier: META.supplier, taxStatus: META.taxStatus }],
    ["validUntil timestamp", { ...FULL_FACT, validUntil: "2026-12-31T00:00:00Z" }, { ...PRICE_FACT, supplier: META.supplier, taxStatus: META.taxStatus }],
    ["all three malformed", { ...PRICE_FACT, supplier: ["x"], taxStatus: "", validUntil: 1 }, { ...PRICE_FACT }],
  ];
  const placeholders = fixturePlaceholders();
  for (const [label, stored, expected] of cases) {
    deepFreeze(stored);
    const fact = readStoredFact(stored);
    assert(json(fact) === json(expected), `read ${label}: only the malformed field dropped (got ${json(fact)})`);
    const write = resolveFact(stored);
    assert(!write.ok, `write ${label}: rejected (write mode stays strict)`);
    const selections = pi.readStoredProductSelections([
      { slotKey: TREADMILL_SLOT, action: "confirm", candidate: TREADMILL_CANDIDATE, priceFact: stored, decidedAt: DECIDED_AT },
    ]);
    const applied = pi.applyProductSelections(placeholders, selections).placeholders;
    for (const tier of ["low", "mid", "high"] as const) {
      const row = budgetGen.generateBudget(PROJECT, applied, { priceBand: tier }).items.find((it) => it.priceFact);
      assert(
        row?.priceBasis === "VERIFIED" && row.unitPriceMin === PRICE_FACT.unitPrice && row.unitPriceMax === PRICE_FACT.unitPrice,
        `read ${label}: row stays VERIFIED @ ${PRICE_FACT.unitPrice} (${tier})`,
      );
    }
  }
  assert(readStoredFact({ ...FULL_FACT, sourceReference: "" }) === undefined, "an invalid base field still drops the whole fact (unchanged)");
  console.log(`✓ 6. read mode: ${cases.length} malformed-metadata cases drop only the bad field; base fact + VERIFIED price kept`);
}

// ---------------------------------------------------------------------------
// 10–12. overlay, generateBudget numeric invariance, C.0 quantities
// ---------------------------------------------------------------------------

function stripPriceFact(items: BudgetItem[]) {
  return items.map((it) => {
    const copy: Record<string, unknown> = { ...it };
    delete copy.priceFact;
    return copy;
  });
}

function stripBudgetTimes(budget: ReturnType<typeof budgetGen.generateBudget>) {
  return { ...budget, items: stripPriceFact(budget.items), createdAt: "", updatedAt: "" };
}

function checkOverlayAndNumericInvariance() {
  const placeholders = deepFreeze(fixturePlaceholders());
  const before = json(placeholders);
  const select = (treadmillFact: unknown, strengthFact: unknown) =>
    pi.readStoredProductSelections([
      { slotKey: TREADMILL_SLOT, action: "confirm", candidate: TREADMILL_CANDIDATE, quantity: 6, priceFact: treadmillFact, decidedAt: DECIDED_AT },
      { slotKey: STRENGTH_SLOT, action: "replace", candidate: STRENGTH_CANDIDATE, priceFact: strengthFact, decidedAt: DECIDED_AT },
    ]);
  const expiredBase = {
    unitPrice: EXPIRED_FACT.unitPrice,
    currency: EXPIRED_FACT.currency,
    sourceType: EXPIRED_FACT.sourceType,
    sourceReference: EXPIRED_FACT.sourceReference,
    quotedAt: EXPIRED_FACT.quotedAt,
  };
  const variants: Array<[string, unknown, unknown]> = [
    ["base", PRICE_FACT, expiredBase],
    ["metadata", FULL_FACT, EXPIRED_FACT],
    ["tax flipped", { ...FULL_FACT, taxStatus: "tax_excluded" }, { ...EXPIRED_FACT, taxStatus: "tax_included" }],
    ["supplier only", { ...PRICE_FACT, supplier: "B" }, { ...expiredBase, supplier: "C" }],
    ["not expired", { ...FULL_FACT, validUntil: "2099-12-31" }, { ...EXPIRED_FACT, validUntil: "2099-12-31" }],
  ];
  const applied = variants.map(([label, t, s]) => [label, pi.applyProductSelections(placeholders, select(t, s)).placeholders] as const);
  assert(json(placeholders) === before, "overlay does not mutate placeholders");

  const metaApplied = applied[1][1];
  const treadmill = metaApplied.find((p) => p.subCategory === "商业级跑步机")!;
  const strength = metaApplied.find((p) => p.subCategory === "综合训练器")!;
  assert(json(treadmill.priceFact) === json(FULL_FACT) && json(strength.priceFact) === json(EXPIRED_FACT), "10. applyProductSelections carries the metadata");

  const withoutFact = (rows: readonly ProductPlaceholder[]) =>
    json(rows.map((p) => ({ ...p, priceFact: undefined })));
  for (const [label, rows] of applied) {
    assert(withoutFact(rows) === withoutFact(applied[0][1]), `12. ${label}: identity / quantity / band identical to the base-fact overlay`);
  }
  assert(treadmill.quantity === 6, "12. explicit selection quantity applied unchanged");

  for (const tier of ["low", "mid", "high"] as const) {
    const baseline = budgetGen.generateBudget(PROJECT, applied[0][1], { priceBand: tier });
    for (const [label, rows] of applied.slice(1)) {
      const budget = budgetGen.generateBudget(PROJECT, rows, { priceBand: tier });
      assert(
        budget.totalEstimateMin === baseline.totalEstimateMin && budget.totalEstimateMax === baseline.totalEstimateMax,
        `11. ${tier} totals identical (${label})`,
      );
      assert(json(stripBudgetTimes(budget)) === json(stripBudgetTimes(baseline)), `11. ${tier} items / remarks / assumptions identical (${label})`);
    }
    const metaBudget = budgetGen.generateBudget(PROJECT, metaApplied, { priceBand: tier });
    const tRow = metaBudget.items.find((it) => it.name?.startsWith("商业级跑步机"))!;
    const sRow = metaBudget.items.find((it) => it.name?.startsWith("综合训练器"))!;
    assert(
      tRow.priceBasis === "VERIFIED" && tRow.unitPriceMin === 18800 && tRow.unitPriceMax === 18800 && tRow.subtotalMin === 18800 * 6,
      `11. ${tier}: VERIFIED unit price unchanged, no tax adjustment`,
    );
    assert(
      sRow.priceBasis === "VERIFIED" && sRow.unitPriceMin === 26600 && sRow.subtotalMin === 26600 * sRow.quantity,
      `11. ${tier}: expired quotation stays VERIFIED at its price (no expiry adjustment)`,
    );
    assert(json(tRow.priceFact) === json(FULL_FACT) && json(sRow.priceFact) === json(EXPIRED_FACT), `11. ${tier}: Budget item priceFact carries metadata`);
  }
  console.log("✓ 10–12. overlay carries metadata; LOW / MID / HIGH totals, items and quantities identical with vs without metadata");
}

// ---------------------------------------------------------------------------
// 7–9. service round-trip: Quote versions, stored companyInfo, PI view, C.1 snapshot, Budget
// ---------------------------------------------------------------------------

async function checkServiceRoundTrip() {
  db.projects.set(PROJECT, {
    id: PROJECT,
    name: "C2B1 Project",
    clientName: "C2B1 Corp",
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
    workspaceId: "ws-c2b1",
    organizationId: ORG,
    companyInfo: { companyName: "C2B1 Corp", targetUsers: 200, areaM2: 400 },
  });
  const v1 = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: base.quote.id,
    organizationId: ORG,
    projectId: PROJECT,
    decidedBy: "user-c2b1",
    selections: [
      {
        slotKey: TREADMILL_SLOT,
        action: "confirm",
        candidateId: TREADMILL_CANDIDATE.candidateId,
        quantity: 6,
        priceFact: { ...FULL_FACT, supplier: "  上海力健器材有限公司 ", verified: true, taxRate: 0.13 },
      },
      {
        slotKey: ELLIPTICAL_SLOT,
        action: "replace",
        customProduct: { brand: "Precor", model: "EFX 885" },
        quantity: 4,
        priceFact: EXPIRED_FACT,
      },
      {
        slotKey: STRENGTH_SLOT,
        action: "replace",
        candidateId: STRENGTH_CANDIDATE.candidateId,
        priceFact: PRICE_FACT,
      },
    ],
  });
  const v1Id = v1.quote.id;
  const stored = (db.quotes.get(v1Id)!.companyInfo as { productSelections?: Selection[] }).productSelections ?? [];
  const storedOf = (slot: string) => stored.find((s) => s.slotKey === slot)!;
  assert(json(storedOf(TREADMILL_SLOT).priceFact) === json(FULL_FACT), "7. reference-catalog: Quote.companyInfo stores the normalized metadata (unknown keys stripped)");
  assert(
    storedOf(ELLIPTICAL_SLOT).candidate?.source === "customer-specified" && json(storedOf(ELLIPTICAL_SLOT).priceFact) === json(EXPIRED_FACT),
    "8. customer-specified: Quote.companyInfo stores the metadata with the server-derived identity",
  );
  assert(json(storedOf(STRENGTH_SLOT).priceFact) === json(PRICE_FACT), "old-shape fact stored without new keys");
  assert(json(pi.readStoredProductSelections(stored)) === json(stored), "stored selections are exactly what the canonical reader accepts");

  const view = await quoteService.getQuoteProductIntelligence({ quoteId: v1Id, organizationId: ORG, projectId: PROJECT });
  const viewOf = (slot: string) => view.selections.find((s) => s.slotKey === slot)!;
  assert(
    json(viewOf(TREADMILL_SLOT).priceFact) === json(FULL_FACT) &&
      json(viewOf(ELLIPTICAL_SLOT).priceFact) === json(EXPIRED_FACT) &&
      json(viewOf(STRENGTH_SLOT).priceFact) === json(PRICE_FACT),
    "7/8. PI view reads the metadata back unchanged",
  );
  console.log("✓ 7–8. reference-catalog + customer-specified metadata survive resolve → Quote.companyInfo → read → PI view");

  const budget = await budgetService.calculateBudget({ quoteId: v1Id, organizationId: ORG, projectId: PROJECT, budgetTier: "mid" });
  const items = budget.engine.structure.detailedItems as unknown as BudgetItem[];
  const slotKeys = budget.engine.structure.detailedItemSlotKeys;
  const itemOf = (slot: string) => items[slotKeys.indexOf(slot)];
  assert(
    itemOf(TREADMILL_SLOT).priceBasis === "VERIFIED" && itemOf(TREADMILL_SLOT).unitPriceMin === 18800 && json(itemOf(TREADMILL_SLOT).priceFact) === json(FULL_FACT),
    "Budget: reference row VERIFIED @ 18800 with metadata",
  );
  assert(
    itemOf(ELLIPTICAL_SLOT).priceBasis === "VERIFIED" && itemOf(ELLIPTICAL_SLOT).unitPriceMin === 26600 && json(itemOf(ELLIPTICAL_SLOT).priceFact) === json(EXPIRED_FACT),
    "Budget: expired custom row stays VERIFIED @ 26600 with metadata",
  );
  const persisted = db.budgets[db.budgets.length - 1].items as BudgetItem[];
  assert(json(persisted) === json(items), "Budget.items JSON persists the priceFact metadata");
  console.log("✓ generateBudget / calculateBudget: Budget item priceFact carries metadata; VERIFIED prices unchanged");

  // 9. C.1 full-object snapshot (implementation untouched) and revalidation on save.
  const reduction = adjustment.buildQuantityReductionOptions({ items, slotKeys, slots: view.slots });
  const treadmillOption = reduction.options.find((o) => o.slotKey === TREADMILL_SLOT);
  assert(Boolean(treadmillOption), "fixture: treadmill slot is reducible");
  const approved = { [TREADMILL_SLOT]: 3, [ELLIPTICAL_SLOT]: 2 };
  const snapshot = adjustment.buildAdjustedSelectionSnapshot({ slots: view.slots, selections: view.selections, approved });
  assert(snapshot.ok, `C.1 snapshot builds (got ${json(snapshot)})`);
  const snapOf = (slot: string) => (snapshot.ok ? snapshot.selections.find((s) => s.slotKey === slot) : undefined);
  assert(json(snapOf(TREADMILL_SLOT)?.priceFact) === json(FULL_FACT), "9. snapshot re-sends the reference fact with metadata");
  assert(
    json(snapOf(ELLIPTICAL_SLOT)?.priceFact) === json(EXPIRED_FACT) && json(snapOf(ELLIPTICAL_SLOT)?.customProduct) === json({ brand: "Precor", model: "EFX 885" }),
    "9. snapshot re-sends the custom product + expired fact with metadata",
  );
  const v2 = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: v1Id,
    organizationId: ORG,
    projectId: PROJECT,
    decidedBy: "user-c2b1",
    selections: snapshot.ok ? snapshot.selections : [],
  });
  const stored2 = (db.quotes.get(v2.quote.id)!.companyInfo as { productSelections?: Selection[] }).productSelections ?? [];
  const stored2Of = (slot: string) => stored2.find((s) => s.slotKey === slot)!;
  assert(
    json(stored2Of(TREADMILL_SLOT).priceFact) === json(FULL_FACT) && stored2Of(TREADMILL_SLOT).quantity === 3,
    "9. C.1 new version: metadata preserved, quantity applied",
  );
  assert(
    json(stored2Of(ELLIPTICAL_SLOT).priceFact) === json(EXPIRED_FACT) && stored2Of(ELLIPTICAL_SLOT).quantity === 2,
    "9. C.1 new version: expired validUntil (< today, >= quotedAt) survives server revalidation",
  );
  assert(json(stored2Of(STRENGTH_SLOT).priceFact) === json(PRICE_FACT), "9. C.1 new version: old-shape fact unchanged");
  const budget2 = await budgetService.calculateBudget({ quoteId: v2.quote.id, organizationId: ORG, projectId: PROJECT, budgetTier: "mid" });
  const items2 = budget2.engine.structure.detailedItems as unknown as BudgetItem[];
  const keys2 = budget2.engine.structure.detailedItemSlotKeys;
  const t2 = items2[keys2.indexOf(TREADMILL_SLOT)];
  assert(t2.priceBasis === "VERIFIED" && t2.unitPriceMin === 18800 && t2.subtotalMin === 18800 * 3, "9. recalculated Budget keeps the VERIFIED price at the new quantity");
  console.log("✓ 9. C.1 snapshot (unchanged implementation) preserves metadata; expired validUntil survives revalidation");
}

// ---------------------------------------------------------------------------
// static + scope
// ---------------------------------------------------------------------------

function checkStaticAndScope() {
  const tenderSrc = fs.readFileSync(path.join(ROOT, "lib/domain/tender.ts"), "utf8");
  assert(/export type PriceFactTaxStatus = "tax_included" \| "tax_excluded";/.test(tenderSrc), "PriceFactTaxStatus closed enum");
  assert(!/unknown/.test(tenderSrc.slice(tenderSrc.indexOf("PriceFactTaxStatus"), tenderSrc.indexOf("export type BudgetPriceBasis"))), "no 'unknown' tax status");
  assert(!/taxRate|taxAmount/.test(tenderSrc), "no tax rate / tax amount fields");

  const lines = (cmd: string) =>
    execSync(cmd, { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  const frozen = [
    "lib/budget/over-budget-adjustment.ts",
    "lib/services/tender/generateBudget.ts",
    "lib/services/budget.service.ts",
    "lib/services/quote.service.ts",
  ];
  assert(lines(`git diff --name-only ${PRE_B1_REF} -- ${frozen.join(" ")}`).length === 0, "C.1 / generateBudget / budget / quote services unchanged");

  const changed = lines(`git diff --name-only ${PRE_B1_REF}`);
  const untracked = lines("git ls-files --others --exclude-standard");
  const allowed = new Set([
    "lib/domain/tender.ts",
    PI_FILE,
    "scripts/verify-c2-b1-price-fact-procurement-metadata.ts",
  ]);
  const knownDirty = new Set([
    "lib/commercial/action-delivery/index.ts",
    "lib/payments/wechatProvider.ts",
    "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql",
    "login-gzip.html",
  ]);
  for (const file of [...changed, ...untracked]) {
    if (knownDirty.has(file)) continue;
    assert(allowed.has(file), `C.2-B1 scope: unexpected change ${file}`);
    assert(!file.startsWith("prisma/"), `C.2-B1: no Prisma / schema / migration change (${file})`);
  }
  console.log("✓ static + scope (tender.ts + product-intelligence.ts + this verifier; no Prisma / schema / migration change)");
}

async function main() {
  checkLegacyShape();
  checkSupplier();
  checkTaxStatus();
  checkValidUntil();
  checkUnknownKeysAndFullShape();
  checkLenientRead();
  checkOverlayAndNumericInvariance();
  await checkServiceRoundTrip();
  checkStaticAndScope();
  console.log("\nverify-c2-b1-price-fact-procurement-metadata: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

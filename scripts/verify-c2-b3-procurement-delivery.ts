/**
 * Product Core v2 — C.2-B3 Procurement Pricing Facts: Budget PDF delivery semantics.
 * Renders real Budget PDFs from persisted Budget rows (quote / budget services on an in-memory
 * Prisma stub) and records every string the renderer draws (pdf-lib PDFPage.drawText), so the
 * disclosure is checked as printed — including wrapping and page layout. The pre-B3 renderers
 * (PRE_B3_REF) are transpiled in memory as the legacy oracle. No DB, no network, no files.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

import type { BudgetItem, ProductPlaceholder } from "../lib/domain/tender";

const ROOT = path.resolve(__dirname, "..");
/** C.2-A production-accepted commit; the last Budget PDF renderers without procurement metadata. */
const PRE_B3_REF = "9ba68bb0";
const BUDGET_RENDER = "lib/pdf/budgetRender.ts";
const RENDER_BUDGET_PDF = "lib/pdf/renderBudgetPdf.ts";
const PLAN_PDF = "lib/pdf/renderPlanPdf.ts";

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
const pdfLib = require("pdf-lib") as typeof import("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const domain = require("../lib/domain/tender") as typeof import("../lib/domain/tender");
const pi = require("../lib/product-engine/product-intelligence") as typeof import("../lib/product-engine/product-intelligence");
const text = require("../lib/pdf/engine/text") as typeof import("../lib/pdf/engine/text");
const budgetRender = require("../lib/pdf/budgetRender") as typeof import("../lib/pdf/budgetRender");
const renderBudgetPdfModule = require("../lib/pdf/renderBudgetPdf") as typeof import("../lib/pdf/renderBudgetPdf");
const planPdf = require("../lib/pdf/renderPlanPdf") as typeof import("../lib/pdf/renderPlanPdf");
const tenderDoc = require("../lib/pdf/tenderDocumentContext") as typeof import("../lib/pdf/tenderDocumentContext");
const quoteService = require("../lib/services/quote.service") as typeof import("../lib/services/quote.service");
const budgetService = require("../lib/services/budget.service") as typeof import("../lib/services/budget.service");
/* eslint-enable @typescript-eslint/no-require-imports */

function gitShow(ref: string, rel: string) {
  return execSync(`git show "${ref}:${rel}"`, { cwd: ROOT, encoding: "utf8" });
}

/** Loads a module from source text; `@/` and relative imports resolve to the working tree unless overridden. */
function loadModuleFromSource<T>(source: string, rel: string, overrides: Record<string, unknown> = {}): T {
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const dir = path.join(ROOT, path.dirname(rel));
  /* eslint-disable @typescript-eslint/no-require-imports */
  const localRequire = (spec: string) =>
    spec in overrides
      ? overrides[spec]
      : spec.startsWith("@/")
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
  return mod.exports as T;
}

const legacyBudgetRender = loadModuleFromSource<typeof budgetRender>(gitShow(PRE_B3_REF, BUDGET_RENDER), BUDGET_RENDER);
const legacyRenderBudgetPdf = loadModuleFromSource<typeof renderBudgetPdfModule>(
  gitShow(PRE_B3_REF, RENDER_BUDGET_PDF),
  RENDER_BUDGET_PDF,
  { "@/lib/pdf/budgetRender": legacyBudgetRender },
);

type ReadVerifiedPriceSource = (row: Record<string, unknown>, unitPriceMin: number, unitPriceMax: number) => string | null;

/** readVerifiedPriceSource is module-private; extract it (and its helpers) from the renderer source. */
function loadReadVerifiedPriceSource(source: string): ReadVerifiedPriceSource {
  const start = source.indexOf("/** VERIFIED only when");
  const end = source.indexOf("function readDetailedBudgetItems(");
  assert(start > 0 && end > start, "locate readVerifiedPriceSource in renderBudgetPdf");
  const js = ts.transpileModule(
    `function __factory(PRICE_FACT_SOURCE_LABEL, PRICE_FACT_TAX_STATUS_LABEL, validatePriceFact) {\n${source.slice(start, end)}\nreturn readVerifiedPriceSource;\n}`,
    { compilerOptions: { module: ts.ModuleKind.None, target: ts.ScriptTarget.ES2020, alwaysStrict: true } },
  ).outputText;
  const factory = vm.runInThisContext(`(function () {${js}\nreturn __factory;\n})()`) as (...deps: unknown[]) => ReadVerifiedPriceSource;
  return factory(domain.PRICE_FACT_SOURCE_LABEL, domain.PRICE_FACT_TAX_STATUS_LABEL, pi.validatePriceFact);
}

const readSource = loadReadVerifiedPriceSource(fs.readFileSync(path.join(ROOT, RENDER_BUDGET_PDF), "utf8"));
const legacyReadSource = loadReadVerifiedPriceSource(gitShow(PRE_B3_REF, RENDER_BUDGET_PDF));

type ConfigLineFn = (p: ProductPlaceholder, i: number, ctx: { brand: string }) => string[];

function loadExpandConfigLine(): ConfigLineFn {
  const source = fs.readFileSync(path.join(ROOT, PLAN_PDF), "utf8");
  const start = source.indexOf("function expandConfigLine(");
  const end = source.indexOf("/** 无占位行时的标准分区配置");
  assert(start > 0 && end > start, "locate expandConfigLine in renderPlanPdf");
  const js = ts.transpileModule(`function __factory() {\n${source.slice(start, end)}\nreturn expandConfigLine;\n}`, {
    compilerOptions: { module: ts.ModuleKind.None, target: ts.ScriptTarget.ES2020, alwaysStrict: true },
  }).outputText;
  return vm.runInThisContext(`(function () {${js}\nreturn __factory();\n})()`) as ConfigLineFn;
}

// ---------------------------------------------------------------------------
// Drawn-text recorder
// ---------------------------------------------------------------------------

const drawn: string[] = [];
const originalDrawText = pdfLib.PDFPage.prototype.drawText;
pdfLib.PDFPage.prototype.drawText = function (this: InstanceType<typeof pdfLib.PDFPage>, value: string, options?: unknown) {
  drawn.push(String(value));
  return originalDrawText.call(this, value, options as never);
};

const squash = (s: string) => s.replace(/\s+/g, "");
const occurrences = (hay: string, needle: string) => hay.split(needle).length - 1;

type BudgetRowLike = { items: unknown; totalEstimateMin: number; totalEstimateMax: number; currency: string; assumptions?: unknown };
type Renderer = typeof renderBudgetPdfModule.renderBudgetPdf;

async function drawnTexts(budget: BudgetRowLike, render: Renderer = renderBudgetPdfModule.renderBudgetPdf, extra: Record<string, unknown> = {}) {
  drawn.length = 0;
  const pdf = await render(budget as never, {
    tier: "enterprise",
    planId: "plan-c2b3",
    companyName: "C2B3 Corp",
    companySize: 200,
    budgetLevel: "mid",
    ...extra,
  });
  assert(pdf.subarray(0, 5).toString() === "%PDF-", "Budget PDF renders");
  return { texts: [...drawn], flat: squash(drawn.join("")) };
}

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const ORG = "org-c2b3";
const PROJECT = "p-c2b3";
const TREADMILL_SLOT = "有氧设备|商业级跑步机";
const ELLIPTICAL_SLOT = "有氧设备|椭圆机";
const STRENGTH_SLOT = "力量设备|综合训练器";
const FREE_WEIGHT_SLOT = "力量设备|自由力量区设备";
const TAX_NOTE = "核实单价按录入价格计入；含税状态仅作采购事实记录，系统未进行税额换算。";

const PRICE_FACT = {
  unitPrice: 18800,
  currency: "CNY",
  sourceType: "supplier_quote",
  sourceReference: "SQ-C2B3-001",
  quotedAt: "2026-09-20",
};
const META = { supplier: "上海力健器材有限公司", taxStatus: "tax_included", validUntil: "2026-12-31" };
const FULL_FACT = { ...PRICE_FACT, ...META };
const EXPIRED_BASE = {
  unitPrice: 26600,
  currency: "CNY",
  sourceType: "procurement_contract",
  sourceReference: "PC-C2B3-002",
  quotedAt: "2025-01-15",
};
const EXPIRED_META = { supplier: "Life Fitness 华东代理", taxStatus: "tax_excluded", validUntil: "2025-06-30" };
const EXPIRED_FACT = { ...EXPIRED_BASE, ...EXPIRED_META };
const BASE_SOURCE = "供应商报价 · SQ-C2B3-001 · 报价日期 2026-09-20";
const EXPIRED_BASE_SOURCE = "采购合同 · PC-C2B3-002 · 报价日期 2025-01-15";
const TIERS = ["low", "mid", "high"] as const;

async function seed() {
  db.projects.set(PROJECT, {
    id: PROJECT,
    name: "C2B3 Project",
    clientName: "C2B3 Corp",
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
    createdAt: new Date("2026-09-01T00:00:00Z"),
    updatedAt: new Date("2026-09-01T00:00:00Z"),
  });
  const base = await quoteService.generateQuote({
    projectId: PROJECT,
    workspaceId: "ws-c2b3",
    organizationId: ORG,
    companyInfo: { companyName: "C2B3 Corp", targetUsers: 200, areaM2: 400 },
  });
  const view = await quoteService.getQuoteProductIntelligence({ quoteId: base.quote.id, organizationId: ORG, projectId: PROJECT });
  const treadmill = view.slots.find((s) => s.slotKey === TREADMILL_SLOT)!.candidates[0];
  const strength = view.slots.find((s) => s.slotKey === STRENGTH_SLOT)!.candidates[0];
  assert(Boolean(treadmill && strength), "fixture: reference candidates present");

  const version = async (treadmillFact: unknown, ellipticalFact: unknown) => {
    const v = await quoteService.createQuoteVersionWithSelections({
      baseQuoteId: base.quote.id,
      organizationId: ORG,
      projectId: PROJECT,
      selections: JSON.parse(
        json([
          { slotKey: TREADMILL_SLOT, action: "confirm", candidateId: treadmill.candidateId, quantity: 3, priceFact: treadmillFact },
          { slotKey: ELLIPTICAL_SLOT, action: "replace", customProduct: { brand: "Precor", model: "EFX 885" }, quantity: 4, priceFact: ellipticalFact },
          { slotKey: STRENGTH_SLOT, action: "confirm", candidateId: strength.candidateId },
          { slotKey: FREE_WEIGHT_SLOT, action: "replace", customProduct: { brand: "Hammer Strength", model: "HD Elite Rack" } },
        ]),
      ),
    });
    return v.quote.id;
  };
  return {
    baseId: base.quote.id,
    view,
    treadmill,
    strength,
    oldId: await version(PRICE_FACT, EXPIRED_BASE),
    metaId: await version(FULL_FACT, EXPIRED_FACT),
    taxFlipId: await version({ ...FULL_FACT, taxStatus: "tax_excluded" }, { ...EXPIRED_FACT, taxStatus: "tax_included" }),
    supplierId: await version({ ...FULL_FACT, supplier: "另一家报价单位" }, { ...EXPIRED_FACT, supplier: "Johnson Health Tech" }),
  };
}

type Fixture = Awaited<ReturnType<typeof seed>>;

async function budgetFor(quoteId: string, tier: (typeof TIERS)[number] = "mid") {
  const result = await budgetService.calculateBudget({ quoteId, organizationId: ORG, projectId: PROJECT, budgetTier: tier });
  const s = result.engine.structure;
  const items = s.detailedItems as unknown as BudgetItem[];
  return {
    persisted: result.budget as unknown as BudgetRowLike,
    structure: s,
    items,
    row: (slotKey: string) => items[s.detailedItemSlotKeys.indexOf(slotKey)],
  };
}

const verifiedRow = (priceFact: Record<string, unknown>, extra: Record<string, unknown> = {}) => ({
  category: "有氧设备",
  name: "商业级跑步机（Life Fitness IC7）",
  quantity: 3,
  unitPriceMin: priceFact.unitPrice,
  unitPriceMax: priceFact.unitPrice,
  subtotalMin: Number(priceFact.unitPrice) * 3,
  subtotalMax: Number(priceFact.unitPrice) * 3,
  priceBasis: "VERIFIED",
  priceFact,
  ...extra,
});

// ---------------------------------------------------------------------------
// 1 / 13. old facts: unchanged source text and identical PDF output
// ---------------------------------------------------------------------------

async function checkOldCompatibility(fx: Fixture) {
  const oldCases: Array<Record<string, unknown>> = [
    verifiedRow(PRICE_FACT),
    verifiedRow(EXPIRED_BASE),
    verifiedRow({ ...PRICE_FACT, verified: true, taxRate: 0.13 }),
    verifiedRow({ ...PRICE_FACT, sourceReference: "" }),
    verifiedRow({ ...PRICE_FACT, quotedAt: "" }),
    verifiedRow({ ...PRICE_FACT, sourceType: "catalog" }),
    verifiedRow({ ...PRICE_FACT, unitPrice: 1 }, { unitPriceMin: 18800, unitPriceMax: 18800 }),
    verifiedRow(PRICE_FACT, { unitPriceMax: 20000 }),
    verifiedRow(PRICE_FACT, { priceBasis: "ESTIMATE" }),
    { ...verifiedRow(PRICE_FACT), priceFact: null },
  ];
  for (const row of oldCases) {
    const now = readSource(row, Number(row.unitPriceMin), Number(row.unitPriceMax));
    const legacy = legacyReadSource(row, Number(row.unitPriceMin), Number(row.unitPriceMax));
    assert(now === legacy, `1. source text identical to pre-B3 for ${json(row.priceFact)} (got ${json(now)} vs ${json(legacy)})`);
  }
  assert(readSource(verifiedRow(PRICE_FACT), 18800, 18800) === BASE_SOURCE, "1. old fact source text exact");

  const oldBudget = await budgetFor(fx.oldId);
  const legacyPdf = await drawnTexts(oldBudget.persisted, legacyRenderBudgetPdf.renderBudgetPdf);
  const currentPdf = await drawnTexts(oldBudget.persisted);
  const again = await drawnTexts(oldBudget.persisted);
  assert(json(currentPdf.texts) === json(again.texts), "oracle sanity: rendering is deterministic");
  assert(json(currentPdf.texts) === json(legacyPdf.texts), "13. old-fact Budget PDF draws exactly the same text as the pre-B3 renderer");
  assert(!currentPdf.flat.includes(squash(TAX_NOTE)) && !/未注明|undefined|null/.test(currentPdf.flat), "1. no tax note / empty labels for old facts");

  const legacyBudgetLines = (items: Array<{ name: string; note?: string; priceBasis?: "VERIFIED" | "ESTIMATE"; priceSource?: string }>) =>
    json(legacyBudgetRender.budgetPriceBasisLines(items)) === json(budgetRender.budgetPriceBasisLines(items));
  assert(
    legacyBudgetLines([
      { name: "椭圆机（Precor EFX 885）", priceBasis: "VERIFIED", priceSource: BASE_SOURCE },
      { name: "综合训练器", note: "x；当前配置：A B（参考候选；单价未核实）", priceBasis: "ESTIMATE" },
    ]) && legacyBudgetLines([{ name: "商业级跑步机", priceBasis: "ESTIMATE" }]),
    "13. budgetPriceBasisLines identical to pre-B3 without procurement metadata",
  );
  console.log("✓ 1 / 13. old facts: source text identical to pre-B3; old-fact Budget PDF text identical to the pre-B3 renderer");
}

// ---------------------------------------------------------------------------
// 2 / 3 / 5. disclosure text: full, partial, malformed persisted metadata
// ---------------------------------------------------------------------------

function checkDisclosureText() {
  const src = (fact: Record<string, unknown>) => readSource(verifiedRow(fact), Number(fact.unitPrice), Number(fact.unitPrice));
  const full = src(FULL_FACT);
  assert(full === `${BASE_SOURCE} · 供应商 上海力健器材有限公司 · 含税 · 有效期至 2026-12-31`, `2. full disclosure text (got ${full})`);
  assert(
    occurrences(full!, "上海力健器材有限公司") === 1 && occurrences(full!, "含税") === 1 && occurrences(full!, "有效期至 2026-12-31") === 1,
    "2. supplier / tax status / validity each appear exactly once",
  );
  assert(src({ ...FULL_FACT, taxStatus: "tax_excluded" })!.endsWith(" · 不含税 · 有效期至 2026-12-31"), "2. 不含税 label");

  const partial: Array<[string, Record<string, unknown>, string]> = [
    ["supplier only", { ...PRICE_FACT, supplier: "上海力健器材有限公司" }, `${BASE_SOURCE} · 供应商 上海力健器材有限公司`],
    ["tax only", { ...PRICE_FACT, taxStatus: "tax_excluded" }, `${BASE_SOURCE} · 不含税`],
    ["validUntil only", { ...PRICE_FACT, validUntil: "2026-12-31" }, `${BASE_SOURCE} · 有效期至 2026-12-31`],
    ["supplier + validUntil", { ...PRICE_FACT, supplier: "ACME", validUntil: "2026-12-31" }, `${BASE_SOURCE} · 供应商 ACME · 有效期至 2026-12-31`],
  ];
  for (const [label, fact, expected] of partial) {
    const got = src(fact);
    assert(got === expected, `3. ${label} (got ${got})`);
    assert(!/undefined|null|未注明| · $| ·  · /.test(got!), `3. ${label}: no empty separators / placeholders`);
  }

  const malformed: Array<[string, Record<string, unknown>, string]> = [
    ["supplier number", { ...FULL_FACT, supplier: 42 }, `${BASE_SOURCE} · 含税 · 有效期至 2026-12-31`],
    ["supplier overlong", { ...FULL_FACT, supplier: "x".repeat(101) }, `${BASE_SOURCE} · 含税 · 有效期至 2026-12-31`],
    ["supplier control char", { ...FULL_FACT, supplier: "AC\u0000ME" }, `${BASE_SOURCE} · 含税 · 有效期至 2026-12-31`],
    ["supplier blank", { ...FULL_FACT, supplier: "   " }, `${BASE_SOURCE} · 含税 · 有效期至 2026-12-31`],
    ["taxStatus unknown", { ...FULL_FACT, taxStatus: "unknown" }, `${BASE_SOURCE} · 供应商 上海力健器材有限公司 · 有效期至 2026-12-31`],
    ["taxStatus empty", { ...FULL_FACT, taxStatus: "" }, `${BASE_SOURCE} · 供应商 上海力健器材有限公司 · 有效期至 2026-12-31`],
    ["validUntil before quotedAt", { ...FULL_FACT, validUntil: "2026-01-01" }, `${BASE_SOURCE} · 供应商 上海力健器材有限公司 · 含税`],
    ["validUntil invalid date", { ...FULL_FACT, validUntil: "2026-02-30" }, `${BASE_SOURCE} · 供应商 上海力健器材有限公司 · 含税`],
    ["validUntil timestamp", { ...FULL_FACT, validUntil: "2026-12-31T00:00:00Z" }, `${BASE_SOURCE} · 供应商 上海力健器材有限公司 · 含税`],
    ["all malformed", { ...PRICE_FACT, supplier: ["x"], taxStatus: 1, validUntil: false }, BASE_SOURCE],
  ];
  for (const [label, fact, expected] of malformed) {
    const got = src(fact);
    assert(got === expected, `5. ${label}: only the bad field omitted, base source kept (got ${got})`);
  }
  // A persisted supplier is displayed in its canonical (normalized) form.
  assert(src({ ...PRICE_FACT, supplier: "  上海力健   器材 " }) === `${BASE_SOURCE} · 供应商 上海力健 器材`, "persisted supplier normalized for display");

  // 4. ESTIMATE never discloses procurement metadata, even if a persisted row carries it.
  assert(readSource(verifiedRow(FULL_FACT, { priceBasis: "ESTIMATE" }), 18800, 18800) === null, "4. ESTIMATE row → no price source");
  assert(readSource(verifiedRow(FULL_FACT, { unitPriceMax: 20000 }), 18800, 20000) === null, "4. range row → no price source");

  const lines = (items: Parameters<typeof budgetRender.budgetPriceBasisLines>[0]) => budgetRender.budgetPriceBasisLines(items);
  const withTax = lines([{ name: "A", priceBasis: "VERIFIED", priceSource: src(FULL_FACT)! }, { name: "B", priceBasis: "VERIFIED", priceSource: BASE_SOURCE }]);
  assert(occurrences(withTax.join("\n"), TAX_NOTE) === 1 && withTax[1] === TAX_NOTE, "tax note: once, document-level, right after the basis legend");
  for (const fact of [{ ...PRICE_FACT, supplier: "ACME" }, { ...PRICE_FACT, validUntil: "2026-12-31" }, PRICE_FACT]) {
    assert(!lines([{ name: "A", priceBasis: "VERIFIED", priceSource: src(fact)! }]).includes(TAX_NOTE), `tax note absent without a disclosed tax status (${json(fact)})`);
  }
  assert(!lines([{ name: "A", priceBasis: "ESTIMATE", note: "x；当前配置：含税 · 不含税" }]).includes(TAX_NOTE), "tax note never driven by ESTIMATE rows");
  console.log("✓ 2 / 3 / 4 / 5. full, partial and malformed metadata disclose only valid fields; ESTIMATE never discloses");
}

// ---------------------------------------------------------------------------
// PDF end-to-end: disclosure printed, ESTIMATE / G1, malformed rows, expired, numeric invariance
// ---------------------------------------------------------------------------

async function checkPdfDelivery(fx: Fixture) {
  const meta = await budgetFor(fx.metaId);
  const tRow = meta.row(TREADMILL_SLOT);
  const eRow = meta.row(ELLIPTICAL_SLOT);
  const treadmillFootnote = `核实单价来源：${tRow.name} — ${BASE_SOURCE} · 供应商 上海力健器材有限公司 · 含税 · 有效期至 2026-12-31`;
  const ellipticalFootnote = `核实单价来源：${eRow.name} — ${EXPIRED_BASE_SOURCE} · 供应商 Life Fitness 华东代理 · 不含税 · 有效期至 2025-06-30`;
  const pdf = await drawnTexts(meta.persisted);
  assert(pdf.flat.includes(squash(treadmillFootnote)), "2. Budget PDF prints the full reference disclosure");
  assert(pdf.flat.includes(squash(ellipticalFootnote)), "2 / 6. Budget PDF prints the full custom disclosure, expired validUntil as recorded");
  assert(occurrences(pdf.flat, squash("上海力健器材有限公司")) === 1 && occurrences(pdf.flat, squash("有效期至 2026-12-31")) === 1, "2. each disclosure printed exactly once");
  assert(occurrences(pdf.flat, squash(TAX_NOTE)) === 1, "tax note printed once");
  assert(!/未注明|undefined/.test(pdf.flat), "no empty labels");

  // 6. expired stays VERIFIED; table rows tagged accordingly
  assert(eRow.priceBasis === "VERIFIED" && eRow.unitPriceMin === 26600 && eRow.subtotalMin === 26600 * 4, "6. expired quotation stays VERIFIED at 26600");
  assert(pdf.texts.some((t) => t.startsWith("[核实] 椭圆机")) && pdf.texts.some((t) => t.startsWith("[核实] 商业级跑步机")), "6. verified rows tagged [核实] in the table");

  // 4 / 9. ESTIMATE rows (G1): category names, configuration context only, no procurement metadata
  const sRow = meta.row(STRENGTH_SLOT);
  const fRow = meta.row(FREE_WEIGHT_SLOT);
  assert(sRow.priceBasis === "ESTIMATE" && sRow.name === "综合训练器" && fRow.priceBasis === "ESTIMATE" && fRow.name === "自由力量区设备", "9. ESTIMATE rows keep category names");
  assert(pdf.texts.includes("[估算] 综合训练器") && pdf.texts.includes("[估算] 自由力量区设备"), "9. table shows [估算] rows by category, no model");
  const strengthContext = `[估算] 综合训练器 — 当前配置：${fx.strength.brand} ${fx.strength.model}（参考候选；单价未核实）`;
  const freeWeightContext = "[估算] 自由力量区设备 — 当前配置：Hammer Strength HD Elite Rack（客户指定；单价未核实）";
  assert(pdf.texts.includes(strengthContext) && pdf.texts.includes(freeWeightContext), "9. estimate configuration context unchanged");
  for (const line of pdf.texts.filter((t) => t.startsWith("[估算]"))) {
    assert(!/供应商 |含税|不含税|有效期至/.test(line), `4. ESTIMATE line carries no procurement metadata (${line})`);
  }

  // 4. a tampered ESTIMATE row carrying metadata prints none of it
  const tampered = {
    ...meta.persisted,
    items: (meta.persisted.items as Array<Record<string, unknown>>).map((it) =>
      it.name === "综合训练器" ? { ...it, priceFact: { ...FULL_FACT, supplier: "伪造供应商" } } : it,
    ),
  };
  const tamperedPdf = await drawnTexts(tampered);
  assert(!tamperedPdf.flat.includes("伪造供应商") && tamperedPdf.texts.includes("[估算] 综合训练器"), "4. persisted ESTIMATE row never discloses metadata");

  // 5. malformed persisted metadata: row stays VERIFIED, base source kept, PDF renders
  const malformed = {
    ...meta.persisted,
    items: (meta.persisted.items as Array<Record<string, unknown>>).map((it) => {
      if (it.name === tRow.name) return { ...it, priceFact: { ...FULL_FACT, supplier: 42, taxStatus: "unknown" } };
      if (it.name === eRow.name) return { ...it, priceFact: { ...EXPIRED_FACT, validUntil: "2024-01-01" } };
      return it;
    }),
  };
  const malformedPdf = await drawnTexts(malformed);
  assert(malformedPdf.flat.includes(squash(`核实单价来源：${tRow.name} — ${BASE_SOURCE} · 有效期至 2026-12-31`)), "5. bad supplier / taxStatus omitted, validUntil + base kept");
  assert(malformedPdf.flat.includes(squash(`核实单价来源：${eRow.name} — ${EXPIRED_BASE_SOURCE} · 供应商 Life Fitness 华东代理 · 不含税`)), "5. bad validUntil omitted, supplier / tax + base kept");
  assert(malformedPdf.texts.some((t) => t.startsWith("[核实] 商业级跑步机")) && malformedPdf.texts.some((t) => t.startsWith("[核实] 椭圆机")), "5. rows stay [核实]");
  const tableNumbers = (texts: string[]) => texts.filter((t) => /^[\d,.¥\s-]+$/.test(t)).join("|");
  assert(tableNumbers(malformedPdf.texts) === tableNumbers(pdf.texts), "5. printed numbers unchanged by malformed metadata");
  console.log("✓ PDF: full disclosure printed once; expired shown as recorded; ESTIMATE / G1 unchanged; malformed metadata degrades per field");

  // 7 / 8 / 14. numeric invariance and disclosure-only differences
  const variants = [fx.oldId, fx.taxFlipId, fx.supplierId];
  for (const tier of TIERS) {
    const baseline = await budgetFor(fx.metaId, tier);
    for (const quoteId of variants) {
      const other = await budgetFor(quoteId, tier);
      const numbers = (items: BudgetItem[]) => json(items.map((it) => ({ ...it, priceFact: undefined })));
      assert(
        other.structure.totalEstimateMin === baseline.structure.totalEstimateMin &&
          other.structure.totalEstimateMax === baseline.structure.totalEstimateMax &&
          json(other.structure.categorySubtotals) === json(baseline.structure.categorySubtotals),
        `14. ${tier}: totals / subtotals identical (${quoteId})`,
      );
      assert(numbers(other.items) === numbers(baseline.items), `14. ${tier}: detailed items identical apart from priceFact (${quoteId})`);
    }
  }
  const footnotesOf = (budget: Awaited<ReturnType<typeof budgetFor>>, t: string, e: string) => [
    squash(`核实单价来源：${budget.row(TREADMILL_SLOT).name} — ${t}`),
    squash(`核实单价来源：${budget.row(ELLIPTICAL_SLOT).name} — ${e}`),
  ];
  const withoutDisclosure = (flat: string, footnotes: string[]) => {
    let out = flat.split(squash(TAX_NOTE)).join("");
    for (const f of footnotes) {
      assert(out.includes(f), `disclosure present before removal (${f})`);
      out = out.split(f).join("");
    }
    return out;
  };
  const metaRest = withoutDisclosure(pdf.flat, footnotesOf(meta, `${BASE_SOURCE} · 供应商 上海力健器材有限公司 · 含税 · 有效期至 2026-12-31`, `${EXPIRED_BASE_SOURCE} · 供应商 Life Fitness 华东代理 · 不含税 · 有效期至 2025-06-30`));
  const flip = await budgetFor(fx.taxFlipId);
  const flipRest = withoutDisclosure((await drawnTexts(flip.persisted)).flat, footnotesOf(flip, `${BASE_SOURCE} · 供应商 上海力健器材有限公司 · 不含税 · 有效期至 2026-12-31`, `${EXPIRED_BASE_SOURCE} · 供应商 Life Fitness 华东代理 · 含税 · 有效期至 2025-06-30`));
  const sup = await budgetFor(fx.supplierId);
  const supRest = withoutDisclosure((await drawnTexts(sup.persisted)).flat, footnotesOf(sup, `${BASE_SOURCE} · 供应商 另一家报价单位 · 含税 · 有效期至 2026-12-31`, `${EXPIRED_BASE_SOURCE} · 供应商 Johnson Health Tech · 不含税 · 有效期至 2025-06-30`));
  const old = await budgetFor(fx.oldId);
  const oldRest = withoutDisclosure((await drawnTexts(old.persisted)).flat, footnotesOf(old, BASE_SOURCE, EXPIRED_BASE_SOURCE));
  assert(flipRest === metaRest, "7. tax_included ↔ tax_excluded changes only the disclosure text (all printed numbers identical)");
  assert(supRest === metaRest, "8. supplier change changes only the disclosure text");
  assert(oldRest === metaRest, "14. with vs without metadata: everything outside the disclosure prints identically");
  console.log("✓ 7 / 8 / 14. LOW / MID / HIGH numbers identical; tax / supplier / metadata change only the disclosure text");
}

// ---------------------------------------------------------------------------
// 12. long values: printed in full (and proof the pre-B3 3-line cap dropped text silently)
// ---------------------------------------------------------------------------

async function checkLongValues(fx: Fixture) {
  const ref200 = "SQ-2026-SH-PROCUREMENT-".repeat(9).slice(0, 200);
  const supplier100 = "上海力健商用健身器材供应链管理有限公司".repeat(6).slice(0, 100);
  assert(ref200.length === 200 && supplier100.length === 100 && supplier100.length === pi.MAX_PRICE_FACT_SUPPLIER_LENGTH, "fixture: max-length values");
  const longFact = (unitPrice: number) => ({ unitPrice, currency: "CNY", sourceType: "supplier_quote", sourceReference: ref200, quotedAt: "2026-09-20", supplier: supplier100, taxStatus: "tax_excluded", validUntil: "2026-12-31" });

  // Every PI slot priced with max-length metadata (worst case for the footnote block).
  const selections = fx.view.slots.map((slot, i) =>
    slot.candidates.length > 0
      ? { slotKey: slot.slotKey, action: "confirm", candidateId: slot.candidates[0].candidateId, priceFact: longFact(10000 + i) }
      : { slotKey: slot.slotKey, action: "replace", customProduct: { brand: "Precor", model: `EFX ${885 + i}` }, priceFact: longFact(10000 + i) },
  );
  const v = await quoteService.createQuoteVersionWithSelections({ baseQuoteId: fx.baseId, organizationId: ORG, projectId: PROJECT, selections: JSON.parse(json(selections)) });
  const budget = await budgetFor(v.quote.id);
  const verified = budget.items.filter((it) => it.priceBasis === "VERIFIED");
  assert(verified.length === fx.view.slots.length, `fixture: every PI slot VERIFIED (${verified.length})`);
  const footnotes = verified.map((it) => `核实单价来源：${it.name} — 供应商报价 · ${ref200} · 报价日期 2026-09-20 · 供应商 ${supplier100} · 不含税 · 有效期至 2026-12-31`);

  // Necessity: the pre-B3 cap (wrapTextCN maxLines 3) drops the tail silently — no ellipsis.
  const doc = await pdfLib.PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(fs.readFileSync(path.join(ROOT, "public/fonts/NotoSansSC-Regular.ttf")), { subset: true });
  const tableW = 595.28 - 42 - 42;
  const capped = text.wrapTextCN(footnotes[0], { font, fontSize: 8, maxWidth: tableW, maxLines: 3 });
  const uncapped = text.wrapTextCN(footnotes[0], { font, fontSize: 8, maxWidth: tableW, maxLines: 999 });
  assert(uncapped.length > 3, `necessity: max-length disclosure needs ${uncapped.length} lines`);
  assert(squash(capped.join("")).length < squash(footnotes[0]).length && !capped.some((l) => l.endsWith("…")), "necessity: a 3-line cap truncates silently (no ellipsis)");
  assert(!squash(capped.join("")).includes(squash("有效期至 2026-12-31")), "necessity: the cap would drop the validity date");

  for (const extra of [{}, { tenderDocument: tenderDoc.buildTenderDocumentContext({ projectId: PROJECT, planId: "plan-c2b3", tier: "enterprise" }) }, { packMerge: true }]) {
    const pdf = await drawnTexts(budget.persisted, renderBudgetPdfModule.renderBudgetPdf, extra);
    for (const f of footnotes) {
      assert(pdf.flat.includes(squash(f)), `12. max-length disclosure printed in full (${Object.keys(extra).join(",") || "standalone"}): ${f.slice(0, 40)}…`);
    }
  }
  // Other footnotes keep the 3-line cap (no global loosening).
  const renderSource = fs.readFileSync(path.join(ROOT, BUDGET_RENDER), "utf8");
  assert(/maxLines: b\.startsWith\(VERIFIED_PRICE_SOURCE_PREFIX\) \? 999 : 3,/.test(renderSource), "12. only verified-source footnotes lift the 3-line cap");
  console.log(`✓ 12. ${footnotes.length} max-length disclosures (ref 200 + supplier 100, ${uncapped.length} lines each) printed in full; pre-B3 cap proven to drop text`);
}

// ---------------------------------------------------------------------------
// 10. Plan PDF (G6) and 11. Tender ZIP reuse
// ---------------------------------------------------------------------------

async function checkPlanAndTender(fx: Fixture) {
  assert(execSync(`git diff --name-only ${PRE_B3_REF} -- ${PLAN_PDF}`, { cwd: ROOT, encoding: "utf8" }).trim() === "", "10. renderPlanPdf unchanged");
  const source = await quoteService.ensureQuotePlanPdfSource(fx.metaId);
  assert(source.placeholders.every((p) => !("priceFact" in p)), "10. Plan PDF source carries no price fact");
  const expandConfigLine = loadExpandConfigLine();
  const normalized = planPdf.normalizePlaceholders(source.placeholders);
  const bySlot = new Map(normalized.map((p, i) => [`${p.category}|${p.subCategory ?? ""}`, expandConfigLine(p, i, { brand: "AI Fitness Solution" }).join("\n")]));
  const t = bySlot.get(TREADMILL_SLOT)!;
  const e = bySlot.get(ELLIPTICAL_SLOT)!;
  const s = bySlot.get(STRENGTH_SLOT)!;
  assert(t.includes("（确认数量：3 台/套；") && e.includes("（确认数量：4 台/套；") && s.includes("（建议数量："), "10. confirmed / suggested quantity semantics intact");
  assert(t.includes("   单价已核实，详见预算") && e.includes("   单价已核实，详见预算") && s.includes("单价未核实"), "10. 单价已核实，详见预算 for verified rows only");
  for (const lines of bySlot.values()) {
    assert(!/上海力健|Life Fitness 华东代理|含税|不含税|有效期至|18800|26600/.test(lines), "10. no supplier / tax / validity / unit price in Plan PDF lines");
  }
  drawn.length = 0;
  const plan = await planPdf.renderPlanPdf(source as never, source.solution as never, source.placeholders as never, { tier: "enterprise" });
  assert(plan.subarray(0, 5).toString() === "%PDF-", "10. Plan PDF renders");
  const planFlat = squash(drawn.join(""));
  assert(planFlat.includes(squash("单价已核实，详见预算")) && !/上海力健|华东代理|有效期至|不含税/.test(planFlat), "10. rendered Plan PDF: verified → see Budget; no procurement metadata");
  console.log("✓ 10. Plan PDF unchanged: 确认 / 建议数量, 单价已核实，详见预算, no procurement metadata");

  for (const rel of ["app/api/pdf/tender/zip/route.ts", "app/api/pdf/tender/budget/route.ts", "lib/pdf/renderTenderPack.ts"]) {
    const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
    assert(/import \{ renderBudgetPdf \} from "@\/lib\/pdf\/renderBudgetPdf";/.test(src) && /renderBudgetPdf\(/.test(src), `11. ${rel} renders the Budget through renderBudgetPdf`);
    assert(!/priceFact|supplier|taxStatus|validUntil|budgetPriceBasisLines|核实单价来源/.test(src), `11. ${rel} has no second disclosure implementation`);
    assert(execSync(`git diff --name-only ${PRE_B3_REF} -- "${rel}"`, { cwd: ROOT, encoding: "utf8" }).trim() === "", `11. ${rel} unchanged`);
  }
  assert(/renderBudgetPdf\(input\.budget, \{[\s\S]{0,200}packMerge: true/.test(fs.readFileSync(path.join(ROOT, "lib/pdf/renderTenderPack.ts"), "utf8")), "11. Tender Pack embeds the same renderer (packMerge)");
  console.log("✓ 11. Tender ZIP / Tender budget route / Tender Pack reuse renderBudgetPdf (disclosure verified for standalone, tenderDocument and packMerge)");
}

// ---------------------------------------------------------------------------
// 15. scope
// ---------------------------------------------------------------------------

function checkScope() {
  const lines = (cmd: string) =>
    execSync(cmd, { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  const untouched = [
    "lib/services/tender/generateBudget.ts",
    "lib/services/budget.service.ts",
    "lib/services/quote.service.ts",
    "lib/budget/over-budget-adjustment.ts",
    "app/(product)/budget/page.tsx",
    "lib/pdf/contracts/budgetSummary.ts",
    "lib/pdf/engine/text.ts",
    PLAN_PDF,
    "app/api",
    "prisma/schema.prisma",
  ];
  assert(lines(`git diff --name-only ${PRE_B3_REF} -- ${untouched.map((f) => `"${f}"`).join(" ")}`).length === 0, "generateBudget / services / C.1 / budget page / PDF contracts / Plan PDF / API / schema unchanged");
  const changed = lines(`git diff --name-only ${PRE_B3_REF}`);
  const untracked = lines("git ls-files --others --exclude-standard");
  const allowed = new Set([
    "lib/domain/tender.ts",
    "lib/product-engine/product-intelligence.ts",
    "app/(product)/quote/page.tsx",
    RENDER_BUDGET_PDF,
    BUDGET_RENDER,
    "scripts/verify-c2-b1-price-fact-procurement-metadata.ts",
    "scripts/verify-c2-b2-quote-procurement-ui.ts",
    "scripts/verify-c2-b3-procurement-delivery.ts",
  ]);
  const knownDirty = new Set([
    "lib/commercial/action-delivery/index.ts",
    "lib/payments/wechatProvider.ts",
    "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql",
    "login-gzip.html",
  ]);
  for (const file of [...changed, ...untracked]) {
    if (knownDirty.has(file)) continue;
    assert(allowed.has(file), `C.2-B3 scope: unexpected change ${file}`);
    assert(!file.startsWith("prisma/"), `C.2-B3: no Prisma / schema / migration change (${file})`);
  }
  console.log("✓ 15. scope (B1 + B2 + renderBudgetPdf + budgetRender + B1/B2/B3 verifiers; no Prisma / schema / migration change)");
}

async function main() {
  const fx = await seed();
  await checkOldCompatibility(fx);
  checkDisclosureText();
  await checkPdfDelivery(fx);
  await checkLongValues(fx);
  await checkPlanAndTender(fx);
  checkScope();
  console.log("\nverify-c2-b3-procurement-delivery: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Product Core v2 — C.2-A3 Customer-Facing Delivery Semantics verification.
 * G1: Budget / Budget PDF never present an ESTIMATE as the price of the configured model.
 * G6: Solution PDF distinguishes customer-specified vs reference candidate, confirmed vs
 *     suggested quantity, and verified vs unverified unit price.
 * Numeric Budget output is compared against a pre-A3 oracle (HEAD generateBudget) for the
 * same Quote and tier. Runs the real services with an in-memory Prisma stub. No DB, no network.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

import type { BudgetItem, ProductPlaceholder } from "../lib/domain/tender";

const ROOT = path.resolve(__dirname, "..");
const GENERATE_BUDGET = "lib/services/tender/generateBudget.ts";
const PLAN_PDF = "lib/pdf/renderPlanPdf.ts";

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

function transpile(source: string, module: ts.ModuleKind) {
  return ts.transpileModule(source, {
    compilerOptions: { module, target: ts.ScriptTarget.ES2020, alwaysStrict: true },
  }).outputText;
}

/* eslint-disable @typescript-eslint/no-require-imports */
const domain = require("../lib/domain/tender") as typeof import("../lib/domain/tender");
const generateBudgetModule = require("../lib/services/tender/generateBudget") as typeof import("../lib/services/tender/generateBudget");
const quoteService = require("../lib/services/quote.service") as typeof import("../lib/services/quote.service");
const budgetService = require("../lib/services/budget.service") as typeof import("../lib/services/budget.service");
const planPdf = require("../lib/pdf/renderPlanPdf") as typeof import("../lib/pdf/renderPlanPdf");
const budgetRender = require("../lib/pdf/budgetRender") as typeof import("../lib/pdf/budgetRender");
const renderBudgetPdfModule = require("../lib/pdf/renderBudgetPdf") as typeof import("../lib/pdf/renderBudgetPdf");
const pi = require("../lib/product-engine/product-intelligence") as typeof import("../lib/product-engine/product-intelligence");
const templates = require("../lib/templates/placeholderTemplates") as typeof import("../lib/templates/placeholderTemplates");

/** Pre-A3 generateBudget (unchanged by A1 / A2), transpiled from HEAD. */
function loadHeadGenerateBudget(): typeof generateBudgetModule {
  const source = execSync(`git show HEAD:${GENERATE_BUDGET}`, { cwd: ROOT, encoding: "utf8" });
  const js = transpile(source, ts.ModuleKind.CommonJS);
  const mod = { exports: {} as Record<string, unknown> };
  const localRequire = (id: string) => {
    if (id === "@/lib/domain/tender") return domain;
    throw new Error(`HEAD generateBudget: unexpected import ${id}`);
  };
  const fn = vm.runInThisContext(`(function (exports, require, module) {${js}\n})`) as (
    exports: Record<string, unknown>,
    require: (id: string) => unknown,
    module: { exports: Record<string, unknown> },
  ) => void;
  fn(mod.exports, localRequire, mod);
  return mod.exports as unknown as typeof generateBudgetModule;
}

/** A second budget.service instance wired to the pre-A3 generateBudget; every other module is shared. */
function loadPreA3BudgetService(): typeof budgetService {
  const genPath = require.resolve(path.join(ROOT, GENERATE_BUDGET));
  const servicePath = require.resolve(path.join(ROOT, "lib/services/budget.service"));
  const currentGen = require.cache[genPath];
  const currentService = require.cache[servicePath];
  stubModule(GENERATE_BUDGET, loadHeadGenerateBudget() as unknown as Record<string, unknown>);
  delete require.cache[servicePath];
  const preA3 = require(servicePath) as typeof budgetService;
  require.cache[genPath] = currentGen;
  require.cache[servicePath] = currentService;
  return preA3;
}
/* eslint-enable @typescript-eslint/no-require-imports */

const headGenerateBudget = loadHeadGenerateBudget();
const preA3BudgetService = loadPreA3BudgetService();
assert(preA3BudgetService !== budgetService, "oracle: separate pre-A3 budget.service instance");

type ConfigLineFn = (p: ProductPlaceholder, i: number, ctx: { brand: string }) => string[];

/** expandConfigLine is module-private; extract it from the renderer source and run it in memory. */
function loadExpandConfigLine(): ConfigLineFn {
  const source = fs.readFileSync(path.join(ROOT, PLAN_PDF), "utf8");
  const start = source.indexOf("function expandConfigLine(");
  const end = source.indexOf("/** 无占位行时的标准分区配置");
  assert(start > 0 && end > start, "locate expandConfigLine in renderPlanPdf");
  const js = transpile(`function __factory() {\n${source.slice(start, end)}\nreturn expandConfigLine;\n}`, ts.ModuleKind.None);
  return vm.runInThisContext(`(function () {${js}\nreturn __factory();\n})()`) as ConfigLineFn;
}

const expandConfigLine = loadExpandConfigLine();
const PDF_CTX = { brand: "AI Fitness Solution" };

const ORG = "org-c2a3";
const PROJECT = "p-c2a3";
const TREADMILL_SLOT = "有氧设备|商业级跑步机";
const ELLIPTICAL_SLOT = "有氧设备|椭圆机";
const STRENGTH_SLOT = "力量设备|综合训练器";
const FREE_WEIGHT_SLOT = "力量设备|自由力量区设备";
const PRICE_FACT = {
  unitPrice: 18800,
  currency: "CNY",
  sourceType: "supplier_quote",
  sourceReference: "SQ-C2A3-001",
  quotedAt: "2026-09-20",
};
const STRENGTH_PRICE_FACT = {
  unitPrice: 26600,
  currency: "CNY",
  sourceType: "procurement_contract",
  sourceReference: "PC-C2A3-002",
  quotedAt: "2026-09-21",
};
const TIERS = ["low", "mid", "high"] as const;

function seedProject() {
  db.projects.set(PROJECT, {
    id: PROJECT,
    name: "C2A3 Project",
    clientName: "C2A3 Corp",
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
}

type Service = typeof budgetService;

async function calculate(service: Service, quoteId: string, tier: (typeof TIERS)[number] = "mid") {
  const result = await service.calculateBudget({ quoteId, organizationId: ORG, projectId: PROJECT, budgetTier: tier });
  const s = result.engine.structure;
  const items = s.detailedItems as unknown as BudgetItem[];
  return {
    result,
    items,
    row: (slotKey: string) => items[s.detailedItemSlotKeys.indexOf(slotKey)],
  };
}

function slotKeyOf(p: { category: string; subCategory?: string | null }) {
  return `${p.category}|${p.subCategory ?? ""}`;
}

function linesFor(source: Awaited<ReturnType<typeof quoteService.ensureQuotePlanPdfSource>>) {
  const normalized = deepFreeze(planPdf.normalizePlaceholders(source.placeholders));
  const bySlot = new Map<string, string[]>();
  normalized.forEach((p, i) => bySlot.set(slotKeyOf(p), expandConfigLine(p, i, PDF_CTX)));
  return { normalized, bySlot };
}

/** Same mapping renderBudgetPdf applies to persisted detailed rows before budgetRender. */
function budgetPdfFootnotes(items: BudgetItem[]) {
  return budgetRender.budgetPriceBasisLines(
    items.map((it) => ({
      name: it.name ?? it.category,
      note: it.remark,
      priceBasis: it.priceBasis === "VERIFIED" && it.priceFact ? "VERIFIED" : "ESTIMATE",
      priceSource: it.priceBasis === "VERIFIED" && it.priceFact ? `${it.priceFact.sourceReference}` : undefined,
    })),
  );
}

// ---------------------------------------------------------------------------
// Fixture: base Quote + one version with every source × price × quantity case
// ---------------------------------------------------------------------------

async function buildFixture() {
  seedProject();
  const base = await quoteService.generateQuote({
    projectId: PROJECT,
    workspaceId: "ws-c2a3",
    organizationId: ORG,
    companyInfo: { companyName: "C2A3 Corp", targetUsers: 200, areaM2: 400 },
  });
  const baseId = base.quote.id;
  const view = await quoteService.getQuoteProductIntelligence({ quoteId: baseId, organizationId: ORG, projectId: PROJECT });
  const treadmill = view.slots.find((s) => s.slotKey === TREADMILL_SLOT)!.candidates[0];
  const strength = view.slots.find((s) => s.slotKey === STRENGTH_SLOT)!.candidates[0];
  assert(Boolean(treadmill && strength), "fixture: treadmill / strength slots have reference candidates");
  const v1 = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: baseId,
    organizationId: ORG,
    projectId: PROJECT,
    decidedBy: "user-c2a3",
    selections: JSON.parse(
      json([
        { slotKey: ELLIPTICAL_SLOT, action: "replace", customProduct: { brand: "Precor", model: "EFX 885" }, quantity: 4, priceFact: PRICE_FACT },
        { slotKey: FREE_WEIGHT_SLOT, action: "replace", customProduct: { brand: "Hammer Strength", model: "HD Elite Rack" } },
        { slotKey: TREADMILL_SLOT, action: "confirm", candidateId: treadmill.candidateId, quantity: 3 },
        { slotKey: STRENGTH_SLOT, action: "confirm", candidateId: strength.candidateId, priceFact: STRENGTH_PRICE_FACT },
      ]),
    ),
  });
  return { baseId, v1Id: v1.quote.id, treadmill, strength };
}

// ---------------------------------------------------------------------------
// 1–3 + 9. Budget rows and Budget PDF footnotes
// ---------------------------------------------------------------------------

async function checkBudget(fx: Awaited<ReturnType<typeof buildFixture>>) {
  const base = await calculate(budgetService, fx.baseId);
  const b = await calculate(budgetService, fx.v1Id);
  const treadmillLabel = `${fx.treadmill.brand} ${fx.treadmill.model}`;
  const strengthLabel = `${fx.strength.brand} ${fx.strength.model}`;

  const elliptical = b.row(ELLIPTICAL_SLOT);
  assert(
    elliptical.priceBasis === "VERIFIED" &&
      elliptical.unitPriceMin === PRICE_FACT.unitPrice &&
      elliptical.unitPriceMax === PRICE_FACT.unitPrice &&
      elliptical.subtotalMin === PRICE_FACT.unitPrice * 4 &&
      elliptical.name === "椭圆机（Precor EFX 885）" &&
      elliptical.remark!.includes("当前配置：Precor EFX 885（客户指定；参数未核实）") &&
      !elliptical.remark!.includes("参考候选"),
    "1. custom + priceFact → VERIFIED at the exact price; brand / model in the priced identity, labelled 客户指定",
  );
  console.log(`✓ 1. VERIFIED ${elliptical.name} @ ${elliptical.unitPriceMin}`);

  const freeWeight = b.row(FREE_WEIGHT_SLOT);
  const freeWeightTemplate = base.row(FREE_WEIGHT_SLOT);
  assert(
    freeWeight.priceBasis === "ESTIMATE" &&
      freeWeight.unitPriceMin === freeWeightTemplate.unitPriceMin &&
      freeWeight.unitPriceMax === freeWeightTemplate.unitPriceMax &&
      freeWeight.quantity === freeWeightTemplate.quantity &&
      freeWeight.name === "自由力量区设备" &&
      !/Hammer|HD Elite/.test(freeWeight.name!) &&
      freeWeight.remark!.endsWith("；当前配置：Hammer Strength HD Elite Rack（客户指定；单价未核实）") &&
      !freeWeight.remark!.includes("参考候选") &&
      !freeWeight.remark!.includes("核实单价"),
    `2. custom without priceFact → ESTIMATE; category is the priced identity, model only context (got ${json(freeWeight)})`,
  );
  console.log(`✓ 2. ESTIMATE ${freeWeight.name} ${freeWeight.unitPriceMin}-${freeWeight.unitPriceMax}; context in remark only`);

  const treadmill = b.row(TREADMILL_SLOT);
  assert(
    treadmill.priceBasis === "ESTIMATE" &&
      treadmill.name === "商业级跑步机" &&
      treadmill.remark!.endsWith(`；当前配置：${treadmillLabel}（参考候选；单价未核实）`) &&
      !treadmill.remark!.includes("客户指定") &&
      treadmill.priceFact === undefined,
    "3. reference without priceFact → ESTIMATE, labelled 参考候选, not verified",
  );
  const strength = b.row(STRENGTH_SLOT);
  assert(
    strength.priceBasis === "VERIFIED" &&
      strength.unitPriceMin === STRENGTH_PRICE_FACT.unitPrice &&
      strength.name === `综合训练器（${strengthLabel}）` &&
      strength.remark!.includes(`当前配置：${strengthLabel}（参考候选；参数未核实）`),
    "9. reference + priceFact → VERIFIED, labelled 参考候选",
  );
  console.log("✓ 3 / 9. reference rows: ESTIMATE labelled 参考候选; VERIFIED keeps the exact price");

  for (const row of b.items.filter((it) => it.priceBasis === "ESTIMATE")) {
    assert(!/[（(]/.test(row.name ?? ""), `ESTIMATE name carries no configured model (${row.name})`);
  }

  const footnotes = budgetPdfFootnotes(b.items);
  assert(footnotes.includes("[估算] 自由力量区设备 — 当前配置：Hammer Strength HD Elite Rack（客户指定；单价未核实）"), "Budget PDF: custom estimate shown as configuration context");
  assert(footnotes.includes(`[估算] 商业级跑步机 — 当前配置：${treadmillLabel}（参考候选；单价未核实）`), "Budget PDF: reference estimate shown as configuration context");
  assert(footnotes.some((l) => l.startsWith("核实单价来源：椭圆机（Precor EFX 885）")), "Budget PDF: verified source footnote kept");
  assert(!footnotes.some((l) => l.startsWith("[估算] 椭圆机") || l.startsWith("[估算] 综合训练器")), "Budget PDF: verified rows get no estimate context");
  console.log("✓ Budget PDF: table names carry no model on [估算] rows; configuration context printed as footnotes");

  const persisted = db.budgets[db.budgets.length - 1];
  const pdf = await renderBudgetPdfModule.renderBudgetPdf(persisted as never, {
    tier: "enterprise",
    planId: fx.v1Id,
    companyName: "C2A3 Corp",
    companySize: 200,
    budgetLevel: "mid",
  });
  assert(pdf.subarray(0, 5).toString() === "%PDF-", "Budget PDF renders for the A3 Budget");
  console.log(`✓ Budget PDF renders (${pdf.length} bytes)`);
  return { base, b };
}

// ---------------------------------------------------------------------------
// 10. numeric invariance vs pre-A3 for the same Quote and tier
// ---------------------------------------------------------------------------

function numericView(items: BudgetItem[]) {
  return items.map((it) => {
    const copy: Record<string, unknown> = { ...it };
    delete copy.name;
    delete copy.remark;
    return copy;
  });
}

async function checkNumericInvariance(fx: Awaited<ReturnType<typeof buildFixture>>) {
  let compared = 0;
  for (const quoteId of [fx.baseId, fx.v1Id]) {
    for (const tier of TIERS) {
      const now = await calculate(budgetService, quoteId, tier);
      const pre = await calculate(preA3BudgetService, quoteId, tier);
      const s = now.result.engine.structure;
      const p = pre.result.engine.structure;
      assert(json(numericView(now.items)) === json(numericView(pre.items)), `10. item numbers identical to pre-A3 (${quoteId} / ${tier})`);
      assert(
        s.totalEstimateMin === p.totalEstimateMin &&
          s.totalEstimateMax === p.totalEstimateMax &&
          json(s.categorySubtotals) === json(p.categorySubtotals) &&
          json(s.items) === json(p.items) &&
          json(s.detailedItemSlotKeys) === json(p.detailedItemSlotKeys) &&
          json(s.assumptions) === json(p.assumptions),
        `10. totals / subtotals / slot keys / assumptions identical to pre-A3 (${quoteId} / ${tier})`,
      );
      assert(
        json(numericView(now.result.budget.items as unknown as BudgetItem[])) ===
          json(numericView(pre.result.budget.items as unknown as BudgetItem[])) &&
          now.result.budget.totalEstimateMin === pre.result.budget.totalEstimateMin &&
          now.result.budget.totalEstimateMax === pre.result.budget.totalEstimateMax,
        `10. persisted Budget numbers identical to pre-A3 (${quoteId} / ${tier})`,
      );
      now.items.forEach((it, i) => {
        const old = pre.items[i];
        if (!/[（(]/.test(old.name ?? "")) {
          assert(it.name === old.name && it.remark === old.remark, `rows without a configured product keep name / remark byte-identical (${old.name})`);
        }
      });
      if (quoteId === fx.v1Id) {
        assert(
          pre.row(FREE_WEIGHT_SLOT).name === "自由力量区设备（Hammer Strength HD Elite Rack）" &&
            now.row(FREE_WEIGHT_SLOT).name === "自由力量区设备",
          "oracle sanity: pre-A3 path still names the ESTIMATE row after the model",
        );
      }
      compared += 1;
    }
  }
  assert(json(Object.keys(headGenerateBudget)) === json(Object.keys(generateBudgetModule)), "generateBudget exports unchanged");
  console.log(`✓ 10. numeric Budget output identical to pre-A3 for ${compared} Quote × tier runs (only name / remark text differs)`);
}

// ---------------------------------------------------------------------------
// 4–8 + 9 + 11. Solution PDF semantics
// ---------------------------------------------------------------------------

async function checkSolutionPdf(fx: Awaited<ReturnType<typeof buildFixture>>, budgets: Awaited<ReturnType<typeof checkBudget>>) {
  const source = await quoteService.ensureQuotePlanPdfSource(fx.v1Id);
  const facts = new Map(source.placeholders.map((p) => [slotKeyOf(p), p]));
  const fact = (slotKey: string) => {
    const p = facts.get(slotKey)!;
    return { productSource: p.productSource, quantityConfirmed: p.quantityConfirmed, priceVerified: p.priceVerified };
  };
  assert(json(fact(ELLIPTICAL_SLOT)) === json({ productSource: "customer-specified", quantityConfirmed: true, priceVerified: true }), "PDF source facts: custom + quantity + priceFact");
  assert(json(fact(FREE_WEIGHT_SLOT)) === json({ productSource: "customer-specified", quantityConfirmed: false, priceVerified: false }), "PDF source facts: custom only");
  assert(json(fact(TREADMILL_SLOT)) === json({ productSource: null, quantityConfirmed: true, priceVerified: false }), "PDF source facts: reference + quantity");
  assert(json(fact(STRENGTH_SLOT)) === json({ productSource: null, quantityConfirmed: false, priceVerified: true }), "PDF source facts: reference + priceFact");
  assert(source.placeholders.every((p) => !("priceFact" in p)), "PDF source carries no price fact (only the verified flag)");

  const { bySlot } = linesFor(source);
  const text = (slotKey: string) => bySlot.get(slotKey)!.join("\n");
  const elliptical = text(ELLIPTICAL_SLOT);
  const freeWeight = text(FREE_WEIGHT_SLOT);
  const treadmill = text(TREADMILL_SLOT);
  const strength = text(STRENGTH_SLOT);
  const freeWeightQty = budgets.base.row(FREE_WEIGHT_SLOT).quantity;

  assert(
    elliptical.includes("   客户指定：Precor EFX 885") &&
      freeWeight.includes("   客户指定：Hammer Strength HD Elite Rack") &&
      elliptical.includes("   参数状态：未核实") &&
      freeWeight.includes("   参数状态：未核实") &&
      !elliptical.includes("参考候选") &&
      !freeWeight.includes("参考候选"),
    "4. customer-specified items say 客户指定 + 参数状态：未核实, never 参考候选",
  );
  console.log("✓ 4. Solution PDF: customer-specified, parameters unverified, never 参考候选");

  assert(
    elliptical.includes("（确认数量：4 台/套；") && treadmill.includes("（确认数量：3 台/套；"),
    "5. persisted selection quantity → 确认数量",
  );
  assert(
    freeWeight.includes(`（建议数量：${freeWeightQty} 台/套；`) && strength.includes("（建议数量："),
    "6. template quantity → 建议数量",
  );
  console.log(`✓ 5–6. 确认数量 for persisted quantities; 建议数量 ${freeWeightQty} for template quantity`);

  assert(
    elliptical.includes("   单价已核实，详见预算") && strength.includes("   单价已核实，详见预算"),
    "7. valid priceFact → 单价已核实，详见预算",
  );
  for (const t of [elliptical, strength]) {
    assert(!t.includes(String(PRICE_FACT.unitPrice)) && !t.includes(String(STRENGTH_PRICE_FACT.unitPrice)), "7. Solution PDF never prints the unit price");
  }
  assert(
    !freeWeight.includes("已核实") && !treadmill.includes("已核实") && freeWeight.includes("单价未核实") && treadmill.includes("单价未核实"),
    "8. no priceFact → never claims a verified price",
  );
  console.log("✓ 7–8. verified price → see Budget (no amount); unverified price stated as such");

  assert(
    treadmill.includes(`   参考候选：${fx.treadmill.brand} ${fx.treadmill.model}（非采购确认）`) &&
      treadmill.includes("   参数状态：未核实") &&
      !treadmill.includes("客户指定") &&
      strength.includes(`   参考候选：${fx.strength.brand} ${fx.strength.model}（非采购确认）`),
    "9. reference candidates keep the 参考候选 label",
  );
  console.log("✓ 9. reference candidates labelled 参考候选 / 参数未核实");

  const pdf = await planPdf.renderPlanPdf(source as never, source.solution as never, source.placeholders as never, { tier: "enterprise" });
  assert(pdf.subarray(0, 5).toString() === "%PDF-", "Solution PDF renders for the A3 Quote");
  console.log(`✓ Solution PDF renders (${pdf.length} bytes)`);
}

async function checkOldQuoteSafety(fx: Awaited<ReturnType<typeof buildFixture>>) {
  const baseSource = await quoteService.ensureQuotePlanPdfSource(fx.baseId);
  assert(
    baseSource.placeholders.every((p) => p.productSource === null && p.quantityConfirmed === false && p.priceVerified === false),
    "11. Quote without selections: all delivery facts default",
  );
  const baseLines = linesFor(baseSource);
  for (const lines of baseLines.bySlot.values()) {
    const t = lines.join("\n");
    assert(t.includes("（建议数量：") && !/客户指定|参考候选|单价/.test(t), "11. template rows: suggested quantity, no product / price claims");
  }

  const legacyRows = [
    { brand: null, model: null },
    { brand: "Life Fitness", model: "T5" },
  ].map((b, i) => ({
    id: `legacy-${i}`,
    projectId: PROJECT,
    category: "有氧设备",
    subCategory: "商业级跑步机",
    specTags: ["商用"],
    quantity: 5,
    priceBand: "mid",
    recommendationReason: "历史行",
    replaceable: true,
    skuId: null,
    skuName: null,
    imageUrl: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...b,
  }));
  const legacy = deepFreeze(planPdf.normalizePlaceholders(legacyRows as never));
  assert(legacy.every((p) => !("productSource" in p) && !("quantityConfirmed" in p) && !("priceVerified" in p)), "11. legacy DB rows normalise without delivery facts");
  const [plain, branded] = legacy.map((p, i) => expandConfigLine(p, i, PDF_CTX).join("\n"));
  assert(plain.includes("（建议数量：5 台/套；") && !/客户指定|参考候选|单价/.test(plain), "11. legacy row without product renders suggested quantity only");
  assert(
    branded.includes("   参考候选：Life Fitness T5（非采购确认）") && branded.includes("   单价未核实") && !branded.includes("已核实") && !branded.includes("客户指定"),
    "11. legacy row with brand defaults to 参考候选 / 单价未核实",
  );
  const legacyPdf = await planPdf.renderPlanPdf(
    baseSource as never,
    baseSource.solution as never,
    legacyRows as never,
    { tier: "enterprise" },
  );
  assert(legacyPdf.subarray(0, 5).toString() === "%PDF-", "11. legacy placeholder rows render");

  const preA3Budget = [
    { name: "椭圆机（Life Fitness X8）", remark: "历史；方案候选配置：Life Fitness X8（参考候选 / 未核实，单价按档位）", priceBasis: "ESTIMATE" as const },
    { name: "商业级跑步机", remark: "历史", priceBasis: "ESTIMATE" as const },
  ];
  const oldFootnotes = budgetRender.budgetPriceBasisLines(preA3Budget.map((it) => ({ name: it.name, note: it.remark, priceBasis: it.priceBasis })));
  assert(json(oldFootnotes) === json(["[估算] 按品类 × 预算档位的单价区间估算。"]), "11. pre-A3 persisted Budget rows render the unchanged footnote");
  console.log("✓ 11. old Quote / legacy DB rows / pre-A3 Budget rows render safely with defaults");
}

// ---------------------------------------------------------------------------
// 12. no mutation
// ---------------------------------------------------------------------------

async function checkNoMutation(fx: Awaited<ReturnType<typeof buildFixture>>) {
  const quotesBefore = json([...db.quotes.values()]);
  const projectsBefore = json([...db.projects.values()]);
  const budgetCount = db.budgets.length;
  await quoteService.ensureQuotePlanPdfSource(fx.v1Id);
  await quoteService.findQuotePlanPdfSourceForProject(fx.v1Id, PROJECT);
  assert(json([...db.quotes.values()]) === quotesBefore && json([...db.projects.values()]) === projectsBefore, "12. PDF sources do not write Quote / Project");
  assert(db.budgets.length === budgetCount, "12. PDF sources create no Budget");

  const quote = db.quotes.get(fx.v1Id)!;
  const selections = (quote.companyInfo as { productSelections?: unknown[] }).productSelections as never;
  const template = templates.buildPlaceholders(
    PROJECT,
    { name: "C2A3 Project", siteType: "office", targetUsers: 200, areaM2: 400, budgetLevel: "mid", deliveryMode: "standard" } as never,
    { quantityModel: templates.resolveQuoteQuantityModel(quote.content) },
  );
  const frozenTemplate = deepFreeze(structuredClone(template));
  const applied = pi.applyProductSelections(frozenTemplate, selections);
  assert(applied.placeholders.filter((p) => p.productSource === "customer-specified").length === 2, "fixture: overlay marks the two customer-specified slots");
  assert(json(frozenTemplate) === json(template), "12. overlay does not mutate template placeholders");
  const frozen = deepFreeze(structuredClone(applied.placeholders));
  const before = json(frozen);
  generateBudgetModule.generateBudget(PROJECT, frozen, { priceBand: "mid" });
  assert(json(frozen) === before, "12. generateBudget does not mutate placeholders");
  console.log("✓ 12. no mutation: PDF sources read-only; generateBudget / config lines run on frozen inputs");
}

// ---------------------------------------------------------------------------
// static + scope
// ---------------------------------------------------------------------------

function checkStaticAndScope() {
  const gen = fs.readFileSync(path.join(ROOT, GENERATE_BUDGET), "utf8");
  const headGen = execSync(`git show HEAD:${GENERATE_BUDGET}`, { cwd: ROOT, encoding: "utf8" });
  const table = (src: string) => src.slice(src.indexOf("function getUnitPriceRange("), src.indexOf("function buildBudgetItem("));
  assert(table(gen) === table(headGen), "category × tier price table byte-identical to HEAD");
  assert(!/skuDatabase|priceBand\.(min|max)/.test(gen), "generateBudget never reads catalog priceBand");
  const plan = fs.readFileSync(path.join(ROOT, PLAN_PDF), "utf8");
  const configFn = plan.slice(plan.indexOf("function expandConfigLine("), plan.indexOf("/** 无占位行时的标准分区配置"));
  assert(!/unitPrice|priceFact/.test(configFn), "Solution PDF config lines never read a unit price");
  const tender = fs.readFileSync(path.join(ROOT, "lib/domain/tender.ts"), "utf8");
  assert(!/supplierName|taxIncluded|validUntil/.test(tender), "ProductPriceFact not expanded");

  const lines = (cmd: string) =>
    execSync(cmd, { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  const allowed = new Set([
    "lib/product-engine/product-intelligence.ts",
    "scripts/verify-c2-a1-customer-specified-product.ts",
    "app/(product)/quote/page.tsx",
    "lib/budget/over-budget-adjustment.ts",
    "scripts/verify-c2-a2-customer-product-ui-c1.ts",
    "lib/domain/tender.ts",
    GENERATE_BUDGET,
    "lib/pdf/budgetRender.ts",
    PLAN_PDF,
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
    assert(allowed.has(file), `C.2-A3 scope: unexpected change ${file}`);
    assert(!file.startsWith("prisma/"), `C.2-A3: no Prisma / schema / migration change (${file})`);
  }
  console.log("✓ static + scope (C.2-A1/A2/A3 files only; price table unchanged; no Prisma)");
}

async function main() {
  const fx = await buildFixture();
  const budgets = await checkBudget(fx);
  await checkNumericInvariance(fx);
  await checkSolutionPdf(fx, budgets);
  await checkOldQuoteSafety(fx);
  await checkNoMutation(fx);
  checkStaticAndScope();
  console.log("\nverify-c2-a3-delivery-semantics: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

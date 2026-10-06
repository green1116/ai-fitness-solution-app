/**
 * C.6-A — Organization Estimate Price Reference verification.
 * Slice 1 (pure / domain / generateBudget), differential against the baseline generateBudget
 * (C.5-A freeze, transpiled in memory): no reference → byte-identical; hit → organization range,
 * still ESTIMATE, snapshotted; partial / wrong-tier / malformed / ambiguous → platform fallback;
 * VERIFIED (incl. expired validUntil) always wins; reference-catalog / customer-specified /
 * procurement-product remarks unchanged; quantity never changed; canonical registry equals the
 * template-generated subcategory set.
 * Slice 2 (schema / migration / service / API): additive migration, revision + soft deactivation,
 * OWNER / ADMIN writes, organization isolation, validation and conflict errors — real routes and
 * service against an in-memory Prisma stub (SaaS gate stubbed).
 * Slice 3 (calculateBudget integration): real budget.service against the same stub, differential
 * against the baseline budget.service — scoped active-reference read after the tenant check, empty /
 * no-org → baseline, read failure → calculation fails (no [] fallback), r1 → r2 → deactivate only
 * affects new Budgets, persisted Budgets and their C.1 options never change.
 * Slice 4 (Budget PDF): real renderBudgetPdf vs the baseline renderer (both transpiled / loaded in
 * memory), drawn text captured from pdf-lib — the basis is read only from the persisted snapshot,
 * platform / VERIFIED / historical / malformed snapshots render exactly as baseline.
 * Slice 5 (UI): price reference page / manager rendered server-side with react-dom/server and driven
 * against the real API routes; Budget price-basis panel rendered from persisted Budget items.
 * SEC (pre-commit): /api/budget/calculate vs the baseline route — internal 500s return only a fixed
 * message; every typed / non-500 branch answers byte-identically.
 * No DB, no network, no files written.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import vm from "node:vm";

import type { NextRequest } from "next/server";
import ts from "typescript";

import type {
  BudgetRecord,
  PriceBand,
  ProductPlaceholder,
  ProductPriceFact,
  ProjectInput,
  SiteType,
} from "../lib/domain/tender";

const ROOT = path.resolve(__dirname, "..");
const BASELINE = "5bc60fb871ec17f8a9a99bde6962798bce16534b";
const BUDGET_FILE = "lib/services/tender/generateBudget.ts";
const REFERENCE_FILE = "lib/budget/estimate-price-reference.ts";
const VERIFIER = "scripts/verify-c6-a-organization-estimate-price-reference.ts";

const out = console.log.bind(console);
console.log = () => undefined;

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const json = (value: unknown) => JSON.stringify(value);

// ---------------------------------------------------------------------------
// In-memory Prisma stub (every call logged) + SaaS gate stub — Slice 2 only
// ---------------------------------------------------------------------------

type Row = Record<string, unknown> & { id: string };
type Call = { model: string; method: string; args: unknown };

const WRITE_METHODS = new Set(["create", "createMany", "update", "updateMany", "upsert", "delete", "deleteMany"]);

const db = {
  references: new Map<string, Row>(),
  projects: new Map<string, Row>(),
  quotes: new Map<string, Row>(),
  budgets: [] as Row[],
  calls: [] as Call[],
  seq: 0,
  /** One-shot hooks simulating a concurrent writer between the read and the write. */
  beforeUpdateMany: null as null | (() => void),
  hideNextFindUnique: false,
  failNextFindMany: null as null | Error,
};

function stubModule(rel: string, exports: Record<string, unknown>) {
  const filename = require.resolve(path.join(ROOT, rel));
  const mod = new Module(filename);
  mod.filename = filename;
  mod.loaded = true;
  mod.exports = exports;
  require.cache[filename] = mod;
}

/* eslint-disable @typescript-eslint/no-require-imports */
const prismaClient = require("@prisma/client") as typeof import("@prisma/client");
/* eslint-enable @typescript-eslint/no-require-imports */

const nextDate = () => new Date(Date.UTC(2026, 9, 6) + ++db.seq * 1000);

function matches(row: Row, where: Record<string, unknown> | undefined): boolean {
  if (!where) return true;
  return Object.entries(where).every(([key, expected]) => row[key] === expected);
}

function applyData(row: Row, data: Record<string, unknown>) {
  for (const [key, value] of Object.entries(data)) {
    if (key === "revision" && value && typeof value === "object") {
      row.revision = Number(row.revision) + Number((value as { increment: number }).increment);
    } else row[key] = structuredClone(value);
  }
}

type CompoundWhere = {
  organizationId_subcategoryKey_budgetTier: { organizationId: string; subcategoryKey: string; budgetTier: string };
};

const referenceModel: Record<string, (args: never) => Promise<unknown>> = {
  findUnique: async ({ where }: { where: CompoundWhere }) => {
    if (db.hideNextFindUnique) {
      db.hideNextFindUnique = false;
      return null;
    }
    const key = where.organizationId_subcategoryKey_budgetTier;
    const row = [...db.references.values()].find((r) => matches(r, key));
    return row ? structuredClone(row) : null;
  },
  findFirst: async ({ where }: { where: Record<string, unknown> }) => {
    const row = [...db.references.values()].find((r) => matches(r, where));
    return row ? structuredClone(row) : null;
  },
  findMany: async ({ where }: { where: Record<string, unknown> }) => {
    if (db.failNextFindMany) {
      const err = db.failNextFindMany;
      db.failNextFindMany = null;
      throw err;
    }
    return [...db.references.values()]
      .filter((r) => matches(r, where))
      .sort((a, b) => String(a.subcategoryKey).localeCompare(String(b.subcategoryKey)) || String(a.budgetTier).localeCompare(String(b.budgetTier)))
      .map((r) => structuredClone(r));
  },
  create: async ({ data }: { data: Record<string, unknown> }) => {
    const duplicate = [...db.references.values()].some(
      (r) => r.organizationId === data.organizationId && r.subcategoryKey === data.subcategoryKey && r.budgetTier === data.budgetTier,
    );
    if (duplicate) {
      throw new prismaClient.Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed on the fields: (`organizationId`,`subcategoryKey`,`budgetTier`)",
        { code: "P2002", clientVersion: prismaClient.Prisma.prismaVersion.client },
      );
    }
    const now = nextDate();
    const row: Row = { id: `opr${db.seq}`, revision: 1, active: true, createdBy: null, updatedBy: null, createdAt: now, updatedAt: now };
    applyData(row, data);
    db.references.set(row.id, row);
    return structuredClone(row);
  },
  updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
    if (db.beforeUpdateMany) {
      const hook = db.beforeUpdateMany;
      db.beforeUpdateMany = null;
      hook();
    }
    const rows = [...db.references.values()].filter((r) => matches(r, where));
    for (const row of rows) {
      applyData(row, data);
      row.updatedAt = nextDate();
    }
    return { count: rows.length };
  },
};

const quoteModel: Record<string, (args: never) => Promise<unknown>> = {
  findUnique: async ({ where, include }: { where: { id: string }; include?: { project?: boolean } }) => {
    const row = db.quotes.get(where.id);
    if (!row) return null;
    const project = include?.project ? db.projects.get(String(row.projectId)) : undefined;
    return { ...structuredClone(row), ...(include?.project ? { project: project ? structuredClone(project) : null } : {}) };
  },
};

const budgetModel: Record<string, (args: never) => Promise<unknown>> = {
  create: async ({ data }: { data: Record<string, unknown> }) => {
    const row: Row = { id: `bud${++db.seq}`, createdAt: nextDate(), ...structuredClone(data) };
    db.budgets.push(row);
    return structuredClone(row);
  },
  findUnique: async ({ where }: { where: { id: string } }) => {
    const row = db.budgets.find((b) => b.id === where.id);
    return row ? structuredClone(row) : null;
  },
};

const MODELS: Record<string, Record<string, (args: never) => Promise<unknown>>> = {
  organizationPriceReference: referenceModel,
  quote: quoteModel,
  budget: budgetModel,
};

stubModule("lib/prisma", {
  prisma: new Proxy({} as Record<string, unknown>, {
    get(_target, prop) {
      if (typeof prop !== "string" || prop === "then") return undefined;
      return new Proxy(MODELS[prop] ?? {}, {
        get(target, method) {
          if (typeof method !== "string" || method === "then") return undefined;
          return async (args: unknown) => {
            db.calls.push({ model: prop, method, args });
            const fn = target[method];
            if (!fn) throw new Error(`unexpected prisma.${prop}.${method}`);
            return fn(args as never);
          };
        },
      });
    },
  }),
});

const ORG = "org-c6a";
const OTHER_ORG = "org-c6a-other";
const gate = { org: ORG, role: "OWNER", user: "user-c6a" };

stubModule("lib/saas/api-gate", {
  runSaasOrgGate: async () => ({
    organizationId: gate.org,
    userId: gate.user,
    email: `${gate.user}@example.test`,
    role: gate.role,
    membership: {},
    traceId: "trace-c6a",
    plan: "PRO",
  }),
});
/* eslint-disable @typescript-eslint/no-require-imports */
stubModule("lib/error/global-error.handler", {
  handleApiError: (err: unknown, ctx: { traceId: string }) => {
    const mapper = require("../lib/error/api-error.mapper") as typeof import("../lib/error/api-error.mapper");
    const mapped = mapper.mapErrorToApiError(err, ctx.traceId);
    return new Response(JSON.stringify({ ok: false, code: mapped.code, message: mapped.message }), {
      status: mapped.status,
      headers: { "Content-Type": "application/json" },
    });
  },
});
/* eslint-enable @typescript-eslint/no-require-imports */

/* eslint-disable @typescript-eslint/no-require-imports */
const ref = require("../lib/budget/estimate-price-reference") as typeof import("../lib/budget/estimate-price-reference");
const generateBudgetModule = require("../lib/services/tender/generateBudget") as typeof import("../lib/services/tender/generateBudget");
const templates = require("../lib/templates/placeholderTemplates") as typeof import("../lib/templates/placeholderTemplates");
const pi = require("../lib/product-engine/product-intelligence") as typeof import("../lib/product-engine/product-intelligence");
const referencesRoute = require("../app/api/organization-price-references/route") as typeof import("../app/api/organization-price-references/route");
const referenceRoute = require("../app/api/organization-price-references/[id]/route") as typeof import("../app/api/organization-price-references/[id]/route");
const adjustment = require("../lib/budget/over-budget-adjustment") as typeof import("../lib/budget/over-budget-adjustment");
/* eslint-enable @typescript-eslint/no-require-imports */

/** Slice 3 — every generateBudget call made by budget.service, delegating to the real implementation. */
const generateBudgetCalls: Array<{ options: unknown }> = [];
stubModule(BUDGET_FILE.replace(/\.ts$/, ""), {
  ...generateBudgetModule,
  generateBudget: (...args: Parameters<typeof generateBudgetModule.generateBudget>) => {
    generateBudgetCalls.push({ options: structuredClone(args[2]) });
    return generateBudgetModule.generateBudget(...args);
  },
});
/* eslint-disable @typescript-eslint/no-require-imports */
const budgetService = require("../lib/services/budget.service") as typeof import("../lib/services/budget.service");
const referenceService = require("../lib/services/organization-price-reference.service") as typeof import("../lib/services/organization-price-reference.service");
/* eslint-enable @typescript-eslint/no-require-imports */

type Reference = import("../lib/budget/estimate-price-reference").EstimatePriceReference;
type Selection = import("../lib/product-engine/product-intelligence").ProductSelection;
type Candidate = import("../lib/product-engine/product-intelligence").ProductCandidate;

const gitShow = (rel: string) => execSync(`git show ${BASELINE}:${rel}`, { cwd: ROOT, encoding: "utf8" });

/** Baseline implementation of a module, transpiled in memory (legacy oracle); `overrides` pins imports by specifier. */
function loadBaselineModule<T>(rel: string, overrides: Record<string, unknown> = {}): T {
  return loadTranspiledModule<T>(gitShow(rel), rel, overrides);
}

/** Working-tree implementation of a module, transpiled in memory with the same import overrides. */
function loadWorkingModule<T>(rel: string, overrides: Record<string, unknown> = {}): T {
  return loadTranspiledModule<T>(fs.readFileSync(path.join(ROOT, rel), "utf8"), rel, overrides);
}

function loadTranspiledModule<T>(source: string, rel: string, overrides: Record<string, unknown>): T {
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
  return mod.exports as unknown as T;
}

const legacyBudget = loadBaselineModule<typeof generateBudgetModule>(BUDGET_FILE);
const BUDGET_SERVICE = "lib/services/budget.service.ts";
const legacyBudgetService = loadBaselineModule<typeof budgetService>(BUDGET_SERVICE);

/* eslint-disable @typescript-eslint/no-require-imports */
const pdfLib = require("pdf-lib") as typeof import("pdf-lib");
const renderBudgetPdfModule = require("../lib/pdf/renderBudgetPdf") as typeof import("../lib/pdf/renderBudgetPdf");
const budgetRenderModule = require("../lib/pdf/budgetRender") as typeof import("../lib/pdf/budgetRender");
/* eslint-enable @typescript-eslint/no-require-imports */
const PDF_FILES = ["lib/pdf/renderBudgetPdf.ts", "lib/pdf/budgetRender.ts", "lib/pdf/contracts/budgetSummary.ts"];
const legacyBudgetRender = loadBaselineModule<typeof budgetRenderModule>("lib/pdf/budgetRender.ts");
const legacyRenderBudgetPdf = loadBaselineModule<typeof renderBudgetPdfModule>("lib/pdf/renderBudgetPdf.ts", {
  "@/lib/pdf/budgetRender": legacyBudgetRender,
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PROJECT = "proj-c6a";
const SITE_TYPES: SiteType[] = ["office", "factory", "park", "school", "hospital", "mixed"];
const NOTES = [
  undefined,
  "力量为主，配少量有氧",
  "有氧为主",
  "以普拉提为主，另需瑜伽和功能训练区",
  "瑜伽为主",
  "功能训练为主，少量力量",
];
const TIERS: PriceBand[] = ["low", "mid", "high"];

function projectInput(siteType: SiteType, notes?: string): ProjectInput {
  return {
    name: "C6A",
    clientName: "C6A Corp",
    industry: "enterprise",
    siteType,
    areaM2: 400,
    targetUsers: 200,
    city: "上海市",
    budgetLevel: "mid",
    deliveryMode: "standard",
    ...(notes ? { notes } : {}),
  };
}

function placeholdersFor(siteType: SiteType, notes?: string): ProductPlaceholder[] {
  return templates.buildPlaceholders(PROJECT, projectInput(siteType, notes), {
    quantityModel: templates.QUANTITY_MODEL_PER_USER_V2,
  });
}

const PILATES_NOTES = "以普拉提为主，另需瑜伽和功能训练区";
const TREADMILL = { category: "有氧设备", subCategory: "商业级跑步机" };
const ELLIPTICAL = { category: "有氧设备", subCategory: "椭圆机" };
const STRENGTH = { category: "力量设备", subCategory: "综合训练器" };
const LOCKERS = { category: "配套家具", subCategory: "储物柜" };
const PILATES = { category: "普拉提设备", subCategory: "普拉提核心床（Reformer）" };

function reference(overrides: Partial<Reference> & Pick<Reference, "subcategoryKey" | "budgetTier">): Reference {
  return {
    id: `opr-${overrides.subcategoryKey}-${overrides.budgetTier}`,
    unitPriceMin: 35000,
    unitPriceMax: 65000,
    sourceNote: "C6A 区域成交价 2026Q3",
    revision: 1,
    ...overrides,
  };
}

const TREADMILL_MID = reference({ subcategoryKey: "cardio.commercial_treadmill", budgetTier: "mid" });
const PILATES_MID = reference({
  subcategoryKey: "studio.pilates_reformer",
  budgetTier: "mid",
  unitPriceMin: 18000,
  unitPriceMax: 26000,
  sourceNote: "  C6A 普拉提核心床合作报价  ",
  revision: 3,
});
const LOCKERS_MID = reference({ subcategoryKey: "furniture.lockers", budgetTier: "mid", unitPriceMin: 1200, unitPriceMax: 1800 });

const strip = (budget: BudgetRecord) => ({ ...budget, createdAt: null, updatedAt: null });
const same = (a: BudgetRecord, b: BudgetRecord) => json(strip(a)) === json(strip(b));

function rowOf(budget: BudgetRecord, slot: { subCategory: string }) {
  const row = budget.items.find((i) => i.name === slot.subCategory || i.name?.startsWith(`${slot.subCategory}（`));
  assert(Boolean(row), `fixture: row ${slot.subCategory} present`);
  return row!;
}

const PRICE_FACT: ProductPriceFact = {
  unitPrice: 42000,
  currency: "CNY",
  sourceType: "supplier_quote",
  sourceReference: "SQ-C6A-001",
  quotedAt: "2026-09-01",
};
const EXPIRED_PRICE_FACT: ProductPriceFact = {
  unitPrice: 39000,
  currency: "CNY",
  sourceType: "procurement_contract",
  sourceReference: "PC-C6A-2025",
  quotedAt: "2025-01-10",
  supplier: "C6A Supplier",
  taxStatus: "tax_included",
  validUntil: "2025-06-30",
};

function candidate(source: Candidate["source"], brand: string, model: string, subCategory: string, id: string): Candidate {
  return {
    candidateId: id,
    brand,
    model,
    category: subCategory,
    keySpecs: [],
    fitReason: "c6a",
    source,
    verificationStatus: "unverified",
    openQuestions: [],
  };
}

function select(
  slot: { category: string; subCategory: string },
  cand: Candidate | null,
  extra: Partial<Selection> = {},
): Selection {
  return {
    slotKey: pi.productSlotKey(slot.category, slot.subCategory),
    action: cand ? "replace" : "confirm",
    candidate: cand,
    decidedAt: "2026-10-06T00:00:00.000Z",
    ...extra,
  };
}

function withSelections(placeholders: ProductPlaceholder[], selections: Selection[]): ProductPlaceholder[] {
  const applied = pi.applyProductSelections(placeholders, selections);
  assert(applied.warnings.length === 0, `fixture: selections apply cleanly (got ${json(applied.warnings)})`);
  return applied.placeholders;
}

const catalogTreadmill = pi.listCandidatesForSlot({ subCategory: TREADMILL.subCategory, priceBand: "mid" })[0];
assert(Boolean(catalogTreadmill) && catalogTreadmill.source === "reference-catalog", "fixture: reference-catalog treadmill candidate");
const customElliptical = candidate("customer-specified", "Precor", "EFX 885", ELLIPTICAL.subCategory, pi.customProductCandidateId("Precor", "EFX 885"));
const procurementStrength = candidate("procurement-product", "C6A Brand", "MS-1", STRENGTH.subCategory, pi.procurementCandidateId("ppc6a1", 1));

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

function checkRegistry() {
  const keys = ref.ESTIMATE_SUBCATEGORIES.map((s) => s.key);
  const pairs = ref.ESTIMATE_SUBCATEGORIES.map((s) => `${s.category}|${s.subCategory}`);
  assert(keys.length === 11 && new Set(keys).size === 11 && new Set(pairs).size === 11, "registry: 11 unique keys and unique (category, subCategory) pairs");
  assert(keys.every((k) => /^[a-z]+\.[a-z_]+$/.test(k)), "registry: ASCII canonical keys");

  const generated = new Set<string>();
  for (const site of SITE_TYPES) {
    for (const notes of NOTES) {
      for (const p of placeholdersFor(site, notes)) generated.add(`${p.category}|${(p.subCategory ?? "").trim()}`);
    }
  }
  assert(
    json([...generated].sort()) === json([...pairs].sort()),
    `registry equals the template-generated subcategory set (generated ${json([...generated].sort())})`,
  );
  for (const s of ref.ESTIMATE_SUBCATEGORIES) {
    assert(ref.resolveEstimateSubcategoryKey(s.category, s.subCategory) === s.key, `resolve ${s.key}`);
    assert(ref.resolveEstimateSubcategoryKey(` ${s.category} `, ` ${s.subCategory} `) === s.key, `resolve ${s.key} trims`);
  }
  assert(ref.resolveEstimateSubcategoryKey("有氧设备", "动感单车") === null, "unregistered subcategory → no key");
  assert(ref.resolveEstimateSubcategoryKey("力量设备", "商业级跑步机") === null, "category must match too");
  assert(ref.resolveEstimateSubcategoryKey("有氧设备", undefined) === null, "missing subcategory → no key");
  out("✓ registry: 11 ASCII keys ↔ exact (category, subCategory) pairs, identical to every pair buildPlaceholders generates (all site types × focus variants); no template / placeholder key");
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const NOTE_CJK = "华东区域集中采购年度框架合同成交价汇总参考数据来源说明含税运输安装调试培训验收质保售后服务备件响应";

/** Exactly `length` chars of mixed 中文 + English + spaces (the widest-wrapping legal sourceNote content). */
function adverseNote(length: number, seed = "C6A", cjkRun = 14): string {
  let s = `${seed} `;
  for (let i = 0; s.length < length; i++) {
    let run = "";
    for (let k = 0; k < cjkRun; k++) run += NOTE_CJK[(i * cjkRun + k) % NOTE_CJK.length];
    s += `Supplier ${run} `;
  }
  s = s.slice(0, length);
  return s.endsWith(" ") ? `${s.slice(0, -1)}价` : s;
}

function checkValidation() {
  const valid = { subcategoryKey: "cardio.commercial_treadmill", budgetTier: "mid", unitPriceMin: 35000, unitPriceMax: 65000, sourceNote: "  区域成交价  " };
  assert(ref.MAX_ESTIMATE_SOURCE_NOTE_LENGTH === 120, `sourceNote contract max = 120 (got ${ref.MAX_ESTIMATE_SOURCE_NOTE_LENGTH})`);
  for (const length of [1, 119, 120]) {
    for (const note of [adverseNote(length), "价".repeat(length)]) {
      assert(note.length === length, `fixture: ${length}-char note`);
      const res = ref.validateEstimatePriceReferenceInput({ ...valid, sourceNote: note });
      assert(res.ok && res.value.sourceNote === note, `validation: ${length}-char sourceNote accepted unchanged (got ${json(res)})`);
    }
  }
  for (const note of [adverseNote(121), "价".repeat(121), `${adverseNote(120)}x`]) {
    assert(note.length === 121 && !ref.validateEstimatePriceReferenceInput({ ...valid, sourceNote: note }).ok, "validation: 121-char sourceNote rejected");
  }
  const ok = ref.validateEstimatePriceReferenceInput(valid);
  assert(ok.ok && ok.value.sourceNote === "区域成交价" && ok.value.unitPriceMin === 35000, `valid input accepted, note trimmed (got ${json(ok)})`);
  assert(ref.validateEstimatePriceReferenceInput({ ...valid, unitPriceMin: 65000 }).ok, "min === max accepted");
  const rejects: Array<[string, unknown]> = [
    ["not an object", null],
    ["array", [valid]],
    ["unknown key", { ...valid, subcategoryKey: "cardio.bike" }],
    ["Chinese display name as key", { ...valid, subcategoryKey: "商业级跑步机" }],
    ["slotKey as key", { ...valid, subcategoryKey: "有氧设备|商业级跑步机" }],
    ["invalid tier", { ...valid, budgetTier: "custom" }],
    ["upper-case tier", { ...valid, budgetTier: "MID" }],
    ["min > max", { ...valid, unitPriceMin: 70000 }],
    ["zero", { ...valid, unitPriceMin: 0 }],
    ["negative", { ...valid, unitPriceMin: -1 }],
    ["decimal", { ...valid, unitPriceMax: 65000.5 }],
    ["string number", { ...valid, unitPriceMin: "35000" }],
    ["above max", { ...valid, unitPriceMax: ref.MAX_ESTIMATE_UNIT_PRICE + 1 }],
    ["NaN", { ...valid, unitPriceMin: Number.NaN }],
    ["empty note", { ...valid, sourceNote: "   " }],
    ["missing note", { ...valid, sourceNote: undefined }],
    ["long note", { ...valid, sourceNote: "价".repeat(ref.MAX_ESTIMATE_SOURCE_NOTE_LENGTH + 1) }],
    ["control char note", { ...valid, sourceNote: "价格\u0007说明" }],
  ];
  for (const [label, input] of rejects) {
    const res = ref.validateEstimatePriceReferenceInput(input);
    assert(!res.ok && typeof res.error === "string" && res.error.length > 0, `validation rejects ${label}`);
  }
  out("✓ validation: canonical key / low|mid|high tier / integer 1..10,000,000 with min ≤ max / required trimmed sourceNote ≤ 120 without control chars (1 / 119 / 120 mixed 中文 + English + spaces accepted unchanged, 121 rejected); display names, slotKeys and malformed values rejected");
}

// ---------------------------------------------------------------------------
// AC1 — no organization reference → baseline behaviour
// ---------------------------------------------------------------------------

function checkNoReference() {
  let cases = 0;
  const selectionSets: Array<(p: ProductPlaceholder[]) => ProductPlaceholder[]> = [
    (p) => p,
    (p) =>
      withSelections(p, [
        select(TREADMILL, catalogTreadmill, { quantity: 9, priceFact: PRICE_FACT }),
        select(ELLIPTICAL, customElliptical, { priceFact: EXPIRED_PRICE_FACT }),
        select(STRENGTH, procurementStrength, { quantity: 5 }),
      ]),
  ];
  for (const site of SITE_TYPES) {
    for (const notes of NOTES) {
      for (const pick of selectionSets) {
        let placeholders: ProductPlaceholder[];
        try {
          placeholders = pick(placeholdersFor(site, notes));
        } catch {
          continue; // a selected slot absent for this site type / focus
        }
        for (const priceBand of [undefined, ...TIERS]) {
          const base = legacyBudget.generateBudget(PROJECT, placeholders, priceBand ? { priceBand } : undefined);
          for (const extra of [{}, { estimatePriceReferences: undefined }, { estimatePriceReferences: [] }]) {
            const opts = { ...(priceBand ? { priceBand } : {}), ...extra };
            const next = generateBudgetModule.generateBudget(PROJECT, placeholders, Object.keys(opts).length ? opts : undefined);
            assert(same(next, base), `AC1. ${site} / ${notes ?? "-"} / ${priceBand ?? "placeholder band"} / ${json(extra)} byte-identical to baseline`);
            assert(next.items.every((i) => !("estimateBasis" in i)), "AC1. no estimateBasis without a reference");
            cases += 1;
          }
        }
      }
    }
  }
  assert(json(strip(generateBudgetModule.generateBudget(PROJECT, []))) === json(strip(legacyBudget.generateBudget(PROJECT, []))), "AC1. empty placeholder list identical");
  out(`✓ AC1. no organization reference (absent / undefined / []) → generateBudget items, totals, assumptions byte-identical to baseline across ${cases} site × focus × selection × tier cases; no estimateBasis field`);
}

// ---------------------------------------------------------------------------
// AC2 / AC3 — organization reference hit, partial coverage, non-matching references
// ---------------------------------------------------------------------------

function checkHitAndPartial() {
  const placeholders = placeholdersFor("office", PILATES_NOTES);
  const base = legacyBudget.generateBudget(PROJECT, placeholders, { priceBand: "mid" });
  const refs = [TREADMILL_MID, PILATES_MID, reference({ subcategoryKey: "cardio.commercial_treadmill", budgetTier: "high", unitPriceMin: 90000, unitPriceMax: 150000 })];
  const next = generateBudgetModule.generateBudget(PROJECT, placeholders, { priceBand: "mid", estimatePriceReferences: refs });

  assert(next.items.length === base.items.length, "AC2. one row per placeholder");
  const hits = new Map([
    [TREADMILL.subCategory, TREADMILL_MID],
    [PILATES.subCategory, PILATES_MID],
  ]);
  next.items.forEach((row, i) => {
    const b = base.items[i];
    assert(row.quantity === b.quantity && row.quantity === placeholders[i].quantity, `quantity unchanged (${b.name})`);
    const hit = hits.get(String(b.name));
    if (!hit) {
      assert(json(row) === json(b), `AC3. miss row ${b.name} byte-identical to baseline (platform generic)`);
      return;
    }
    assert(row.unitPriceMin === hit.unitPriceMin && row.unitPriceMax === hit.unitPriceMax, `AC2. ${b.name} uses the organization range`);
    assert(row.subtotalMin === hit.unitPriceMin * b.quantity && row.subtotalMax === hit.unitPriceMax * b.quantity, `AC2. ${b.name} subtotal = quantity × organization range`);
    assert(row.priceBasis === "ESTIMATE" && !("priceFact" in row), `AC2. ${b.name} stays ESTIMATE`);
    assert(
      json(row.estimateBasis) ===
        json({
          source: "organization-price-reference",
          referenceId: hit.id,
          revision: hit.revision,
          subcategoryKey: hit.subcategoryKey,
          budgetTier: "mid",
          sourceNote: hit.sourceNote.trim(),
        }),
      `AC2. ${b.name} estimateBasis snapshot (got ${json(row.estimateBasis)})`,
    );
    const { estimateBasis, unitPriceMin, unitPriceMax, subtotalMin, subtotalMax, ...rest } = row;
    const { unitPriceMin: _a, unitPriceMax: _b, subtotalMin: _c, subtotalMax: _d, ...baseRest } = b;
    void estimateBasis; void unitPriceMin; void unitPriceMax; void subtotalMin; void subtotalMax;
    void _a; void _b; void _c; void _d;
    assert(json(rest) === json(baseRest), `AC2. ${b.name} name / specLevel / quantity / remark / sourceType unchanged`);
    assert(json(Object.keys(row)) === json([...Object.keys(b), "estimateBasis"]), `AC2. ${b.name} baseline key order + trailing estimateBasis`);
  });
  const sumMin = next.items.reduce((s, i) => s + i.subtotalMin, 0);
  const sumMax = next.items.reduce((s, i) => s + i.subtotalMax, 0);
  assert(next.totalEstimateMin === sumMin && next.totalEstimateMax === sumMax, "AC2. totals = Σ subtotals");
  const tRow = rowOf(base, TREADMILL);
  const pRow = rowOf(base, PILATES);
  const delta = (r: typeof tRow, h: Reference, k: "Min" | "Max") => (h[`unitPrice${k}`] - r[`unitPrice${k}`]) * r.quantity;
  assert(
    next.totalEstimateMin === base.totalEstimateMin + delta(tRow, TREADMILL_MID, "Min") + delta(pRow, PILATES_MID, "Min") &&
      next.totalEstimateMax === base.totalEstimateMax + delta(tRow, TREADMILL_MID, "Max") + delta(pRow, PILATES_MID, "Max"),
    "AC2. totals move exactly by the hit rows' range delta",
  );
  assert(
    json(next.assumptions) ===
      json([...base.assumptions, "2 项设备按组织估算价目表（子品类 × 预算档位）估算，仍属估算，非核实单价。"]),
    `AC2. assumptions = baseline + one organization-estimate line (got ${json(next.assumptions)})`,
  );
  out("✓ AC2. hit (商业级跑步机 / mid, 普拉提核心床 / mid): organization unit range, subtotal = quantity × range, totals = Σ and move exactly by the delta, still ESTIMATE without priceFact, estimateBasis snapshot (id / revision / key / tier / trimmed note), remark / name / quantity unchanged, one appended assumption");

  // AC3 — partial coverage incl. a non-slot row, wrong tier, placeholder band, malformed / ambiguous
  const partial = generateBudgetModule.generateBudget(PROJECT, placeholders, { priceBand: "mid", estimatePriceReferences: [LOCKERS_MID] });
  const lockerRow = rowOf(partial, LOCKERS);
  assert(lockerRow.unitPriceMin === 1200 && lockerRow.estimateBasis?.subcategoryKey === "furniture.lockers", "AC3. non-product-slot row (储物柜) calibrated by its reference");
  partial.items.forEach((row, i) => {
    if (row.name !== LOCKERS.subCategory) assert(json(row) === json(base.items[i]), `AC3. ${row.name} untouched by an unrelated reference`);
  });

  const wrongTier = [
    reference({ subcategoryKey: "cardio.commercial_treadmill", budgetTier: "high" }),
    reference({ subcategoryKey: "studio.pilates_reformer", budgetTier: "low" }),
  ];
  assert(same(generateBudgetModule.generateBudget(PROJECT, placeholders, { priceBand: "mid", estimatePriceReferences: wrongTier }), base), "AC3. wrong-tier references never hit (output identical to baseline)");

  const baseBand = legacyBudget.generateBudget(PROJECT, placeholders);
  const bandHigh = generateBudgetModule.generateBudget(PROJECT, placeholders, { estimatePriceReferences: [reference({ subcategoryKey: "cardio.commercial_treadmill", budgetTier: "high" })] });
  assert(rowOf(bandHigh, TREADMILL).estimateBasis?.budgetTier === "high", "AC3. without options.priceBand the placeholder band (treadmill template high) selects the tier");
  assert(same(generateBudgetModule.generateBudget(PROJECT, placeholders, { estimatePriceReferences: [TREADMILL_MID] }), baseBand), "AC3. mid reference does not hit the high-band treadmill placeholder");

  const unusable: Reference[] = [
    { ...TREADMILL_MID, unitPriceMin: 70000 },
    { ...TREADMILL_MID, revision: 0 },
    { ...TREADMILL_MID, sourceNote: " " },
    { ...TREADMILL_MID, id: "" },
    { ...TREADMILL_MID, unitPriceMax: 1.5 },
    { ...TREADMILL_MID, subcategoryKey: "cardio.bike" as Reference["subcategoryKey"] },
  ];
  for (const bad of unusable) {
    assert(same(generateBudgetModule.generateBudget(PROJECT, placeholders, { priceBand: "mid", estimatePriceReferences: [bad] }), base), `AC3. malformed reference ignored (${json(bad)})`);
  }
  const ambiguous = [TREADMILL_MID, { ...TREADMILL_MID, id: "opr-dup", unitPriceMin: 1 }];
  assert(same(generateBudgetModule.generateBudget(PROJECT, placeholders, { priceBand: "mid", estimatePriceReferences: ambiguous }), base), "AC3. ambiguous duplicate references → platform fallback");

  const unregistered: ProductPlaceholder = { ...placeholders[0], id: "ph-x", category: "有氧设备", subCategory: "动感单车" };
  const legacyUnregistered = legacyBudget.generateBudget(PROJECT, [unregistered], { priceBand: "mid" });
  const nextUnregistered = generateBudgetModule.generateBudget(PROJECT, [unregistered], { priceBand: "mid", estimatePriceReferences: [TREADMILL_MID] });
  assert(same(nextUnregistered, legacyUnregistered), "AC3. unregistered subcategory never hits");
  out("✓ AC3. partial coverage: hit rows (incl. non-slot 储物柜) use the organization range, miss rows byte-identical to baseline; wrong tier, placeholder-band mismatch, malformed (min>max / revision 0 / blank note / blank id / decimal / unknown key), ambiguous duplicates and unregistered subcategories → platform generic");
}

// ---------------------------------------------------------------------------
// AC4 / AC10 — VERIFIED always wins; candidate sources keep their semantics
// ---------------------------------------------------------------------------

function checkVerifiedAndSources() {
  const raw = placeholdersFor("office", "力量和有氧均衡配置");
  const allRefs = [
    TREADMILL_MID,
    reference({ subcategoryKey: "cardio.elliptical", budgetTier: "mid", unitPriceMin: 22000, unitPriceMax: 30000 }),
    reference({ subcategoryKey: "strength.multi_station", budgetTier: "mid", unitPriceMin: 15000, unitPriceMax: 28000 }),
  ];

  // VERIFIED: fresh + expired validUntil, across all three candidate sources
  const verified = withSelections(raw, [
    select(TREADMILL, catalogTreadmill, { priceFact: PRICE_FACT }),
    select(ELLIPTICAL, customElliptical, { priceFact: EXPIRED_PRICE_FACT }),
    select(STRENGTH, procurementStrength, { priceFact: PRICE_FACT, quantity: 4 }),
  ]);
  const baseV = legacyBudget.generateBudget(PROJECT, verified, { priceBand: "mid" });
  const nextV = generateBudgetModule.generateBudget(PROJECT, verified, { priceBand: "mid", estimatePriceReferences: allRefs });
  for (const slot of [TREADMILL, ELLIPTICAL, STRENGTH]) {
    const b = rowOf(baseV, slot);
    const n = rowOf(nextV, slot);
    assert(b.priceBasis === "VERIFIED" && json(n) === json(b), `AC4. VERIFIED ${slot.subCategory} identical to baseline despite a matching reference`);
    assert(!("estimateBasis" in n), `AC4. VERIFIED ${slot.subCategory} has no estimateBasis`);
  }
  assert(rowOf(nextV, ELLIPTICAL).unitPriceMin === 39000 && rowOf(nextV, ELLIPTICAL).priceFact?.validUntil === "2025-06-30", "AC4. expired validUntil stays VERIFIED at its price (C.2-B frozen)");
  assert(same(nextV, baseV), "AC4. all-VERIFIED slots → whole Budget identical to baseline (no organization assumption)");

  // priceFact without a resolved product (no brand/model) is not VERIFIED → estimate path, as before
  const orphan: ProductPlaceholder = { ...rowPlaceholder(raw, TREADMILL), priceFact: PRICE_FACT };
  const baseOrphan = legacyBudget.generateBudget(PROJECT, [orphan], { priceBand: "mid" });
  const nextOrphan = generateBudgetModule.generateBudget(PROJECT, [orphan], { priceBand: "mid", estimatePriceReferences: [TREADMILL_MID] });
  assert(baseOrphan.items[0].priceBasis === "ESTIMATE" && nextOrphan.items[0].priceBasis === "ESTIMATE", "AC4. priceFact without brand/model stays non-VERIFIED (baseline semantics)");
  assert(same(generateBudgetModule.generateBudget(PROJECT, [orphan], { priceBand: "mid" }), baseOrphan), "AC4. …and identical to baseline without a reference");
  out("✓ AC4. VERIFIED always wins: reference-catalog / customer-specified / procurement-product rows with a priceFact (incl. expired validUntil) byte-identical to baseline and never carry estimateBasis even with a matching reference; priceFact without brand/model keeps baseline non-VERIFIED semantics");

  // AC10 — ESTIMATE candidate rows: remark / name / quantity / labels unchanged, only the range moves
  const estimates = withSelections(raw, [
    select(TREADMILL, catalogTreadmill, { quantity: 7 }),
    select(ELLIPTICAL, customElliptical),
    select(STRENGTH, procurementStrength, { quantity: 3 }),
  ]);
  const baseE = legacyBudget.generateBudget(PROJECT, estimates, { priceBand: "mid" });
  const nextE = generateBudgetModule.generateBudget(PROJECT, estimates, { priceBand: "mid", estimatePriceReferences: allRefs });
  const labels: Array<[typeof TREADMILL, string, Reference]> = [
    [TREADMILL, `当前配置：${catalogTreadmill.brand} ${catalogTreadmill.model}（参考候选；单价未核实）`, allRefs[0]],
    [ELLIPTICAL, "当前配置：Precor EFX 885（客户指定；单价未核实）", allRefs[1]],
    [STRENGTH, "当前配置：C6A Brand MS-1（采购库产品；单价未核实）", allRefs[2]],
  ];
  for (const [slot, context, hit] of labels) {
    const b = rowOf(baseE, slot);
    const n = rowOf(nextE, slot);
    assert(b.remark === n.remark && n.remark!.endsWith(context), `AC10. ${slot.subCategory} remark unchanged, 当前配置 still last (${n.remark})`);
    assert(n.name === b.name && n.name === slot.subCategory && n.quantity === b.quantity, `AC10. ${slot.subCategory} name (no model) / quantity unchanged`);
    assert(n.priceBasis === "ESTIMATE" && n.unitPriceMin === hit.unitPriceMin && n.estimateBasis?.referenceId === hit.id, `AC10. ${slot.subCategory} organization estimate, still ESTIMATE`);
  }
  assert(rowOf(nextE, TREADMILL).quantity === 7 && rowOf(nextE, STRENGTH).quantity === 3, "AC10. selected quantities preserved");
  out("✓ AC10 (subset). reference-catalog / customer-specified / procurement-product ESTIMATE rows: remark incl. 「当前配置：…（参考候选 / 客户指定 / 采购库产品；单价未核实）」 as last segment, name and selected quantity unchanged; only unit range + estimateBasis change");
}

function rowPlaceholder(placeholders: ProductPlaceholder[], slot: { category: string; subCategory: string }) {
  const p = placeholders.find((x) => x.category === slot.category && x.subCategory === slot.subCategory);
  assert(Boolean(p), `fixture: placeholder ${slot.subCategory}`);
  return p!;
}

// ---------------------------------------------------------------------------
// Slice 2 — API harness
// ---------------------------------------------------------------------------

type ReferenceView = import("../lib/services/organization-price-reference.service").OrganizationPriceReferenceView;
type ApiResult = { status: number; body: Record<string, unknown>; calls: Call[] };

const API_BASE = "http://localhost/api/organization-price-references";

function request(method: string, url: string, body?: unknown, rawBody?: string): NextRequest {
  const init: RequestInit = { method, headers: { "Content-Type": "application/json" } };
  if (rawBody !== undefined) init.body = rawBody;
  else if (body !== undefined) init.body = JSON.stringify(body);
  const req = new Request(url, init) as unknown as NextRequest & { nextUrl: URL };
  Object.defineProperty(req, "nextUrl", { value: new URL(url) });
  return req;
}

async function asUser(org: string, role: string, fn: () => Promise<Response>): Promise<ApiResult> {
  gate.org = org;
  gate.role = role;
  const before = db.calls.length;
  const res = await fn();
  return { status: res.status, body: (await res.json()) as Record<string, unknown>, calls: db.calls.slice(before) };
}

function api(org: string, role: string) {
  return {
    list: () => asUser(org, role, () => referencesRoute.GET(request("GET", API_BASE))),
    put: (body: unknown, rawBody?: string) => asUser(org, role, () => referencesRoute.PUT(request("PUT", API_BASE, body, rawBody))),
    remove: (id: string) =>
      asUser(org, role, () => referenceRoute.DELETE(request("DELETE", `${API_BASE}/${id}`), { params: Promise.resolve({ id }) })),
  };
}

const writesOf = (r: { calls: Call[] }) => r.calls.filter((c) => WRITE_METHODS.has(c.method));
const viewOf = (r: ApiResult) => r.body.reference as ReferenceView;
const listOf = (r: ApiResult) => r.body.references as ReferenceView[];

const CELL = { subcategoryKey: "cardio.commercial_treadmill", budgetTier: "mid", unitPriceMin: 35000, unitPriceMax: 65000, sourceNote: "C6A 区域成交价 r1" };

// ---------------------------------------------------------------------------
// AC5 (service) — revision, no-op, soft deactivation, reactivation
// ---------------------------------------------------------------------------

async function checkRevisionLifecycle() {
  const owner = api(ORG, "OWNER");
  const created = await owner.put(CELL);
  const c = viewOf(created);
  assert(created.status === 201 && c.revision === 1 && c.active === true && writesOf(created).length === 1, `AC5. create → 201, revision 1, active (got ${created.status} ${json(created.body)})`);
  assert(c.subcategoryKey === CELL.subcategoryKey && c.budgetTier === "mid" && c.unitPriceMin === 35000 && c.unitPriceMax === 65000 && c.sourceNote === CELL.sourceNote, "AC5. stored cell values");
  const stored = db.references.get(c.id)!;
  assert(stored.organizationId === ORG && stored.createdBy === gate.user && stored.updatedBy === gate.user, "AC5. owned by the gate organization, createdBy / updatedBy recorded");

  const same = await owner.put(CELL);
  assert(same.status === 200 && writesOf(same).length === 0 && viewOf(same).revision === 1, "AC5. identical PUT → 200, no write, revision 1");
  const padded = await owner.put({ ...CELL, sourceNote: `  ${CELL.sourceNote}  ` });
  assert(padded.status === 200 && writesOf(padded).length === 0 && viewOf(padded).revision === 1, "AC5. sourceNote only differing by surrounding whitespace → no write");

  const changed = await owner.put({ ...CELL, unitPriceMax: 70000 });
  assert(changed.status === 200 && viewOf(changed).revision === 2 && viewOf(changed).unitPriceMax === 70000 && writesOf(changed).length === 1, "AC5. changed range → revision 2 (one optimistic update)");
  const update = writesOf(changed)[0].args as { where: Record<string, unknown> };
  assert(update.where.revision === 1 && update.where.organizationId === ORG && update.where.active === true, "AC5. update is optimistic on revision + active, organization-scoped");
  const noteChanged = await owner.put({ ...CELL, unitPriceMax: 70000, sourceNote: "C6A 区域成交价 r2" });
  assert(viewOf(noteChanged).revision === 3, "AC5. sourceNote change alone → revision + 1");

  const off = await owner.remove(c.id);
  assert(off.status === 200 && viewOf(off).active === false && viewOf(off).revision === 3 && writesOf(off).length === 1, "AC5. deactivate → active false, revision unchanged");
  const offAgain = await owner.remove(c.id);
  assert(offAgain.status === 200 && viewOf(offAgain).active === false && viewOf(offAgain).revision === 3 && writesOf(offAgain).length === 0, "AC5. repeated deactivate idempotent (no write)");
  assert(!listOf(await owner.list()).some((r) => r.id === c.id), "AC5. deactivated cell not listed");

  const restored = await owner.put({ ...CELL, unitPriceMax: 70000, sourceNote: "C6A 区域成交价 r2" });
  assert(restored.status === 200 && viewOf(restored).id === c.id && viewOf(restored).active === true && viewOf(restored).revision === 3, `AC5. restore with identical content → same row, active, revision unchanged (got ${json(restored.body)})`);
  assert((writesOf(restored)[0].args as { where: Record<string, unknown> }).where.active === false, "AC5. reactivation optimistic on the read (inactive) state");

  await owner.remove(c.id);
  const restoredChanged = await owner.put({ ...CELL, unitPriceMin: 36000, unitPriceMax: 70000, sourceNote: "C6A 区域成交价 r2" });
  assert(viewOf(restoredChanged).id === c.id && viewOf(restoredChanged).active === true && viewOf(restoredChanged).revision === 4 && viewOf(restoredChanged).unitPriceMin === 36000, "AC5. deactivate + restore with changed content → revision + 1");
  assert([...db.references.values()].filter((r) => r.organizationId === ORG && r.subcategoryKey === CELL.subcategoryKey && r.budgetTier === "mid").length === 1, "AC5. one row per cell (no duplicate on reactivation)");
  assert(!db.calls.some((call) => call.method === "delete" || call.method === "deleteMany"), "AC5. no physical delete");

  const otherTier = await owner.put({ ...CELL, budgetTier: "high", unitPriceMin: 90000, unitPriceMax: 150000 });
  assert(otherTier.status === 201 && viewOf(otherTier).id !== c.id && viewOf(otherTier).revision === 1, "AC5. another tier of the same subcategory is an independent cell");
  out("✓ AC5 (service). create → r1 active; identical / whitespace-only PUT → no write; range or note change → revision + 1 (optimistic on revision + active); deactivate keeps revision, repeated deactivate no write; restore same content → same row active, revision kept; restore changed content → revision + 1; one row per cell, no physical delete");
  return { treadmillId: c.id };
}

// ---------------------------------------------------------------------------
// AC7 — RBAC + organization isolation
// ---------------------------------------------------------------------------

async function checkRbacAndIsolation(ids: { treadmillId: string }) {
  const admin = await api(ORG, "ADMIN").put({ ...CELL, subcategoryKey: "studio.pilates_reformer", unitPriceMin: 18000, unitPriceMax: 26000, sourceNote: "C6A 普拉提" });
  assert(admin.status === 201 && viewOf(admin).revision === 1, "AC7. ADMIN PUT → 201");
  const lockers = await api(ORG, "admin").put({ ...CELL, subcategoryKey: "furniture.lockers", unitPriceMin: 1200, unitPriceMax: 1800, sourceNote: "C6A 储物柜" });
  assert(lockers.status === 201, "AC7. lower-case admin normalized → write allowed");
  await api(ORG, "OWNER").remove(viewOf(lockers).id);

  const foreign = await api(OTHER_ORG, "OWNER").put({ ...CELL, unitPriceMin: 1000, unitPriceMax: 2000, sourceNote: "foreign" });
  assert(foreign.status === 201 && viewOf(foreign).id !== ids.treadmillId, "AC7. same cell in another organization is a separate row");
  const foreignId = viewOf(foreign).id;

  for (const role of ["MEMBER", "member", "VIEWER", "viewer", "BILLING", ""]) {
    const before = json([...db.references.values()]);
    const put = await api(ORG, role).put({ ...CELL, unitPriceMin: 1 });
    assert(put.status === 403 && put.body.code === "PRICE_REFERENCE_FORBIDDEN" && put.calls.length === 0, `AC7. ${role || "(empty role)"} PUT → 403 PRICE_REFERENCE_FORBIDDEN, zero Prisma calls (got ${put.status} ${json(put.body)})`);
    const del = await api(ORG, role).remove(ids.treadmillId);
    assert(del.status === 403 && del.body.code === "PRICE_REFERENCE_FORBIDDEN" && del.calls.length === 0, `AC7. ${role || "(empty role)"} DELETE → 403, zero Prisma calls`);
    assert(json([...db.references.values()]) === before, `AC7. ${role || "(empty role)"} wrote nothing`);
  }

  for (const role of ["MEMBER", "VIEWER", "OWNER"]) {
    const res = await api(ORG, role).list();
    const rows = listOf(res);
    assert(res.status === 200 && rows.length > 0 && rows.every((r) => r.active === true), `AC7. ${role} GET → 200, active references only`);
    assert(rows.every((r) => db.references.get(r.id)!.organizationId === ORG) && !rows.some((r) => r.id === foreignId), `AC7. ${role} GET sees only its own organization`);
    assert(!rows.some((r) => r.id === viewOf(lockers).id), `AC7. ${role} GET excludes the deactivated cell`);
    assert(res.calls.length === 1 && json((res.calls[0].args as { where: unknown }).where) === json({ organizationId: ORG, active: true }), `AC7. ${role} list query scoped to { organizationId, active: true }`);
    assert(!rows.some((r) => "organizationId" in r), "AC7. view exposes no organizationId");
  }
  assert(json(listOf(await api(OTHER_ORG, "MEMBER").list()).map((r) => r.id)) === json([foreignId]), "AC7. other organization sees only its own cell");

  const crossDelete = await api(ORG, "OWNER").remove(foreignId);
  assert(crossDelete.status === 404 && crossDelete.body.code === "PRICE_REFERENCE_NOT_FOUND" && writesOf(crossDelete).length === 0, `AC7. cross-org DELETE → 404, zero writes (got ${crossDelete.status})`);
  assert(db.references.get(foreignId)!.active === true, "AC7. foreign cell untouched");
  const unknownDelete = await api(ORG, "OWNER").remove("opr-missing");
  assert(unknownDelete.status === 404 && writesOf(unknownDelete).length === 0, "AC7. unknown id DELETE → 404, zero writes");

  const foreignBefore = json(db.references.get(foreignId));
  const escape = await api(ORG, "OWNER").put({ ...CELL, subcategoryKey: "cardio.elliptical", sourceNote: "escape", organizationId: OTHER_ORG });
  assert(escape.status === 201 && db.references.get(viewOf(escape).id)!.organizationId === ORG, "AC7. body organizationId ignored; cell created in the gate organization");
  const escapeUpdate = await api(ORG, "OWNER").put({ ...CELL, unitPriceMin: 36000, unitPriceMax: 70000, sourceNote: "C6A 区域成交价 r2", organizationId: OTHER_ORG });
  assert(escapeUpdate.status === 200 && viewOf(escapeUpdate).id === ids.treadmillId, "AC7. body organizationId cannot redirect an update to another organization's cell");
  assert(json(db.references.get(foreignId)) === foreignBefore, "AC7. foreign cell unchanged by escape attempts");
  assert(
    db.calls
      .filter((call) => call.model === "organizationPriceReference")
      .every((call) => {
        const args = call.args as { where?: Record<string, unknown> & Partial<CompoundWhere>; data?: Record<string, unknown> };
        const whereOrg = args.where?.organizationId_subcategoryKey_budgetTier?.organizationId ?? args.where?.organizationId;
        const dataOrg = args.data?.organizationId;
        return (whereOrg === undefined || whereOrg === ORG || whereOrg === OTHER_ORG) && (dataOrg === undefined || dataOrg === ORG || dataOrg === OTHER_ORG);
      }),
    "AC7. every Prisma call carries an organization scope",
  );
  assert(
    db.calls.filter((call) => call.model === "organizationPriceReference" && call.method !== "create").every((call) => {
      const where = (call.args as { where: Record<string, unknown> & Partial<CompoundWhere> }).where;
      return Boolean(where.organizationId ?? where.organizationId_subcategoryKey_budgetTier?.organizationId);
    }),
    "AC7. no read / update by id without organizationId",
  );
  out("✓ AC7. OWNER / ADMIN (normalized) write; MEMBER / VIEWER / BILLING / unknown PUT + DELETE → 403 PRICE_REFERENCE_FORBIDDEN with zero Prisma calls; MEMBER / VIEWER GET own organization active cells only; cross-org cells invisible, cross-org / unknown DELETE → 404 with zero writes; body organizationId ignored (create and update stay in the gate organization); every query organization-scoped");
}

// ---------------------------------------------------------------------------
// AC8 — validation + conflicts + no internal error leakage
// ---------------------------------------------------------------------------

async function checkValidationAndConflicts(ids: { treadmillId: string }) {
  const owner = api(ORG, "OWNER");
  const invalid: Array<[string, unknown]> = [
    ["unknown key", { ...CELL, subcategoryKey: "cardio.bike" }],
    ["display name key", { ...CELL, subcategoryKey: "商业级跑步机" }],
    ["missing key", { ...CELL, subcategoryKey: undefined }],
    ["invalid tier", { ...CELL, budgetTier: "custom" }],
    ["non-integer", { ...CELL, unitPriceMin: 35000.5 }],
    ["string price", { ...CELL, unitPriceMax: "65000" }],
    ["zero", { ...CELL, unitPriceMin: 0 }],
    ["negative", { ...CELL, unitPriceMin: -5 }],
    ["min > max", { ...CELL, unitPriceMin: 70000 }],
    ["above 10,000,000", { ...CELL, unitPriceMax: 10_000_001 }],
    ["empty sourceNote", { ...CELL, sourceNote: "  " }],
    ["sourceNote 121 chars (中文)", { ...CELL, sourceNote: "价".repeat(121) }],
    ["sourceNote 121 chars (mixed)", { ...CELL, sourceNote: adverseNote(121) }],
    ["sourceNote control char", { ...CELL, sourceNote: "价\u0000格" }],
    ["array body", [CELL]],
    ["null body", null],
  ];
  for (const [label, body] of invalid) {
    const res = await owner.put(body);
    assert(res.status === 400 && res.body.code === "PRICE_REFERENCE_INVALID" && writesOf(res).length === 0, `AC8. ${label} → 400 PRICE_REFERENCE_INVALID, zero writes (got ${res.status} ${json(res.body)})`);
  }
  const malformed = await owner.put(undefined, "{not json");
  assert(malformed.status === 400 && malformed.body.code === "PRICE_REFERENCE_INVALID" && writesOf(malformed).length === 0, "AC8. malformed JSON → 400, zero writes");
  const emptyId = await owner.remove(" ");
  assert(emptyId.status === 400 && emptyId.body.code === "PRICE_REFERENCE_INVALID", "AC8. blank DELETE id → 400");

  const before = structuredClone(db.references.get(ids.treadmillId)!);
  db.beforeUpdateMany = () => {
    const row = db.references.get(ids.treadmillId)!;
    row.revision = Number(row.revision) + 1;
    row.unitPriceMax = 99999;
  };
  const conflict = await owner.put({ ...CELL, unitPriceMin: 30000, unitPriceMax: 60000, sourceNote: "concurrent" });
  assert(conflict.status === 409 && conflict.body.code === "PRICE_REFERENCE_CONFLICT", `AC8. concurrent revision change → 409 PRICE_REFERENCE_CONFLICT (got ${conflict.status} ${json(conflict.body)})`);
  const afterConflict = db.references.get(ids.treadmillId)!;
  assert(afterConflict.unitPriceMin === before.unitPriceMin && afterConflict.unitPriceMax === 99999 && afterConflict.sourceNote === before.sourceNote, "AC8. losing writer changed nothing");

  const current = db.references.get(ids.treadmillId)!;
  await owner.remove(ids.treadmillId);
  db.beforeUpdateMany = () => {
    db.references.get(ids.treadmillId)!.active = true;
  };
  const restoreRace = await owner.put({ subcategoryKey: CELL.subcategoryKey, budgetTier: "mid", unitPriceMin: current.unitPriceMin, unitPriceMax: current.unitPriceMax, sourceNote: current.sourceNote });
  assert(restoreRace.status === 409 && restoreRace.body.code === "PRICE_REFERENCE_CONFLICT", "AC8. concurrent active-state change during reactivation → 409");

  db.hideNextFindUnique = true;
  const raceCreate = await owner.put({ ...CELL, subcategoryKey: "studio.pilates_reformer", unitPriceMin: 19000, unitPriceMax: 27000, sourceNote: "race" });
  assert(raceCreate.status === 409 && raceCreate.body.code === "PRICE_REFERENCE_CONFLICT", `AC8. concurrent create (unique violation) → 409 (got ${raceCreate.status} ${json(raceCreate.body)})`);
  assert(!/Unique constraint|P2002|organizationId/.test(json(raceCreate.body)), "AC8. Prisma error details not exposed");

  db.failNextFindMany = new Error("connect ECONNREFUSED 10.0.0.5:5432 secret-db-host");
  const failed = await api(ORG, "MEMBER").list();
  assert(failed.status === 500 && !/ECONNREFUSED|secret-db-host|5432/.test(json(failed.body)), `AC8. unexpected error → 500 without internal details (got ${json(failed.body)})`);
  out("✓ AC8. invalid key / display-name key / tier / non-integer / string / zero / negative / min>max / >10,000,000 / blank / >120 / control-char note / array / null / malformed JSON → 400 PRICE_REFERENCE_INVALID with zero writes; optimistic revision and active-state races → 409 PRICE_REFERENCE_CONFLICT (loser writes nothing); unique create race → 409; Prisma / DB details never exposed");
}

// ---------------------------------------------------------------------------
// Slice 3 — real calculateBudget integration
// ---------------------------------------------------------------------------

const INT_ORG = "org-c6a-int";
const INT_OTHER = "org-c6a-int-other";
const INT_PROJECT = "proj-c6a-int";
const FOREIGN_PROJECT = "proj-c6a-int-foreign";
const INT_USER = "user-c6a-int";

function seedIntegration() {
  const project = (id: string, organizationId: string): Row => ({
    id,
    name: "C6A Integration",
    clientName: "C6A Corp",
    industry: "enterprise",
    siteType: "office",
    areaM2: 400,
    targetUsers: 200,
    city: "上海市",
    budgetLevel: "mid",
    budgetLabel: "30-80万",
    deliveryMode: "standard",
    notes: null,
    organizationId,
  });
  db.projects.set(INT_PROJECT, project(INT_PROJECT, INT_ORG));
  db.projects.set(FOREIGN_PROJECT, project(FOREIGN_PROJECT, INT_OTHER));
  const quote = (id: string, projectId: string, companyInfo: Record<string, unknown>) =>
    db.quotes.set(id, { id, projectId, companyInfo, content: null, createdAt: nextDate() });
  const company = { companyName: "C6A Corp", targetUsers: 200, areaM2: 400 };
  quote("q-int-default", INT_PROJECT, company);
  quote("q-int-pilates", INT_PROJECT, { ...company, notes: PILATES_NOTES });
  quote("q-int-verified", INT_PROJECT, {
    ...company,
    productSelections: [select(TREADMILL, catalogTreadmill, { quantity: 6, priceFact: PRICE_FACT })],
  });
  quote("q-int-foreign", FOREIGN_PROJECT, company);
}

type Calculated = {
  result: Awaited<ReturnType<typeof budgetService.calculateBudget>>;
  stored: Row & { items: BudgetRecord["items"]; assumptions: string[]; totalEstimateMin: number; totalEstimateMax: number };
  calls: Call[];
  generateOptions: unknown[];
};

async function calculate(
  quoteId: string,
  tier: PriceBand,
  org: string | null = INT_ORG,
  service: typeof budgetService = budgetService,
): Promise<Calculated> {
  const before = db.calls.length;
  const generated = generateBudgetCalls.length;
  const result = await service.calculateBudget({
    quoteId,
    budgetTier: tier,
    ...(org ? { organizationId: org, projectId: String(db.quotes.get(quoteId)!.projectId) } : {}),
  });
  return {
    result,
    stored: structuredClone(db.budgets.find((b) => b.id === result.budget.id)) as Calculated["stored"],
    calls: db.calls.slice(before),
    generateOptions: generateBudgetCalls.slice(generated).map((c) => c.options),
  };
}

const referenceReads = (c: { calls: Call[] }) => c.calls.filter((call) => call.model === "organizationPriceReference");
/** Persisted Budget row without its generated id / createdAt. */
const persisted = (c: Calculated) => json({ ...c.stored, id: null, createdAt: null });
const response = (c: Calculated) => json({ structure: c.result.engine.structure, basis: c.result.basis, quoteContent: c.result.quoteContent });

function itemOf(c: Calculated, slot: { subCategory: string }) {
  return rowOf(c.stored as unknown as BudgetRecord, slot);
}

async function setReference(organizationId: string, body: Record<string, unknown>) {
  return (await referenceService.setOrganizationPriceReference({ organizationId, userId: INT_USER, body })).reference;
}

const ORG_ASSUMPTION = /^\d+ 项设备按组织估算价目表（子品类 × 预算档位）估算，仍属估算，非核实单价。$/;

function checkReadQuery(c: Calculated, label: string) {
  const reads = referenceReads(c);
  assert(reads.length === 1 && reads[0].method === "findMany", `${label}: exactly one organizationPriceReference.findMany`);
  assert(json((reads[0].args as { where: unknown }).where) === json({ organizationId: INT_ORG, active: true }), `${label}: query scoped to { organizationId: project organization, active: true }`);
  const order = c.calls.map((call) => `${call.model}.${call.method}`);
  assert(json(order) === json(["quote.findUnique", "organizationPriceReference.findMany", "budget.create"]), `${label}: quote → tenant check → reference read → budget.create (got ${json(order)})`);
}

async function checkEmptyAndLegacy() {
  let cases = 0;
  for (const quoteId of ["q-int-default", "q-int-pilates", "q-int-verified"]) {
    for (const tier of TIERS) {
      const current = await calculate(quoteId, tier);
      const baseline = await calculate(quoteId, tier, INT_ORG, legacyBudgetService);
      checkReadQuery(current, `AC-EMPTY ${quoteId} / ${tier}`);
      assert(referenceReads(baseline).length === 0, "AC-EMPTY: baseline service never reads references");
      assert(json(current.generateOptions) === json([{ priceBand: tier, estimatePriceReferences: [] }]), `AC-EMPTY ${quoteId} / ${tier}: generateBudget receives [] (got ${json(current.generateOptions)})`);
      assert(persisted(current) === persisted(baseline), `AC-EMPTY ${quoteId} / ${tier}: persisted Budget byte-identical to baseline`);
      assert(response(current) === response(baseline), `AC-EMPTY ${quoteId} / ${tier}: response structure / basis byte-identical to baseline`);
      assert(!current.stored.items.some((i) => "estimateBasis" in i) && !current.stored.assumptions.some((a) => ORG_ASSUMPTION.test(a)), `AC-EMPTY ${quoteId} / ${tier}: no estimateBasis, no organization assumption`);

      const legacy = await calculate(quoteId, tier, null);
      const legacyBaseline = await calculate(quoteId, tier, null, legacyBudgetService);
      assert(referenceReads(legacy).length === 0, `no-org ${quoteId} / ${tier}: no organization reference read (got ${json(legacy.calls)})`);
      assert(json(legacy.generateOptions) === json([{ priceBand: tier }]), `no-org ${quoteId} / ${tier}: generateBudget called exactly as baseline (no references option)`);
      assert(persisted(legacy) === persisted(legacyBaseline) && response(legacy) === response(legacyBaseline), `no-org ${quoteId} / ${tier}: byte-identical to baseline`);
      cases += 1;
    }
  }
  out(`✓ AC-EMPTY. organization with no active references (${cases} quote × tier cases incl. pilates focus and a VERIFIED selection): one scoped read, generateBudget receives [], persisted Budget + response + assumptions byte-identical to the baseline budget.service; no-org legacy calls read nothing, call generateBudget exactly as baseline and stay byte-identical`);
}

async function checkIntegrationLifecycle() {
  const r1 = await setReference(INT_ORG, { subcategoryKey: "cardio.commercial_treadmill", budgetTier: "mid", unitPriceMin: 35000, unitPriceMax: 65000, sourceNote: "C6A 区域成交价 r1" });
  const high = await setReference(INT_ORG, { subcategoryKey: "cardio.commercial_treadmill", budgetTier: "high", unitPriceMin: 90000, unitPriceMax: 150000, sourceNote: "C6A 高档" });
  const ellipticalLow = await setReference(INT_ORG, { subcategoryKey: "cardio.elliptical", budgetTier: "low", unitPriceMin: 5000, unitPriceMax: 8000, sourceNote: "C6A 椭圆机低档" });
  const foreign = [
    await setReference(INT_OTHER, { subcategoryKey: "cardio.commercial_treadmill", budgetTier: "mid", unitPriceMin: 1000, unitPriceMax: 2000, sourceNote: "foreign" }),
    await setReference(INT_OTHER, { subcategoryKey: "cardio.elliptical", budgetTier: "mid", unitPriceMin: 1111, unitPriceMax: 2222, sourceNote: "foreign" }),
  ];
  const foreignIds = new Set(foreign.map((r) => r.id));
  const noForeign = (c: Calculated) =>
    !c.stored.items.some((i) => i.estimateBasis && foreignIds.has(i.estimateBasis.referenceId)) &&
    !json(c.generateOptions).includes(foreign[0].id) &&
    !json(c.generateOptions).includes(foreign[1].id);

  // Case A — r1 hit.
  const budgetA = await calculate("q-int-default", "mid");
  const baseMid = await calculate("q-int-default", "mid", INT_ORG, legacyBudgetService);
  checkReadQuery(budgetA, "AC5-INTEGRATION A");
  const passed = (budgetA.generateOptions[0] as { estimatePriceReferences: Reference[] }).estimatePriceReferences;
  assert(
    json(passed) ===
      json([r1, high, ellipticalLow].sort((a, b) => a.subcategoryKey.localeCompare(b.subcategoryKey) || a.budgetTier.localeCompare(b.budgetTier)).map((r) => ({
        id: r.id, subcategoryKey: r.subcategoryKey, budgetTier: r.budgetTier, unitPriceMin: r.unitPriceMin, unitPriceMax: r.unitPriceMax, sourceNote: r.sourceNote, revision: r.revision,
      }))),
    `AC5-INTEGRATION A: generateBudget receives the organization's active references as the 7-field contract (got ${json(passed)})`,
  );
  const baseTreadmill = itemOf(baseMid, TREADMILL);
  const treadmillA = itemOf(budgetA, TREADMILL);
  const q = baseTreadmill.quantity;
  const basisR1 = { source: "organization-price-reference", referenceId: r1.id, revision: 1, subcategoryKey: "cardio.commercial_treadmill", budgetTier: "mid", sourceNote: "C6A 区域成交价 r1" };
  assert(
    json(treadmillA) === json({ ...baseTreadmill, unitPriceMin: 35000, unitPriceMax: 65000, subtotalMin: q * 35000, subtotalMax: q * 65000, estimateBasis: basisR1 }),
    `AC5-INTEGRATION A: persisted treadmill row = baseline row with r1 range, quantity × range subtotal and estimateBasis r1 (got ${json(treadmillA)})`,
  );
  assert(treadmillA.priceBasis !== "VERIFIED" && !treadmillA.priceFact, "AC5-INTEGRATION A: still ESTIMATE");
  const otherRows = (c: Calculated) => c.stored.items.filter((i) => i !== rowOf(c.stored as unknown as BudgetRecord, TREADMILL));
  assert(json(otherRows(budgetA)) === json(otherRows(baseMid)), "AC5-INTEGRATION A: every other row byte-identical to baseline");
  assert(
    budgetA.stored.totalEstimateMin === baseMid.stored.totalEstimateMin + q * (35000 - baseTreadmill.unitPriceMin) &&
      budgetA.stored.totalEstimateMax === baseMid.stored.totalEstimateMax + q * (65000 - baseTreadmill.unitPriceMax) &&
      budgetA.stored.totalEstimateMin === Math.round(budgetA.stored.items.reduce((s, i) => s + i.subtotalMin, 0)) &&
      budgetA.stored.totalEstimateMax === Math.round(budgetA.stored.items.reduce((s, i) => s + i.subtotalMax, 0)),
    "AC5-INTEGRATION A: persisted totals = Σ subtotals and move exactly by the r1 delta",
  );
  const structureA = budgetA.result.engine.structure;
  assert(structureA.totalEstimateMin === budgetA.stored.totalEstimateMin && json(structureA.detailedItems) === json(budgetA.stored.items), "AC5-INTEGRATION A: response structure matches the persisted row");
  assert(
    budgetA.stored.assumptions.filter((a) => ORG_ASSUMPTION.test(a)).length === 1 &&
      json(budgetA.stored.assumptions.filter((a) => !ORG_ASSUMPTION.test(a))) === json(baseMid.stored.assumptions),
    "AC5-INTEGRATION A: one organization assumption appended, all other assumptions unchanged",
  );
  assert(noForeign(budgetA), "AC5-INTEGRATION E: other organization's matching references never reach the Budget");

  // Case D — other tiers are not misused.
  assert(!itemOf(budgetA, ELLIPTICAL).estimateBasis, "AC5-INTEGRATION D: elliptical low reference not used at mid");
  const budgetHigh = await calculate("q-int-default", "high");
  const baseHigh = await calculate("q-int-default", "high", INT_ORG, legacyBudgetService);
  assert(itemOf(budgetHigh, TREADMILL).estimateBasis?.referenceId === high.id && itemOf(budgetHigh, TREADMILL).unitPriceMin === 90000, "AC5-INTEGRATION D: high Budget uses the high reference");
  assert(json(itemOf(budgetHigh, ELLIPTICAL)) === json(itemOf(baseHigh, ELLIPTICAL)), "AC5-INTEGRATION D: elliptical (low reference only) stays platform at high");
  const budgetLow = await calculate("q-int-default", "low");
  const baseLow = await calculate("q-int-default", "low", INT_ORG, legacyBudgetService);
  assert(json(itemOf(budgetLow, TREADMILL)) === json(itemOf(baseLow, TREADMILL)), "AC5-INTEGRATION D: treadmill (mid / high references only) stays platform at low");
  assert(itemOf(budgetLow, ELLIPTICAL).estimateBasis?.referenceId === ellipticalLow.id && itemOf(budgetLow, ELLIPTICAL).unitPriceMax === 8000, "AC5-INTEGRATION D: low Budget uses the elliptical low reference");
  assert(noForeign(budgetHigh) && noForeign(budgetLow), "AC5-INTEGRATION E: foreign references absent at every tier");

  // AC-C1 baseline for Budget A (persisted items only).
  const slots = pi.buildCandidateSlots(
    templates.buildPlaceholders(INT_PROJECT, projectInput("office"), { quantityModel: templates.resolveQuoteQuantityModel(null) }),
  );
  const c1For = (row: Row) => {
    const callsBefore = db.calls.length;
    const reduction = adjustment.buildQuantityReductionOptions({
      items: row.items as BudgetRecord["items"],
      slotKeys: structureA.detailedItemSlotKeys,
      slots,
    });
    const treadmillOption = reduction.options.find((o) => o.slotKey === pi.productSlotKey(TREADMILL.category, TREADMILL.subCategory));
    const approved = treadmillOption ? { [treadmillOption.slotKey]: treadmillOption.minQuantity } : {};
    const result = json({
      reduction,
      adjusted: adjustment.estimateAdjustedTotals({
        totalEstimateMin: Number(row.totalEstimateMin),
        totalEstimateMax: Number(row.totalEstimateMax),
        options: reduction.options,
        approved,
      }),
    });
    assert(db.calls.length === callsBefore, "AC-C1: C.1 options make no Prisma call (no reference query)");
    return result;
  };
  const readA = async () => (await budgetModel.findUnique({ where: { id: budgetA.result.budget.id } } as never)) as Row;
  const snapshotA = json(await readA());
  const c1A = c1For(await readA());
  const c1Treadmill = (JSON.parse(c1A) as { reduction: { options: Array<{ slotKey: string; unitPriceMin: number; unitPriceMax: number }> } }).reduction.options.find(
    (o) => o.slotKey === pi.productSlotKey(TREADMILL.category, TREADMILL.subCategory),
  );
  assert(c1Treadmill?.unitPriceMin === 35000 && c1Treadmill.unitPriceMax === 65000, `AC-C1: Budget A options use A's persisted r1 unit range (got ${json(c1Treadmill)})`);

  // Case B — r2 leaves Budget A untouched; Budget B uses r2.
  const r2 = await setReference(INT_ORG, { subcategoryKey: "cardio.commercial_treadmill", budgetTier: "mid", unitPriceMin: 35000, unitPriceMax: 70000, sourceNote: "C6A 区域成交价 r2" });
  assert(r2.id === r1.id && r2.revision === 2, "fixture: same cell updated to revision 2");
  assert(json(await readA()) === snapshotA, "AC-HISTORY: Budget A row (items / totals / estimateBasis / assumptions) unchanged after r2");
  const c1AfterR2 = c1For(await readA());
  assert(c1AfterR2 === c1A, "AC-C1: Budget A reduction options and adjusted totals identical after r2");

  const budgetB = await calculate("q-int-default", "mid");
  checkReadQuery(budgetB, "AC5-INTEGRATION B");
  const treadmillB = itemOf(budgetB, TREADMILL);
  assert(
    json(treadmillB) === json({ ...baseTreadmill, unitPriceMin: 35000, unitPriceMax: 70000, subtotalMin: q * 35000, subtotalMax: q * 70000, estimateBasis: { ...basisR1, revision: 2, sourceNote: "C6A 区域成交价 r2" } }),
    `AC5-INTEGRATION B: Budget B uses r2 (got ${json(treadmillB)})`,
  );
  assert(budgetB.stored.totalEstimateMax === budgetA.stored.totalEstimateMax + q * 5000, "AC5-INTEGRATION B: Budget B totals reflect r2");
  assert(json(await readA()) === snapshotA, "AC-HISTORY: Budget A unchanged after Budget B");

  // Case C — deactivated reference falls back to platform.
  await referenceService.deactivateOrganizationPriceReference({ organizationId: INT_ORG, userId: INT_USER, id: r1.id });
  const budgetC = await calculate("q-int-default", "mid");
  checkReadQuery(budgetC, "AC5-INTEGRATION C");
  assert(json(itemOf(budgetC, TREADMILL)) === json(baseTreadmill) && !budgetC.stored.items.some((i) => i.estimateBasis), "AC5-INTEGRATION C: deactivated cell → platform generic estimate, no estimateBasis");
  assert(persisted(budgetC) === persisted(baseMid) && response(budgetC) === response(baseMid), "AC5-INTEGRATION C: Budget C byte-identical to baseline (other tier / foreign references unused)");
  assert(json(await readA()) === snapshotA, "AC-HISTORY: Budget A unchanged after deactivation");
  const budgetBRow = db.budgets.find((b) => b.id === budgetB.result.budget.id)!;
  assert(json({ ...budgetBRow }) === json(budgetB.stored), "AC-HISTORY: Budget B unchanged after deactivation");

  // VERIFIED still wins inside the real chain.
  await setReference(INT_ORG, { subcategoryKey: "cardio.commercial_treadmill", budgetTier: "mid", unitPriceMin: 35000, unitPriceMax: 70000, sourceNote: "C6A 区域成交价 r2" });
  const verified = await calculate("q-int-verified", "mid");
  const baseVerified = await calculate("q-int-verified", "mid", INT_ORG, legacyBudgetService);
  assert(itemOf(verified, TREADMILL).priceBasis === "VERIFIED" && json(itemOf(verified, TREADMILL)) === json(itemOf(baseVerified, TREADMILL)), "AC5-INTEGRATION: VERIFIED selection beats the active organization reference (row byte-identical to baseline)");

  assert(
    db.calls.filter((call) => call.model === "budget").every((call) => call.method === "create"),
    "AC-HISTORY: calculateBudget only ever creates Budgets (no read-back, update, upsert or delete)",
  );
  const writers = (() => {
    try {
      return execSync('git grep -n -E "budget\\.(update|updateMany|upsert|delete|deleteMany)\\(" -- lib app', { cwd: ROOT, encoding: "utf8" }).trim();
    } catch {
      return "";
    }
  })();
  assert(writers === "", `AC-HISTORY: no Budget update / delete path in lib or app (got ${writers})`);
  out("✓ AC5-INTEGRATION. A: real calculateBudget reads { organizationId, active: true } once after the tenant check, passes the 7-field references to generateBudget, persists the r1 range + estimateBasis r1, totals = Σ and move by the delta, one assumption appended. B: r2 → new Budget B uses r2. C: deactivated → platform generic, byte-identical to baseline. D: other-tier references never used (high / low each use only their own tier). E: other organization's matching references never reach the Budget. VERIFIED selection still beats the organization reference");
  out("✓ AC-HISTORY. Budget A row (items, totals, estimateBasis r1, assumptions) unchanged after r2, Budget B and deactivation; Budgets are only created; no Budget update / delete path exists in lib / app");
  out("✓ AC-C1. reduction options + adjusted totals for Budget A come from its persisted r1 unit range and are identical after r2; only the persisted Budget is read (no reference query)");
}

async function checkReadFailure() {
  const budgetsBefore = db.budgets.length;
  const generatedBefore = generateBudgetCalls.length;
  const callsBefore = db.calls.length;
  db.failNextFindMany = new Error("organization price reference read failed");
  let rejected: unknown = null;
  try {
    await budgetService.calculateBudget({ quoteId: "q-int-default", organizationId: INT_ORG, projectId: INT_PROJECT, budgetTier: "mid" });
  } catch (err) {
    rejected = err;
  }
  assert(rejected instanceof Error && rejected.message === "organization price reference read failed", `AC-READ-FAILURE: calculateBudget rejects with the read error (got ${String(rejected)})`);
  assert(generateBudgetCalls.length === generatedBefore, "AC-READ-FAILURE: generateBudget never called (no [] fallback)");
  assert(db.budgets.length === budgetsBefore && !db.calls.slice(callsBefore).some((call) => WRITE_METHODS.has(call.method)), "AC-READ-FAILURE: no Budget persisted, zero writes");
  assert(json(db.calls.slice(callsBefore).map((call) => `${call.model}.${call.method}`)) === json(["quote.findUnique", "organizationPriceReference.findMany"]), "AC-READ-FAILURE: stops right after the failed read");

  const src = fs.readFileSync(path.join(ROOT, BUDGET_SERVICE), "utf8");
  const body = src.slice(src.indexOf("export async function calculateBudget("));
  const read = body.indexOf("await readEstimatePriceReferences(input.organizationId)");
  assert(read > body.indexOf("assertResourceBelongsToTenant(") && read < body.indexOf("generateBudget("), "AC-READ-FAILURE: read happens after the tenant check and before generateBudget");
  assert(!/\btry\s*\{|\.catch\(|catch\s*\(/.test(src), "AC-READ-FAILURE: budget.service has no try / catch that could swallow the read error");
  out("✓ AC-READ-FAILURE. reference read failure → calculateBudget rejects with that error; generateBudget never called, no Budget persisted, zero writes; no try / catch in budget.service");
}

// ---------------------------------------------------------------------------
// SEC — /api/budget/calculate never returns an internal error message
// ---------------------------------------------------------------------------

const CALCULATE_ROUTE = "app/api/budget/calculate/route.ts";
const CALCULATE_URL = "http://localhost/api/budget/calculate";
const CALCULATE_FAILED_MESSAGE = "预算计算失败，请稍后重试";

type CalculateResult = { status: number; text: string; body: Record<string, unknown>; retryAfter: string | null; logs: unknown[][] };

async function checkCalculateRouteSecurity() {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { SaasAuthError } = require("../lib/auth/session.service") as typeof import("../lib/auth/session.service");
  const { FeatureGateError } = require("../lib/feature-flags/feature-gate") as typeof import("../lib/feature-flags/feature-gate");
  const { TenantIsolationError } = require("../lib/tenancy/tenant.guard") as typeof import("../lib/tenancy/tenant.guard");
  const { RateLimitError } = require("../lib/security/rate-limit") as typeof import("../lib/security/rate-limit");
  /* eslint-enable @typescript-eslint/no-require-imports */

  const calcGate = { org: INT_ORG, error: null as unknown };
  const realApiGate = loadWorkingModule<typeof import("../lib/saas/api-gate")>("lib/saas/api-gate.ts");
  const apiGate = {
    runSaasApiGate: async () => {
      if (calcGate.error) throw calcGate.error;
      return {
        organizationId: calcGate.org,
        userId: INT_USER,
        email: `${INT_USER}@example.test`,
        role: "OWNER",
        membership: {},
        feature: { allowed: true, plan: "PRO" },
        traceId: "trace-c6a-calc",
        plan: "PRO",
      };
    },
    saasGateErrorResponse: realApiGate.saasGateErrorResponse,
    trackFeatureUsage: async () => undefined,
  };
  const growthHelper = loadWorkingModule("lib/growth/growth.api-helper.ts", {
    "@/lib/saas/api-gate": apiGate,
    "./growth.service": {
      recordFeatureGateBlocked: async () => ({ showPaywall: true, reason: "plan", currentPlan: "BASIC", recommendedPlan: "PRO", trigger: "feature", usage: null }),
    },
  });
  const overrides = {
    "@/lib/saas/api-gate": apiGate,
    "@/lib/growth/growth.api-helper": growthHelper,
    "@/lib/growth/analytics.events": { trackBudgetCalculated: () => undefined },
    "@/lib/crm/crm.product-bridge": { recordBudgetAsOpportunity: async () => null },
    "@/lib/sales/sales.product-bridge": { onBudgetCalculated: async () => undefined },
    "@/lib/services/budget.service": budgetService,
  };
  type CalculateRoute = typeof import("../app/api/budget/calculate/route");
  const currentRoute = loadWorkingModule<CalculateRoute>(CALCULATE_ROUTE, overrides);
  const baselineRoute = loadBaselineModule<CalculateRoute>(CALCULATE_ROUTE, overrides);

  const call = async (route: CalculateRoute, body: unknown, setup: { org?: string; gateError?: unknown; readError?: Error } = {}): Promise<CalculateResult> => {
    calcGate.org = setup.org ?? INT_ORG;
    calcGate.error = setup.gateError ?? null;
    db.failNextFindMany = setup.readError ?? null;
    const logs: unknown[][] = [];
    const silent = console.error;
    console.error = (...args: unknown[]) => void logs.push(args);
    try {
      const res = await route.POST(request("POST", CALCULATE_URL, body));
      const text = await res.text();
      return { status: res.status, text, body: JSON.parse(text) as Record<string, unknown>, retryAfter: res.headers.get("retry-after"), logs };
    } finally {
      console.error = silent;
      calcGate.error = null;
      db.failNextFindMany = null;
    }
  };
  const publicOf = (r: CalculateResult) => json({ status: r.status, text: r.text, retryAfter: r.retryAfter });
  const validBody = { quoteId: "q-int-default", projectId: INT_PROJECT, budgetTier: "mid" };

  // SEC-1 — organization price reference read failure.
  const secret = "P2021 table organization_price_reference missing DATABASE_URL=SECRET";
  const budgetsBefore = db.budgets.length;
  const generatedBefore = generateBudgetCalls.length;
  const callsBefore = db.calls.length;
  const readError = new Error(secret);
  const sec = await call(currentRoute, validBody, { readError });
  assert(sec.status === 500, `SEC-1: HTTP 500 (got ${sec.status})`);
  for (const token of ["P2021", "organization_price_reference", "DATABASE_URL", "SECRET", secret, readError.stack!.split("\n")[1].trim(), "    at "]) {
    assert(!sec.text.includes(token), `SEC-1: response never contains ${json(token)}`);
  }
  assert(json(Object.keys(sec.body).sort()) === json(["message", "ok", "traceId"]) && sec.body.ok === false && sec.body.message === CALCULATE_FAILED_MESSAGE && sec.body.traceId === "trace-c6a-calc", `SEC-1: only the fixed safe message (got ${sec.text})`);
  assert(sec.logs.length === 1 && sec.logs[0][0] === "[budget/calculate]" && sec.logs[0][1] === readError, "SEC-1: the existing server-side log still receives the original error");
  assert(generateBudgetCalls.length === generatedBefore, "SEC-1: generateBudget never called (no platform fallback)");
  assert(db.budgets.length === budgetsBefore && !db.calls.slice(callsBefore).some((c) => WRITE_METHODS.has(c.method)), "SEC-1: no Budget persisted, zero writes");
  assert(json(db.calls.slice(callsBefore).map((c) => `${c.model}.${c.method}`)) === json(["quote.findUnique", "organizationPriceReference.findMany"]), "SEC-1: calculation stops at the failed reference read");
  const leaked = await call(baselineRoute, validBody, { readError: new Error(secret) });
  assert(leaked.status === 500 && leaked.text.includes("DATABASE_URL=SECRET"), "SEC-1 oracle: the baseline route returned the raw error message");

  // Other unexpected errors: fixed message, never the raw text.
  const nonError = await call(currentRoute, validBody, { gateError: "raw string failure DATABASE_URL=SECRET" });
  assert(nonError.status === 500 && nonError.body.message === CALCULATE_FAILED_MESSAGE && !nonError.text.includes("SECRET"), "SEC: non-Error throw → 500 fixed message");
  const missingQuote = await call(currentRoute, { ...validBody, quoteId: "q-c6a-missing" });
  assert(missingQuote.status === 500 && missingQuote.body.message === CALCULATE_FAILED_MESSAGE, `SEC: untyped service error (Quote not found) → 500 fixed message (got ${missingQuote.text})`);

  // Non-500 / typed errors — every real branch answers exactly like the baseline route.
  const same = async (label: string, body: unknown, setup: Parameters<typeof call>[2], expectedStatus: number) => {
    const before = db.budgets.length;
    const current = await call(currentRoute, body, setup);
    const baseline = await call(baselineRoute, body, setup);
    assert(current.status === expectedStatus, `NON-500 ${label}: status ${expectedStatus} (got ${current.status} ${current.text})`);
    assert(publicOf(current) === publicOf(baseline), `NON-500 ${label}: status + body + headers identical to baseline (got ${current.text} vs ${baseline.text})`);
    assert(db.budgets.length === before, `NON-500 ${label}: no Budget persisted`);
    return current;
  };
  const unauth = await same("unauthenticated", validBody, { gateError: new SaasAuthError() }, 401);
  assert(unauth.body.code === "AUTH_REQUIRED", "NON-500 unauthenticated: AUTH_REQUIRED");
  const entitlement = await same("entitlement", validBody, { gateError: new FeatureGateError("Feature canGenerateBudget requires PRO") }, 403);
  assert(entitlement.body.code === "FEATURE_GATE_DENIED", "NON-500 entitlement: FEATURE_GATE_DENIED");
  await same("RBAC", validBody, { gateError: new FeatureGateError("Role does not permit: use_product") }, 403);
  const invalid = await same("invalid request (missing quoteId)", { projectId: INT_PROJECT }, {}, 400);
  assert(invalid.body.message === "缺少 quoteId", "NON-500 invalid request: 缺少 quoteId");
  const mismatch = await same("Quote / project mismatch", { ...validBody, projectId: "proj-c6a-sec-other" }, {}, 409);
  assert(mismatch.body.code === "QUOTE_PROJECT_MISMATCH", "NON-500 mismatch: QUOTE_PROJECT_MISMATCH");
  const readsBefore = db.calls.filter((c) => c.model === "organizationPriceReference").length;
  const crossTenant = await same("tenant isolation (cross-tenant Quote)", validBody, { org: INT_OTHER }, 500);
  assert(crossTenant.body.message === "Cross-tenant resource access denied", "NON-500 tenant isolation: existing public message kept");
  assert(db.calls.filter((c) => c.model === "organizationPriceReference").length === readsBefore, "NON-500 tenant isolation: no reference read");
  await same("tenant isolation (gate)", validBody, { gateError: new TenantIsolationError("Organization context mismatch with membership") }, 500);
  await same("rate limit", validBody, { gateError: new RateLimitError("Rate limit exceeded", 30) }, 500);

  const ok = await call(currentRoute, validBody);
  const okBaseline = await call(baselineRoute, validBody);
  assert(ok.status === 200 && ok.body.ok === true && typeof ok.body.budgetId === "string", "success: 200 with budgetId");
  assert(json(Object.keys(ok.body).sort()) === json(Object.keys(okBaseline.body).sort()) && okBaseline.status === 200, "success: response shape identical to baseline");

  const removed = execSync(`git diff ${BASELINE} -- ${CALCULATE_ROUTE}`, { cwd: ROOT, encoding: "utf8" })
    .split(/\r?\n/)
    .filter((l) => /^[-+](?![-+])/.test(l));
  assert(
    json(removed.filter((l) => l.startsWith("-"))) === json(['-      { ok: false, message: err instanceof Error ? err.message : "预算计算失败", traceId },']) &&
      removed.filter((l) => l.startsWith("+")).length <= 7,
    `SEC: calculate route diff is only the 500 message line (+ known-error import) (got ${json(removed)})`,
  );
  out("✓ SEC-1. /api/budget/calculate: organization price reference read throws a Prisma-like error with DATABASE_URL → HTTP 500 with only the fixed 「预算计算失败，请稍后重试」 (no P2021 / table / DATABASE_URL / SECRET / raw message / stack), the original error still reaches the existing server-side log; calculation fails before generateBudget, no Budget, zero writes, no platform fallback; the baseline route leaked the message");
  out("✓ NON-500. unauthenticated 401 / entitlement + RBAC 403 / missing quoteId 400 / Quote-project mismatch 409 / tenant isolation (Quote + gate) and rate limit (existing 500 + their fixed public message) answer byte-identically to the baseline route; untyped / non-Error failures → fixed message; success shape unchanged; route diff limited to the 500 message");
}

async function checkOrganizationSource() {
  const callsBefore = db.calls.length;
  const generatedBefore = generateBudgetCalls.length;
  let rejected: unknown = null;
  try {
    await budgetService.calculateBudget({ quoteId: "q-int-foreign", organizationId: INT_ORG, budgetTier: "mid" });
  } catch (err) {
    rejected = err;
  }
  assert(rejected instanceof Error && rejected.name === "TenantIsolationError", `AC-ORG-SOURCE: Quote of another organization → TenantIsolationError (got ${String(rejected)})`);
  const after = db.calls.slice(callsBefore);
  assert(json(after.map((call) => `${call.model}.${call.method}`)) === json(["quote.findUnique"]) && generateBudgetCalls.length === generatedBefore, "AC-ORG-SOURCE: cross-tenant request reads no references and generates nothing");

  const reads = db.calls.filter((call) => call.model === "organizationPriceReference" && call.method === "findMany" && (call.args as { where: { organizationId: string } }).where.organizationId.startsWith("org-c6a-int"));
  assert(reads.length > 0 && reads.every((call) => (call.args as { where: { organizationId: string } }).where.organizationId === INT_ORG), "AC-ORG-SOURCE: every Budget reference read used the Quote project's organization");

  const route = fs.readFileSync(path.join(ROOT, "app/api/budget/calculate/route.ts"), "utf8");
  assert(/const gate = await runSaasApiGate\(req, "canGenerateBudget", body\);/.test(route) && /calculateBudget\(\{[\s\S]*?organizationId: gate\.organizationId,[\s\S]*?\}\);/.test(route), "AC-ORG-SOURCE: the only route passes gate.organizationId to calculateBudget");
  assert(!/body\??\.organizationId/.test(route), "AC-ORG-SOURCE: route never reads body.organizationId itself");
  const auth = fs.readFileSync(path.join(ROOT, "lib/auth/auth.service.ts"), "utf8");
  assert(/const user = await getSessionUser\(\);/.test(auth) && /const membership = await getMembership\(user\.id, organizationId\);\s*if \(!membership\) \{\s*throw new SaasAuthError\("Not a member of this organization"\);/.test(auth), "AC-ORG-SOURCE: gate organization requires a session user with membership in it");
  const callers = execSync('git grep -l -E "\\bcalculateBudget\\(" -- lib app', { cwd: ROOT, encoding: "utf8" }).split(/\r?\n/).filter(Boolean).sort();
  assert(json(callers) === json(["app/api/budget/calculate/route.ts", "lib/services/budget.service.ts"]), `AC-ORG-SOURCE: calculateBudget has a single production caller (got ${json(callers)})`);

  const src = fs.readFileSync(path.join(ROOT, BUDGET_SERVICE), "utf8");
  assert(!/matchEstimatePriceReference|validateEstimatePriceReferenceInput|resolveEstimateSubcategoryKey|ESTIMATE_SUBCATEGORIES|getUnitPriceRange|estimateBasisFromReference|priceBasis|prisma\.organizationPriceReference/.test(src), "budget.service re-implements no mapping / validation / price resolution / VERIFIED logic and has no direct reference query");
  const removed = execSync(`git diff -U0 ${BASELINE} -- ${BUDGET_SERVICE}`, { cwd: ROOT, encoding: "utf8" }).split(/\r?\n/).filter((l) => l.startsWith("-") && !l.startsWith("---"));
  assert(removed.length === 0, `budget.service change is purely additive (removed ${json(removed)})`);
  out("✓ AC-ORG-SOURCE. organization = gate.organizationId from the authenticated session + membership check (header / body only select a tenant the user must belong to), then asserted equal to the Quote project's organization before any reference read; cross-tenant Quote → TenantIsolationError with no reference read; single production caller; budget.service change additive, delegates all mapping / validation / pricing");
}

// ---------------------------------------------------------------------------
// Slice 4 — Budget PDF (persisted snapshot renderer)
// ---------------------------------------------------------------------------

type Drawn = { page: number; text: string; x: number; y: number; size: number };
let drawn: Drawn[] | null = null;
const originalDrawText = pdfLib.PDFPage.prototype.drawText;
pdfLib.PDFPage.prototype.drawText = function (this: import("pdf-lib").PDFPage, text: string, options?: import("pdf-lib").PDFPageDrawTextOptions) {
  drawn?.push({ page: this.doc.getPages().indexOf(this), text, x: Number(options?.x), y: Number(options?.y), size: Number(options?.size) });
  return originalDrawText.call(this, text, options);
};

type PersistedBudget = { currency: string; totalEstimateMin: number; totalEstimateMax: number; items: Array<Record<string, unknown>>; assumptions: string[] };
type PdfRender = { drawn: Drawn[]; calls: Call[] };

const persistBudget = (budget: BudgetRecord): PersistedBudget =>
  JSON.parse(json({ currency: budget.currency, totalEstimateMin: budget.totalEstimateMin, totalEstimateMax: budget.totalEstimateMax, items: budget.items, assumptions: budget.assumptions }));

async function renderPdf(budget: unknown, legacy = false, tier: "enterprise" | "free" = "enterprise"): Promise<PdfRender> {
  const renderer = legacy ? legacyRenderBudgetPdf : renderBudgetPdfModule;
  const before = db.calls.length;
  drawn = [];
  try {
    const buf = await renderer.renderBudgetPdf(structuredClone(budget) as never, { tier, planId: "plan-c6a-pdf", companyName: "C6A Corp", companySize: 200, budgetLevel: "mid" });
    assert(buf.subarray(0, 5).toString() === "%PDF-", "PDF: renders a PDF");
    return { drawn, calls: db.calls.slice(before) };
  } finally {
    drawn = null;
  }
}

const squash = (s: string) => s.replace(/\s+/g, "");
const pdfText = (r: PdfRender) => squash(r.drawn.map((d) => d.text).join(""));
const ORG_CLAIM = /组织价目/;

/** Baseline draw calls must appear in order in the current render; returns the current-only texts. */
function extraTexts(current: PdfRender, baseline: PdfRender): string[] {
  const extras: string[] = [];
  let j = 0;
  for (const d of current.drawn) {
    if (j < baseline.drawn.length && d.text === baseline.drawn[j].text && d.page === baseline.drawn[j].page) j += 1;
    else extras.push(d.text);
  }
  assert(j === baseline.drawn.length, `PDF: every baseline line still rendered in order (matched ${j}/${baseline.drawn.length})`);
  return extras;
}

const basisLine = (name: string, revision: number) => `[估算] ${name} — 估算依据：组织价目表 第 ${revision} 版`;

/** The full sourceNote (or any distinctive part of it) never reaches the PDF. */
function assertNoteAbsent(pdf: PdfRender, note: string, label: string) {
  const text = pdfText(pdf);
  const words = note.split(/\s+/).filter((w) => w.length >= 6);
  assert(!text.includes(squash(note)) && words.every((w) => !text.includes(w)), `${label}: sourceNote not printed (${json(note)})`);
}

function pdfReference(overrides: Partial<Reference> & Pick<Reference, "subcategoryKey">): Reference {
  return reference({ budgetTier: "mid", ...overrides });
}

async function checkBudgetPdf() {
  const officePlaceholders = placeholdersFor("office");
  const r1 = pdfReference({ subcategoryKey: "cardio.commercial_treadmill", id: "opr-c6a-e2e", revision: 1, sourceNote: "C6A-E2E-TEST r1" });
  const r2 = { ...r1, revision: 2, unitPriceMax: 70000, sourceNote: "C6A-E2E-TEST r2" };
  const budgetA = persistBudget(generateBudgetModule.generateBudget(PROJECT, officePlaceholders, { priceBand: "mid", estimatePriceReferences: [r1] }));
  const treadmillA = budgetA.items.find((i) => i.name === TREADMILL.subCategory)!;
  assert(json(treadmillA.estimateBasis) === json({ source: "organization-price-reference", referenceId: "opr-c6a-e2e", revision: 1, subcategoryKey: "cardio.commercial_treadmill", budgetTier: "mid", sourceNote: "C6A-E2E-TEST r1" }), "fixture: Budget A persists estimateBasis r1");

  // Case A
  const pdfA = await renderPdf(budgetA);
  const baseA = await renderPdf(budgetA, true);
  assert(pdfA.calls.length === 0 && baseA.calls.length === 0, "AC6-PDF A: rendering makes no Prisma call");
  const extrasA = extraTexts(pdfA, baseA);
  assert(
    squash(extrasA.join("")) === squash(budgetRenderModule.ORGANIZATION_ESTIMATE_LEGEND + basisLine(TREADMILL.subCategory, 1)),
    `AC6-PDF A: only the organization legend + one basis line are added (got ${json(extrasA)})`,
  );
  assert(
    extrasA.length === 2 && extrasA[0] === budgetRenderModule.ORGANIZATION_ESTIMATE_LEGEND && extrasA[1] === basisLine("商业级跑步机", 1),
    `AC6-PDF A: legend and 「${basisLine("商业级跑步机", 1)}」 each drawn as one line (got ${json(extrasA)})`,
  );
  assertNoteAbsent(pdfA, "C6A-E2E-TEST r1", "AC6-PDF A");
  assert(!pdfText(pdfA).includes("C6A-E2E-TEST"), "AC6-PDF A: no part of the sourceNote printed");
  assert(!ORG_CLAIM.test(pdfText(baseA)), "AC6-PDF A: baseline renderer ignores estimateBasis (sanity)");
  const tablePage = pdfA.drawn.find((d) => d.text.startsWith("[估算·组织价目]"))!.page;
  assert(json(pdfA.drawn.filter((d) => d.page !== tablePage)) === json(baseA.drawn.filter((d) => d.page !== tablePage)), "AC6-PDF A: every other page byte-identical (text + position) to baseline");
  const firstExtra = pdfA.drawn.findIndex((d) => d.text.startsWith("[估算·组织价目]"));
  assert(json(pdfA.drawn.slice(0, firstExtra)) === json(baseA.drawn.slice(0, firstExtra)), "AC6-PDF A: table rows and existing legend drawn exactly as baseline");
  assert(pdfA.drawn.some((d) => d.text === "[估算] 商业级跑步机" || d.text.startsWith("[估算] 商业级跑步机")), "AC6-PDF A: table row label unchanged ([估算] name)");
  const treadmillRemark = String(treadmillA.remark);
  assert(!/组织价目|估算依据/.test(treadmillRemark), "AC6-PDF A: remark carries no estimate basis");

  // Case B — current reference moves to r2; persisted Budget A unchanged.
  const PDF_ORG = "org-c6a-pdf";
  const live = await referenceService.setOrganizationPriceReference({ organizationId: PDF_ORG, userId: INT_USER, body: { subcategoryKey: "cardio.commercial_treadmill", budgetTier: "mid", unitPriceMin: 35000, unitPriceMax: 65000, sourceNote: "C6A-E2E-TEST r1" } });
  const liveR2 = await referenceService.setOrganizationPriceReference({ organizationId: PDF_ORG, userId: INT_USER, body: { subcategoryKey: "cardio.commercial_treadmill", budgetTier: "mid", unitPriceMin: 35000, unitPriceMax: 70000, sourceNote: "C6A-E2E-TEST r2" } });
  assert(live.reference.revision === 1 && liveR2.reference.revision === 2, "fixture: current reference is now revision 2");
  const pdfAAgain = await renderPdf(budgetA);
  assert(json(pdfAAgain.drawn) === json(pdfA.drawn) && pdfAAgain.calls.length === 0, "AC6-PDF B: Budget A re-rendered after r2 → identical PDF text + layout, no Prisma call");
  assert(!pdfText(pdfAAgain).includes(squash("第 2 版")) && !pdfText(pdfAAgain).includes("r2"), "AC6-PDF B: PDF A never mentions r2");

  // Case C — Budget B snapshot r2.
  const budgetB = persistBudget(generateBudgetModule.generateBudget(PROJECT, officePlaceholders, { priceBand: "mid", estimatePriceReferences: [r2] }));
  const pdfB = await renderPdf(budgetB);
  assert(pdfText(pdfB).includes(squash(basisLine("商业级跑步机", 2))) && !pdfText(pdfB).includes(squash("第 1 版")), "AC6-PDF C: Budget B PDF shows 组织价目表 第 2 版 only");
  assert(!pdfText(pdfB).includes("C6A-E2E-TEST"), "AC6-PDF C: sourceNote r2 not printed");
  assert(pdfB.drawn.some((d) => d.text.includes("70,000")), "AC6-PDF C: Budget B PDF shows the r2 unit range");

  // Case D / E / F — baseline-identical renders.
  const identical = async (budget: unknown, label: string) => {
    for (const tier of ["enterprise", "free"] as const) {
      const current = await renderPdf(budget, false, tier);
      const baseline = await renderPdf(budget, true, tier);
      assert(json(current.drawn) === json(baseline.drawn), `${label} (${tier}): PDF text + layout identical to baseline`);
      assert(!ORG_CLAIM.test(pdfText(current)), `${label} (${tier}): no organization price reference claim`);
    }
  };
  const platform = persistBudget(generateBudgetModule.generateBudget(PROJECT, officePlaceholders, { priceBand: "mid" }));
  await identical(platform, "AC6-PDF D platform estimate");
  await identical(persistBudget(generateBudgetModule.generateBudget(PROJECT, placeholdersFor("mixed", PILATES_NOTES), { priceBand: "high" })), "AC6-PDF D platform estimate (pilates / high)");

  const verifiedPlaceholders = withSelections(officePlaceholders, [
    select(TREADMILL, catalogTreadmill, { priceFact: PRICE_FACT }),
    select(ELLIPTICAL, customElliptical, { priceFact: EXPIRED_PRICE_FACT }),
    select(STRENGTH, procurementStrength, { quantity: 5 }),
  ]);
  const verified = persistBudget(generateBudgetModule.generateBudget(PROJECT, verifiedPlaceholders, { priceBand: "mid", estimatePriceReferences: [r1] }));
  assert(verified.items.filter((i) => i.priceBasis === "VERIFIED").length === 2 && !verified.items.some((i) => i.estimateBasis), "fixture: VERIFIED rows ignore the matching reference");
  await identical(verified, "AC6-PDF E VERIFIED");
  const forgedVerified = structuredClone(verified);
  const forgedRow = forgedVerified.items.find((i) => i.priceBasis === "VERIFIED")!;
  forgedRow.estimateBasis = { source: "organization-price-reference", referenceId: "opr-forged", revision: 3, subcategoryKey: "cardio.commercial_treadmill", budgetTier: "mid", sourceNote: "forged" };
  await identical(forgedVerified, "AC6-PDF E VERIFIED row carrying an estimateBasis");

  // cmuwhon78001dpbawnqznejyu contract: C.5-A procurement-product ESTIMATE row (quantity 8, 6000–12000, no priceFact).
  const historicalCandidate = candidate("procurement-product", "C5A-E2E-TEST", "Elliptical-20261006", ELLIPTICAL.subCategory, pi.procurementCandidateId("cmuwbrhpo0001pbaw9ax3sba1", 1));
  const historical = persistBudget(
    legacyBudget.generateBudget(PROJECT, withSelections(officePlaceholders, [select(ELLIPTICAL, historicalCandidate, { quantity: 8 })]), { priceBand: "mid" }),
  );
  const historicalRow = historical.items.find((i) => i.name === ELLIPTICAL.subCategory)!;
  assert(
    historicalRow.quantity === 8 && historicalRow.unitPriceMin === 6000 && historicalRow.unitPriceMax === 12000 && historicalRow.subtotalMin === 48000 && historicalRow.subtotalMax === 96000 &&
      historicalRow.priceBasis === "ESTIMATE" && historicalRow.priceFact === undefined && !("estimateBasis" in historicalRow) &&
      String(historicalRow.remark).endsWith("当前配置：C5A-E2E-TEST Elliptical-20261006（采购库产品；单价未核实）"),
    `fixture: historical Budget contract (cmuwhon78001dpbawnqznejyu shape) (got ${json(historicalRow)})`,
  );
  await identical(historical, "AC6-PDF F historical Budget cmuwhon78001dpbawnqznejyu contract");
  const historicalPdf = await renderPdf(historical);
  assert(pdfText(historicalPdf).includes(squash("[估算] 椭圆机 — 当前配置：C5A-E2E-TEST Elliptical-20261006（采购库产品；单价未核实）")), "AC6-PDF F: historical 当前配置 footnote still printed");
  await identical({ currency: "CNY", totalEstimateMin: 300000, totalEstimateMax: 500000, items: [{ category: "有氧设备", min: 100000, max: 200000 }, { category: "力量设备", min: 200000, max: 300000 }], assumptions: [] }, "AC6-PDF F legacy category-range Budget");

  // Case G — malformed snapshots. Identification needs only source + a valid revision.
  const basisOf = (row: Record<string, unknown>) => row.estimateBasis as Record<string, unknown>;
  const malformed: Array<[string, (row: Record<string, unknown>) => void]> = [
    ["estimateBasis null", (row) => (row.estimateBasis = null)],
    ["source wrong", (row) => (basisOf(row).source = "platform")],
    ["source missing", (row) => delete basisOf(row).source],
    ["revision missing", (row) => delete basisOf(row).revision],
    ["revision 0", (row) => (basisOf(row).revision = 0)],
    ["revision negative", (row) => (basisOf(row).revision = -1)],
    ["revision string", (row) => (basisOf(row).revision = "1")],
    ["revision decimal", (row) => (basisOf(row).revision = 1.5)],
    ["revision NaN", (row) => (basisOf(row).revision = Number.NaN)],
    ["malformed string", (row) => (row.estimateBasis = "组织价目表 第 1 版")],
    ["malformed array", (row) => (row.estimateBasis = [])],
    ["malformed empty object", (row) => (row.estimateBasis = {})],
    ["priceBasis missing", (row) => delete row.priceBasis],
    ["priceBasis VERIFIED without priceFact", (row) => (row.priceBasis = "VERIFIED")],
  ];
  for (const [label, mutate] of malformed) {
    const budget = structuredClone(budgetA);
    mutate(budget.items.find((i) => i.name === TREADMILL.subCategory)!);
    const current = await renderPdf(budget);
    const baseline = await renderPdf(budget, true);
    assert(json(current.drawn) === json(baseline.drawn) && !ORG_CLAIM.test(pdfText(current)), `AC6-PDF G ${label}: no crash, no organization claim, identical to baseline`);
  }
  const malformedNotes: Array<[string, unknown]> = [
    ["sourceNote missing", undefined],
    ["sourceNote empty", ""],
    ["sourceNote blank", "   "],
    ["sourceNote wrong type", 123],
    ["sourceNote 121 chars", adverseNote(121, "SRCNOTE-121")],
    ["sourceNote control char", "SRCNOTE-ctrl\u0007价格说明"],
  ];
  for (const [label, note] of malformedNotes) {
    const budget = structuredClone(budgetA);
    const basis = basisOf(budget.items.find((i) => i.name === TREADMILL.subCategory)!);
    if (note === undefined) delete basis.sourceNote;
    else basis.sourceNote = note;
    const current = await renderPdf(budget);
    assert(json(current.drawn) === json(pdfA.drawn), `AC6-PDF G ${label}: no crash; PDF identical to the valid r1 render (revision label only)`);
    assert(!/SRCNOTE/.test(current.drawn.map((d) => d.text).join("")), `AC6-PDF G ${label}: sourceNote content never printed`);
  }

  // Snapshot end-to-end: API (120-char note) → calculateBudget snapshot → current reference r2 → PDF.
  const E2E_ORG = "org-c6a-pdf-e2e";
  const E2E_PROJECT = "proj-c6a-pdf-e2e";
  db.projects.set(E2E_PROJECT, { ...db.projects.get(INT_PROJECT)!, id: E2E_PROJECT, organizationId: E2E_ORG });
  db.quotes.set("q-pdf-e2e", { id: "q-pdf-e2e", projectId: E2E_PROJECT, companyInfo: { companyName: "C6A Corp", targetUsers: 200, areaM2: 400 }, content: null, createdAt: nextDate() });
  const e2eOwner = api(E2E_ORG, "OWNER");
  const noteR1 = adverseNote(ref.MAX_ESTIMATE_SOURCE_NOTE_LENGTH, "SRCNOTE-r1");
  const noteR2 = adverseNote(ref.MAX_ESTIMATE_SOURCE_NOTE_LENGTH, "SRCNOTE-r2", 33);
  const putR1 = await e2eOwner.put({ ...CELL, sourceNote: noteR1 });
  assert(putR1.status === 201 && viewOf(putR1).revision === 1 && viewOf(putR1).sourceNote === noteR1 && noteR1.length === 120, `snapshot E2E: PUT 120-char mixed sourceNote → 201 created, stored in full (got ${putR1.status} ${json(putR1.body)})`);
  const put121 = await e2eOwner.put({ ...CELL, unitPriceMax: 70000, sourceNote: adverseNote(121, "SRCNOTE-121") });
  assert(put121.status === 400 && put121.body.code === "PRICE_REFERENCE_INVALID" && writesOf(put121).length === 0, `API 121: PUT 121-char sourceNote → 400 PRICE_REFERENCE_INVALID, zero writes (got ${put121.status} ${json(put121.body)})`);
  const afterReject = listOf(await e2eOwner.list());
  assert(afterReject.length === 1 && afterReject[0].revision === 1 && afterReject[0].sourceNote === noteR1 && afterReject[0].unitPriceMax === 65000, "API 121: stored reference unchanged (revision 1, r1 note, r1 range)");
  const e2eA = await calculate("q-pdf-e2e", "mid", E2E_ORG);
  assert(json(itemOf(e2eA, TREADMILL).estimateBasis) === json({ source: "organization-price-reference", referenceId: viewOf(putR1).id, revision: 1, subcategoryKey: "cardio.commercial_treadmill", budgetTier: "mid", sourceNote: noteR1 }), "snapshot E2E: Budget A persists the full 120-char sourceNote r1");
  const readE2E = async (id: string) => (await budgetModel.findUnique({ where: { id } } as never)) as Row;
  const snapshotE2EA = json(await readE2E(e2eA.result.budget.id));
  const pdfE2EA = await renderPdf(await readE2E(e2eA.result.budget.id));
  assert(pdfText(pdfE2EA).includes(squash(basisLine("商业级跑步机", 1))), "snapshot E2E: PDF A shows 组织价目表 第 1 版");
  assertNoteAbsent(pdfE2EA, noteR1, "snapshot E2E PDF A");
  const putR2 = await e2eOwner.put({ ...CELL, unitPriceMax: 70000, sourceNote: noteR2 });
  assert(putR2.status === 200 && viewOf(putR2).revision === 2 && viewOf(putR2).sourceNote === noteR2, "snapshot E2E: current reference → r2 with a new 120-char note");
  const storedA = await readE2E(e2eA.result.budget.id);
  assert(json(storedA) === snapshotE2EA && (rowOf(storedA as unknown as BudgetRecord, TREADMILL).estimateBasis as { sourceNote: string }).sourceNote === noteR1, "snapshot E2E: Budget A row unchanged after r2, sourceNote r1 preserved in full");
  const pdfE2EAAgain = await renderPdf(storedA);
  assert(json(pdfE2EAAgain.drawn) === json(pdfE2EA.drawn) && pdfE2EAAgain.calls.length === 0, "snapshot E2E: PDF A re-rendered after r2 → identical, no Prisma call");
  const e2eB = await calculate("q-pdf-e2e", "mid", E2E_ORG);
  assert((itemOf(e2eB, TREADMILL).estimateBasis as { revision: number; sourceNote: string }).sourceNote === noteR2 && itemOf(e2eB, TREADMILL).estimateBasis!.revision === 2, "snapshot E2E: Budget B persists revision 2 + full sourceNote r2");
  const pdfE2EB = await renderPdf(await readE2E(e2eB.result.budget.id));
  assert(pdfText(pdfE2EB).includes(squash(basisLine("商业级跑步机", 2))) && !pdfText(pdfE2EB).includes(squash("第 1 版")), "snapshot E2E: PDF B shows 组织价目表 第 2 版 only");
  assertNoteAbsent(pdfE2EB, noteR2, "snapshot E2E PDF B");
  assertNoteAbsent(pdfE2EB, noteR1, "snapshot E2E PDF B (r1)");
  out("✓ SOURCE NOTE CONTRACT. PUT 120-char mixed 中文 + English + spaces note → 201, stored in full; PUT 121 → 400 PRICE_REFERENCE_INVALID, zero writes, stored reference unchanged; Budget A snapshot keeps the full 120-char sourceNote r1 after the current reference moves to r2 (row byte-identical); Budget B snapshots r2 + its full note; PDFs show only 组织价目表 第 N 版, never the note");

  // Case H — largest template (office + 普拉提, 10 rows), every row an organization estimate carrying a 120-char
  // mixed 中文 + English + spaces sourceNote: every basis line drawn, no note drawn.
  const allReferences = (tier: PriceBand, note: (key: string) => string, revisionBase = 1) =>
    ref.ESTIMATE_SUBCATEGORIES.map((s, i) => pdfReference({ subcategoryKey: s.key, budgetTier: tier, id: `opr-pdf-${i}`, revision: revisionBase + i, sourceNote: note(s.key) }));
  const withAllCandidates = (placeholders: ProductPlaceholder[]) =>
    withSelections(
      placeholders,
      placeholders
        .filter((p) => pi.isProductSlotCategory(p.category) && p.subCategory)
        .flatMap((p) => {
          const c = pi.listCandidatesForSlot({ subCategory: p.subCategory!, priceBand: "mid" })[0];
          return c ? [select({ category: p.category, subCategory: p.subCategory! }, c)] : [];
        }),
    );
  const MAX_NOTE = ref.MAX_ESTIMATE_SOURCE_NOTE_LENGTH;
  const noteFamilies: Array<[string, (key: string) => string]> = [
    ...[3, 14, 33, 99].map((run): [string, (key: string) => string] => [`mixed cjkRun ${run}`, (key) => adverseNote(MAX_NOTE, `SRCNOTE-${key}`, run)]),
    ["中文 ×120", () => "价".repeat(MAX_NOTE)],
  ];
  let maxFootnoteLines = 0;
  let minBottom = Number.POSITIVE_INFINITY;
  let hCases = 0;
  const multi = async (placeholders: ProductPlaceholder[], note: (key: string) => string, revisionBase: number, label: string) => {
    const budget = persistBudget(generateBudgetModule.generateBudget(PROJECT, placeholders, { priceBand: "mid", estimatePriceReferences: allReferences("mid", note, revisionBase) }));
    const hits = budget.items.filter((i) => i.estimateBasis);
    assert(hits.length === budget.items.filter((i) => i.priceBasis === "ESTIMATE").length && hits.length > 0, `${label}: fixture hits every ESTIMATE row`);
    assert(hits.every((i) => (i.estimateBasis as { sourceNote: string }).sourceNote.length === MAX_NOTE), `${label}: every snapshot sourceNote is exactly ${MAX_NOTE} chars`);
    const pdf = await renderPdf(budget);
    const text = pdfText(pdf);
    assert(pdf.drawn.some((d) => d.text === budgetRenderModule.ORGANIZATION_ESTIMATE_LEGEND), `${label}: organization legend drawn`);
    for (const row of hits) {
      const basis = row.estimateBasis as { revision: number; sourceNote: string };
      const line = basisLine(String(row.name), basis.revision);
      assert(pdf.drawn.some((d) => d.text === line && d.y >= 80), `${label}: 「${line}」 drawn in full`);
      assertNoteAbsent(pdf, basis.sourceNote, `${label} ${row.name}`);
    }
    assert(!/SRCNOTE/.test(pdf.drawn.map((d) => d.text).join("")), `${label}: no sourceNote content drawn`);
    for (const row of budget.items) {
      const context = String(row.remark ?? "").match(/当前配置：.+$/)?.[0];
      if (context) assert(text.includes(squash(`[估算] ${row.name} — ${context}`)), `${label}: 当前配置 footnote for ${row.name} still printed`);
    }
    const page = pdf.drawn.find((x) => x.text.startsWith("[估算·组织价目]"))!.page;
    const footnotes = pdf.drawn.filter((d) => d.page === page && d.size === 8);
    maxFootnoteLines = Math.max(maxFootnoteLines, footnotes.length);
    minBottom = Math.min(minBottom, ...footnotes.map((d) => d.y));
    hCases += 1;
    return { budget, pdf };
  };

  const pilatesBase = templates.buildPlaceholders(PROJECT, { ...projectInput("office", PILATES_NOTES), targetUsers: 50 }, { quantityModel: templates.resolveQuoteQuantityModel(null) });
  for (const [variant, placeholders] of [["plain", pilatesBase], ["candidates on every slot", withAllCandidates(pilatesBase)]] as const) {
    for (const revisionBase of [1, 1000]) {
      let reference: string | null = null;
      for (const [family, note] of noteFamilies) {
        const label = `AC6-PDF H office + 普拉提 / ${variant} / revisions ${revisionBase}… / ${family}`;
        const { budget, pdf } = await multi(placeholders, note, revisionBase, label);
        assert(budget.items.length === 10 && budget.items.every((i) => i.estimateBasis), `${label}: 10 Budget rows, all organization estimates (got ${budget.items.length})`);
        const layout = json(pdf.drawn);
        reference ??= layout;
        assert(layout === reference, `${label}: PDF identical for every sourceNote content (note never affects layout)`);
      }
    }
  }
  const sweepNote = noteFamilies[2][1];
  for (const site of SITE_TYPES) {
    for (const notes of NOTES) {
      const base = templates.buildPlaceholders(PROJECT, { ...projectInput(site, notes), targetUsers: 50 }, { quantityModel: templates.resolveQuoteQuantityModel(null) });
      await multi(withAllCandidates(base), sweepNote, 1, `AC6-PDF H ${site} / ${notes ?? "default"} (candidates on every slot)`);
    }
  }
  out(`✓ AC6-PDF H. office + 普拉提 (10 rows, all organization estimates, every sourceNote exactly 120 chars of mixed 中文 + English + spaces / pure 中文, plain + candidates on every slot, revisions 1–10 and 1000–1009): all 10 「[估算] <item> — 估算依据：组织价目表 第 N 版」 lines + legend + 当前配置 footnotes drawn, no sourceNote content drawn, PDF identical across note contents; plus all ${SITE_TYPES.length * NOTES.length} site × focus Budgets (${hCases} renders, ≤ ${maxFootnoteLines} footnote lines, lowest line y=${Math.round(minBottom)} > 80 stop line)`);

  // Static guard.
  const between = (src: string, from: string, to: string) => src.slice(src.indexOf(from), src.indexOf(to));
  for (const file of [...PDF_FILES, "app/api/pdf/tender/budget/route.ts", "lib/pdf/renderTenderPack.ts"]) {
    const src = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert(!/OrganizationPriceReference|organizationPriceReference|organization-price-reference\.service|listActiveOrganizationPriceReferences|app\/api\/organization-price-references/.test(src), `PDF static guard: ${file} never references organization price reference model / service / API`);
  }
  for (const file of PDF_FILES) {
    const src = fs.readFileSync(path.join(ROOT, file), "utf8");
    assert(!/@\/lib\/prisma|@prisma\/client|prisma\./.test(src), `PDF static guard: ${file} has no Prisma import / query`);
    assert(!/@\/lib\/services\//.test(src) || gitShow(file).includes("@/lib/services/"), `PDF static guard: ${file} imports no new service`);
  }
  for (const file of ["lib/pdf/renderBudgetPdf.ts", "lib/pdf/budgetRender.ts"]) {
    const code = fs.readFileSync(path.join(ROOT, file), "utf8").replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, "");
    assert(!/sourceNote|MAX_ESTIMATE_SOURCE_NOTE_LENGTH/.test(code), `PDF static guard: ${file} never reads or prints sourceNote`);
  }
  const organizationReader = between(fs.readFileSync(path.join(ROOT, "lib/pdf/renderBudgetPdf.ts"), "utf8"), "function readOrganizationEstimateBasis(", "/** VERIFIED only when");
  assert(
    organizationReader.includes("const basis = row.estimateBasis;") && organizationReader.includes("const { source, revision } = basis as Record<string, unknown>;") && organizationReader.includes("return `组织价目表 第 ${revision} 版`;"),
    "PDF static guard: organization basis read only from the persisted row snapshot (source + revision) and rendered as the revision label",
  );
  const renderSrc = fs.readFileSync(path.join(ROOT, "lib/pdf/renderBudgetPdf.ts"), "utf8");
  assert(between(renderSrc, "function readVerifiedPriceSource(", "function readDetailedBudgetItems(") === between(gitShow("lib/pdf/renderBudgetPdf.ts"), "function readVerifiedPriceSource(", "function readDetailedBudgetItems("), "PDF static guard: VERIFIED source reader byte-identical to baseline");
  const renderTenderSrc = fs.readFileSync(path.join(ROOT, "lib/pdf/budgetRender.ts"), "utf8");
  assert(renderTenderSrc.includes("const ESTIMATE_CONFIG_CONTEXT_RE = /当前配置：.+$/;") && renderSrc.includes("note: it.remark,"), "PDF static guard: 当前配置 extraction and remark pass-through unchanged");
  const footnoteLoop = (src: string) => between(src, "const basisLines = budgetPriceBasisLines(strict.items);", "if (y < 80) break;");
  assert(footnoteLoop(renderTenderSrc).length > 0 && footnoteLoop(renderTenderSrc) === footnoteLoop(gitShow("lib/pdf/budgetRender.ts")), "PDF static guard: footnote draw loop (3-line cap, verified-source exception, y < 80 stop) byte-identical to baseline");
  const pdfChanges = execSync(`git diff --name-only ${BASELINE} -- lib/pdf app/api/pdf`, { cwd: ROOT, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
  assert(pdfChanges.every((f) => PDF_FILES.includes(f)), `PDF static guard: only the three Budget PDF files changed (got ${json(pdfChanges)})`);
  out(`✓ AC6-PDF. A: r1 snapshot → legend + 「[估算] 商业级跑步机 — 估算依据：组织价目表 第 1 版」 added (sourceNote not printed), every other line / page identical to baseline, remark untouched, no Prisma call. B: current reference r2 → PDF A identical. C: Budget B snapshot r2 → 第 2 版 only. D: platform estimates, E: VERIFIED (incl. a VERIFIED row carrying an estimateBasis), F: historical cmuwhon78001dpbawnqznejyu contract + legacy category ranges → identical to baseline (enterprise + free). G: ${malformed.length} identity-malformed snapshots (source / revision / shape / priceBasis) → no crash, no claim, identical to baseline; ${malformedNotes.length} note-malformed snapshots with valid source + revision → no crash, revision label only, note never printed`);
  out("✓ PDF static guard. Budget PDF files / route / pack never reference the price reference model / service / API, no Prisma import or query; renderer and footnote builder never read or print sourceNote; organization basis read only from the persisted row (source + revision); VERIFIED reader and 当前配置 extraction unchanged; only the three Budget PDF files changed");
}

// ---------------------------------------------------------------------------
// Slice 5 — UI & user visibility
// ---------------------------------------------------------------------------

const UI_BUDGET_PAGE = "app/(product)/budget/page.tsx";
const UI_PRICE_BASIS = "app/(product)/budget/price-basis.tsx";
const UI_REFERENCE_PAGE = "app/(product)/budget/price-reference/page.tsx";
const UI_REFERENCE_MANAGER = "app/(product)/budget/price-reference/PriceReferenceManager.tsx";
const UI_FILES = [UI_BUDGET_PAGE, UI_PRICE_BASIS, UI_REFERENCE_PAGE, UI_REFERENCE_MANAGER];

type UiNode = import("react").ReactNode;
type UiElement = import("react").ReactElement<Record<string, unknown>>;

/** Host-element text + function-component elements of a server component tree (function components not rendered). */
function walkTree(node: UiNode, texts: string[] = [], components: UiElement[] = []) {
  if (node === null || node === undefined || typeof node === "boolean") return { texts, components };
  if (typeof node === "string" || typeof node === "number") {
    texts.push(String(node));
    return { texts, components };
  }
  if (Array.isArray(node)) {
    for (const child of node) walkTree(child as UiNode, texts, components);
    return { texts, components };
  }
  const el = node as UiElement;
  if (typeof el.type === "function") components.push(el);
  walkTree(el.props?.children as UiNode, texts, components);
  return { texts, components };
}

async function checkUi() {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const react = require("react") as typeof import("react");
  const server = require("react-dom/server") as typeof import("react-dom/server");
  const uiUser = { current: null as null | { id: string; email: string } };
  const uiOrg = { current: { ok: false, reason: "organization-missing" } as Record<string, unknown> };
  stubModule("lib/auth/currentUser", { getCurrentUser: async () => uiUser.current });
  stubModule("lib/organization/single-org-context", { resolveExactSingleOrganizationForUser: async () => uiOrg.current });
  const manager = require("../app/(product)/budget/price-reference/PriceReferenceManager") as typeof import("../app/(product)/budget/price-reference/PriceReferenceManager");
  const referencePage = require("../app/(product)/budget/price-reference/page") as typeof import("../app/(product)/budget/price-reference/page");
  const priceBasis = require("../app/(product)/budget/price-basis") as typeof import("../app/(product)/budget/price-basis");
  /* eslint-enable @typescript-eslint/no-require-imports */
  const html = (el: import("react").ReactElement) => server.renderToStaticMarkup(el);
  const count = (s: string, needle: string) => s.split(needle).length - 1;
  const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  const table = (props: Parameters<typeof manager.PriceReferenceTable>[0]) => decode(html(react.createElement(manager.PriceReferenceTable, props)));

  // AC-UI 1 / 2 — 11 × LOW / MID / HIGH from the canonical registry.
  const flat = manager.PRICE_REFERENCE_GROUPS.flatMap((g) => g.subcategories);
  assert(flat.length === 11 && flat.every((entry, i) => entry === ref.ESTIMATE_SUBCATEGORIES[i]), "AC-UI 2: grid rows are the registry entries themselves, in registry order");
  assert(json(manager.PRICE_REFERENCE_GROUPS.map((g) => g.category)) === json(["有氧设备", "力量设备", "智能系统", "配套家具", "配套设施", "普拉提设备", "瑜伽垫上设备", "功能训练设备"]), "AC-UI 1: 8 category groups in registry order");
  const empty = table({ references: [], canManage: true });
  assert(count(empty, 'data-cell="') === 33, "AC-UI 1: 33 cells (11 subcategories × 3 tiers)");
  for (const entry of ref.ESTIMATE_SUBCATEGORIES) {
    assert(empty.includes(`>${entry.subCategory}<`), `AC-UI 1: row ${entry.subCategory}`);
    for (const tier of ref.ESTIMATE_PRICE_TIERS) assert(empty.includes(`data-cell="${entry.key}|${tier}"`), `AC-UI 1: cell ${entry.key} × ${tier}`);
  }
  assert(["LOW · 基础", "MID · 标准", "HIGH · 高端"].every((t) => empty.includes(t)), "AC-UI 1: LOW / MID / HIGH columns");
  assert(count(empty, manager.PLATFORM_ESTIMATE_TEXT) === 33, "AC-UI 1: no active reference → 「使用平台通用估算」 in every cell");
  for (const file of [UI_REFERENCE_MANAGER, UI_REFERENCE_PAGE]) {
    const src = fs.readFileSync(path.join(ROOT, file), "utf8");
    const literals = ref.ESTIMATE_SUBCATEGORIES.flatMap((e) => [e.key, e.subCategory]);
    assert(literals.every((l) => !src.includes(l)) && !/"(有氧|力量|智能|配套|普拉提|瑜伽|功能训练)[^"]*"/.test(src), `AC-UI 2: ${file} hard-codes no subcategory key / name / category`);
  }
  const managerSrc = fs.readFileSync(path.join(ROOT, UI_REFERENCE_MANAGER), "utf8");
  assert(/import \{\s*ESTIMATE_PRICE_TIERS,\s*ESTIMATE_SUBCATEGORIES,[\s\S]*?\} from "@\/lib\/budget\/estimate-price-reference";/.test(managerSrc), "AC-UI 2: taxonomy + tiers imported from the canonical registry");

  // Cell display.
  const live = (overrides: Partial<import("../lib/services/organization-price-reference.service").OrganizationPriceReferenceView>) => ({
    id: "opr-ui", subcategoryKey: "cardio.commercial_treadmill", budgetTier: "mid" as PriceBand, unitPriceMin: 35000, unitPriceMax: 65000,
    sourceNote: "2026 Q3 华东采购参考", revision: 2, active: true, createdAt: "2026-10-06T00:00:00.000Z", updatedAt: "2026-10-06T00:00:00.000Z", ...overrides,
  });
  const populated = table({ references: [live({}), live({ id: "opr-off", budgetTier: "high", active: false })], canManage: true });
  const cell = (markup: string, key: string) => markup.slice(markup.indexOf(`data-cell="${key}"`), markup.indexOf("</td>", markup.indexOf(`data-cell="${key}"`)));
  const treadmillMid = cell(populated, "cardio.commercial_treadmill|mid");
  assert(treadmillMid.includes("¥35,000–¥65,000") && treadmillMid.includes("第 2 版 · 生效中") && treadmillMid.includes("来源：2026 Q3 华东采购参考"), `cell shows range / revision / status / sourceNote (got ${treadmillMid})`);
  assert(cell(populated, "cardio.commercial_treadmill|high").includes(manager.PLATFORM_ESTIMATE_TEXT), "inactive reference → 「使用平台通用估算」");
  assert(!/核实价|采购价|供应商报价/.test(populated.replace(/不是供应商报价或已核实采购价/g, "")), "organization price never called 核实价 / 采购价 / 供应商报价");

  // AC-UI 3 / 4 — RBAC (role from the existing server session + membership context; the API stays the boundary).
  const pageFor = async (role: string | null) => {
    uiUser.current = { id: "user-ui", email: "ui@example.test" };
    uiOrg.current = role ? { ok: true, organizationId: "org-c6a-ui", role, membershipId: "m-ui" } : { ok: false, reason: "organization-ambiguous" };
    const tree = walkTree((await referencePage.default()) as UiNode);
    const mgr = tree.components.find((c) => c.type === manager.PriceReferenceManager);
    return { text: tree.texts.join(""), mgr };
  };
  for (const role of ["OWNER", "ADMIN", "admin"]) {
    const p = await pageFor(role);
    assert(p.mgr?.props.canManage === true && p.mgr.props.organizationId === "org-c6a-ui" && !p.text.includes("当前账号为只读"), `AC-UI 3: ${role} → manager with canManage`);
  }
  for (const role of ["MEMBER", "VIEWER", "BILLING", "unknown"]) {
    const p = await pageFor(role);
    assert(p.mgr?.props.canManage === false && p.text.includes("当前账号为只读"), `AC-UI 4: ${role} → read-only manager + notice`);
  }
  const ambiguous = await pageFor(null);
  assert(!ambiguous.mgr && ambiguous.text.includes("无法确定当前组织"), "RBAC UI: no single organization → no manager");
  const owner = await pageFor("OWNER");
  assert(owner.text.includes("这里维护的是组织自己的预算估算单价区间，用于尚未提供核实单价的预算项。它不会覆盖已核实单价。") && owner.text.includes("组织价目仍属于 ESTIMATE（估算），不是供应商报价或已核实采购价。") && owner.text.includes("组织估算价目表"), "price reference page: title + required explanations");
  uiUser.current = null;
  let redirected = "";
  try {
    await referencePage.default();
  } catch (err) {
    redirected = String((err as { digest?: string }).digest ?? err);
  }
  assert(redirected.includes("NEXT_REDIRECT") && redirected.includes("/login"), `price reference page: anonymous → /login (got ${redirected})`);
  const pageSrc = fs.readFileSync(path.join(ROOT, UI_REFERENCE_PAGE), "utf8");
  assert(pageSrc.includes('import { canManagePriceReferences } from "@/app/api/organization-price-references/shared";') && pageSrc.includes("resolveExactSingleOrganizationForUser(user.id)") && pageSrc.includes("getCurrentUser()"), "RBAC UI: reuses the API role rule + the existing session / single-org context (no new auth mechanism)");
  assert(count(populated, "<button") === 33 + 1 && treadmillMid.includes(">编辑<") && treadmillMid.includes(">停用<") && count(populated, ">设置<") === 32, "AC-UI 3: managers get 设置 / 编辑 + 停用 on every cell");
  const readOnly = table({ references: [live({})], canManage: false });
  assert(count(readOnly, "<button") === 0 && readOnly.includes("第 2 版 · 生效中"), "AC-UI 4: read-only users see values, no edit / deactivate control");

  // AC-UI 5 — 120-char boundary.
  const draft = (overrides: Partial<import("../app/(product)/budget/price-reference/PriceReferenceManager").PriceReferenceDraft>) => ({
    subcategoryKey: "cardio.commercial_treadmill", budgetTier: "mid" as PriceBand, unitPriceMin: "35000", unitPriceMax: "65000", sourceNote: "2026 Q3 华东采购参考", ...overrides,
  });
  for (const length of [1, 119, 120]) {
    const note = adverseNote(length, "UI");
    const res = manager.validatePriceReferenceDraft(draft({ sourceNote: note }));
    assert(res.ok && res.body.sourceNote === note && res.body.unitPriceMin === 35000, `AC-UI 5: ${length}-char note accepted`);
  }
  const over = manager.validatePriceReferenceDraft(draft({ sourceNote: adverseNote(121, "UI") }));
  assert(!over.ok && over.error.includes("120") && over.error.includes("121"), "AC-UI 5: 121-char note rejected with a count");
  const rejects: Array<[string, Record<string, string>]> = [
    ["zero", { unitPriceMin: "0" }], ["negative", { unitPriceMin: "-1" }], ["decimal", { unitPriceMax: "65000.5" }], ["text", { unitPriceMin: "abc" }],
    ["blank", { unitPriceMax: "" }], ["min > max", { unitPriceMin: "70000" }], ["> 10,000,000", { unitPriceMax: "10000001" }],
    ["blank note", { sourceNote: "   " }], ["control char", { sourceNote: "价格\n说明" }],
  ];
  for (const [label, o] of rejects) assert(!manager.validatePriceReferenceDraft(draft(o)).ok, `UI validation rejects ${label}`);
  assert(manager.validatePriceReferenceDraft(draft({ unitPriceMin: "1", unitPriceMax: "10000000" })).ok, "UI validation accepts 1 … 10,000,000");
  const editing = (note: string) => cell(table({ references: [], canManage: true, editing: { key: "cardio.commercial_treadmill|mid", draft: draft({ sourceNote: note }) } }), "cardio.commercial_treadmill|mid");
  assert(editing("2026 Q3 华东采购参考 Supplier A 含税 运输安装").includes(`>${"2026 Q3 华东采购参考 Supplier A 含税 运输安装".length} / 120<`), "AC-UI 5: live counter (N / 120)");
  const at120 = editing(adverseNote(120, "UI"));
  assert(at120.includes(">120 / 120<") && !/<button[^>]*disabled=""[^>]*>保存</.test(at120), "AC-UI 5: 120 / 120 → save enabled");
  const at121 = editing(adverseNote(121, "UI"));
  assert(at121.includes(">121 / 120<") && at121.includes("text-rose-300") && /<button[^>]*disabled=""[^>]*>保存</.test(at121) && at121.includes("来源说明最多 120 字（当前 121 字）"), "AC-UI 5: 121 / 120 → flagged, save disabled");

  // AC-UI 6 + edit / deactivate through the real API routes.
  const UI_ORG = "org-c6a-ui";
  const requests: Array<{ method: string; url: string; org: string | null; body: unknown }> = [];
  const uiFetch = (role: string, opts: { throwNetwork?: boolean } = {}) =>
    (async (input: string | URL | Request, init?: RequestInit) => {
      if (opts.throwNetwork) throw new TypeError("Failed to fetch");
      const method = init?.method ?? "GET";
      const url = `http://localhost${String(input)}`;
      const headers = new Headers(init?.headers);
      requests.push({ method, url: String(input), org: headers.get("x-organization-id"), body: init?.body ? JSON.parse(String(init.body)) : null });
      gate.org = headers.get("x-organization-id") ?? "";
      gate.role = role;
      const req = request(method, url, undefined, init?.body ? String(init.body) : undefined);
      if (method === "GET") return referencesRoute.GET(req);
      if (method === "PUT") return referencesRoute.PUT(req);
      const id = decodeURIComponent(url.split("/").pop()!);
      return referenceRoute.DELETE(req, { params: Promise.resolve({ id }) });
    }) as typeof fetch;
  const writesSince = (n: number) => db.calls.slice(n).filter((c) => WRITE_METHODS.has(c.method));
  const body = (o: Record<string, string> = {}) => {
    const v = manager.validatePriceReferenceDraft(draft(o));
    assert(v.ok, "fixture: valid UI draft");
    return (v as { ok: true; body: import("../app/(product)/budget/price-reference/PriceReferenceManager").PriceReferencePutBody }).body;
  };
  const created = await manager.savePriceReference(UI_ORG, body(), uiFetch("OWNER"));
  assert(created.ok && created.value.revision === 1 && created.value.sourceNote === "2026 Q3 华东采购参考", `edit: OWNER creates the cell (got ${json(created)})`);
  assert(json(requests.at(-1)) === json({ method: "PUT", url: "/api/organization-price-references", org: UI_ORG, body: body() }), `edit: PUT /api/organization-price-references with the gate organization header (got ${json(requests.at(-1))})`);
  let before = db.calls.length;
  const same = await manager.savePriceReference(UI_ORG, body(), uiFetch("ADMIN"));
  assert(same.ok && same.value.revision === 1 && writesSince(before).length === 0, "edit: identical save → revision unchanged, no write");
  const noted = await manager.savePriceReference(UI_ORG, body({ sourceNote: adverseNote(120, "UI-r2") }), uiFetch("admin"));
  assert(noted.ok && noted.value.revision === 2 && noted.value.sourceNote === adverseNote(120, "UI-r2"), "edit: sourceNote change (120 chars) → revision 2, stored in full");
  const priced = await manager.savePriceReference(UI_ORG, body({ unitPriceMax: "70000", sourceNote: adverseNote(120, "UI-r2") }), uiFetch("OWNER"));
  assert(priced.ok && priced.value.revision === 3 && priced.value.unitPriceMax === 70000, "edit: price change → revision 3");
  const loaded = await manager.loadPriceReferences(UI_ORG, uiFetch("VIEWER"));
  assert(loaded.ok && loaded.value.length === 1 && loaded.value[0].revision === 3, "read: VIEWER loads the active cells");
  const afterEdit = table({ references: loaded.ok ? loaded.value : [], canManage: false });
  assert(cell(afterEdit, "cardio.commercial_treadmill|mid").includes("第 3 版 · 生效中") && cell(afterEdit, "cardio.commercial_treadmill|mid").includes("¥35,000–¥70,000"), "edit: refreshed cell shows the server revision");

  const FORBIDDEN = "权限不足：仅组织所有者或管理员可维护组织估算价目表。";
  const INVALID = manager.priceReferenceErrorMessage(400, { code: "PRICE_REFERENCE_INVALID" }, "save");
  for (const role of ["MEMBER", "VIEWER"]) {
    before = db.calls.length;
    const put = await manager.savePriceReference(UI_ORG, body({ unitPriceMax: "80000" }), uiFetch(role));
    const del = await manager.deactivatePriceReference(UI_ORG, created.ok ? created.value.id : "", uiFetch(role));
    assert(!put.ok && put.error === FORBIDDEN && !del.ok && del.error === FORBIDDEN && writesSince(before).length === 0, `AC-UI 6: ${role} PUT / DELETE → 权限不足, zero writes`);
  }
  before = db.calls.length;
  const invalid = await manager.savePriceReference(UI_ORG, { ...body(), sourceNote: adverseNote(121, "UI") }, uiFetch("OWNER"));
  assert(!invalid.ok && invalid.error === INVALID && invalid.error.includes("1–120 字") && writesSince(before).length === 0, `AC-UI 6: API PRICE_REFERENCE_INVALID → fixed Chinese message, zero writes (got ${json(invalid)})`);
  const id = created.ok ? created.value.id : "";
  db.beforeUpdateMany = () => {
    const row = db.references.get(id)!;
    row.revision = Number(row.revision) + 1;
  };
  const conflict = await manager.savePriceReference(UI_ORG, body({ unitPriceMax: "90000" }), uiFetch("OWNER"));
  assert(!conflict.ok && conflict.error === "价目已被其他操作更新，请刷新后重试。", `AC-UI 6: PRICE_REFERENCE_CONFLICT → 刷新重试 (got ${json(conflict)})`);
  const missing = await manager.deactivatePriceReference(UI_ORG, "opr-unknown", uiFetch("OWNER"));
  assert(!missing.ok && missing.error === "该价目不存在或已停用，请刷新后重试。", "AC-UI 6: unknown DELETE → safe Chinese message");
  db.failNextFindMany = new Error("connect ECONNREFUSED 10.0.0.5:5432 secret-db-host");
  const failed = await manager.loadPriceReferences(UI_ORG, uiFetch("OWNER"));
  assert(!failed.ok && failed.error === "组织估算价目表加载失败，请稍后重试。", "AC-UI 6: internal error → generic message, no internals");
  const network = await manager.savePriceReference(UI_ORG, body(), uiFetch("OWNER", { throwNetwork: true }));
  assert(!network.ok && network.error === "网络异常，请检查网络后重试。", "AC-UI 6: network failure → safe message");
  for (const status of [401, 403, 500, 502]) {
    for (const action of ["load", "save", "deactivate"] as const) {
      const msg = manager.priceReferenceErrorMessage(status, { message: "Prisma P2002 secret-db-host", code: "INTERNAL" }, action);
      assert(!/Prisma|P2002|secret|INTERNAL/.test(msg) && /[\u4e00-\u9fa5]/.test(msg), `AC-UI 6: ${status} ${action} → Chinese, no server detail`);
    }
  }
  const deactivated = await manager.deactivatePriceReference(UI_ORG, id, uiFetch("OWNER"));
  assert(deactivated.ok && deactivated.value.active === false && deactivated.value.revision === db.references.get(id)!.revision, "deactivate: DELETE /api/organization-price-references/[id] → soft deactivation");
  assert(json(requests.at(-1)) === json({ method: "DELETE", url: `/api/organization-price-references/${id}`, org: UI_ORG, body: null }), "deactivate: DELETE route with the gate organization header");
  assert(db.references.has(id), "deactivate: row kept (no physical delete)");
  const afterDeactivate = await manager.loadPriceReferences(UI_ORG, uiFetch("MEMBER"));
  assert(afterDeactivate.ok && afterDeactivate.value.length === 0 && cell(table({ references: afterDeactivate.value, canManage: true }), "cardio.commercial_treadmill|mid").includes(manager.PLATFORM_ESTIMATE_TEXT), "deactivate: cell → 「使用平台通用估算」");
  assert(managerSrc.includes("内容未变化，仍为第 ${saved.revision} 版。") && managerSrc.includes("已保存，当前为第 ${saved.revision} 版。"), "edit: success feedback reports the server revision (unchanged vs incremented)");
  assert(!/res\.error|body\.message|\.message\b/.test(managerSrc.slice(managerSrc.indexOf("export function priceReferenceErrorMessage"), managerSrc.indexOf("type Fetcher"))), "AC-UI 6: error mapping never reads the server message");
  out("✓ AC-UI 1–6. /budget/price-reference: title + explanations; 11 registry subcategories (8 groups) × LOW / MID / HIGH = 33 cells, taxonomy imported from the canonical registry (no second list); cell = range / 第 N 版 / 来源 / 状态, none → 使用平台通用估算; OWNER / ADMIN (server session + single-org role, API rule reused) edit / deactivate, MEMBER / VIEWER / BILLING read-only; 1 / 119 / 120 accepted, 121 flagged with N / 120 counter and save disabled; real PUT / DELETE: identical save keeps the revision, note / price change increments, deactivate → platform; INVALID / FORBIDDEN / CONFLICT / NOT_FOUND / 5xx / network → fixed Chinese messages, zero writes, no internals");

  // AC-UI 7 / 8 — Budget price basis counts + row display (persisted items only).
  const officePlaceholders = placeholdersFor("office");
  const mixed = persistBudget(generateBudgetModule.generateBudget(PROJECT, withSelections(officePlaceholders, [
    select(TREADMILL, catalogTreadmill, { priceFact: PRICE_FACT }),
    select(ELLIPTICAL, customElliptical, { priceFact: EXPIRED_PRICE_FACT }),
  ]), { priceBand: "mid", estimatePriceReferences: [
    pdfReference({ subcategoryKey: "cardio.commercial_treadmill", revision: 4, sourceNote: "ignored: VERIFIED wins" }),
    pdfReference({ subcategoryKey: "strength.multi_station", revision: 2, sourceNote: adverseNote(120, "UI-STRENGTH") }),
    pdfReference({ subcategoryKey: "furniture.lockers", revision: 7, sourceNote: "2026 Q3 华东采购参考" }),
  ] }));
  const items = mixed.items as unknown as BudgetRecord["items"];
  const expected = {
    VERIFIED: items.filter((i) => i.priceBasis === "VERIFIED").length,
    ORGANIZATION_ESTIMATE: items.filter((i) => i.priceBasis === "ESTIMATE" && i.estimateBasis?.source === "organization-price-reference").length,
    PLATFORM_ESTIMATE: 0,
  };
  expected.PLATFORM_ESTIMATE = items.length - expected.VERIFIED - expected.ORGANIZATION_ESTIMATE;
  assert(expected.VERIFIED === 2 && expected.ORGANIZATION_ESTIMATE === 2 && expected.PLATFORM_ESTIMATE > 0, `fixture: mixed Budget (got ${json(expected)})`);
  assert(json(priceBasis.countBudgetPriceBasis(items)) === json(expected), "AC-UI 7: counts VERIFIED / organization / platform");
  const panel = decode(html(react.createElement(priceBasis.BudgetPriceBasisPanel, { items })));
  assert(panel.includes(`核实单价：2 项`) && panel.includes(`组织价目估算：2 项`) && panel.includes(`平台通用估算：${expected.PLATFORM_ESTIMATE} 项`), "AC-UI 7: panel shows the three counts");
  assert(panel.includes("估算 · 组织价目表第 2 版") && panel.includes(`来源说明：${adverseNote(120, "UI-STRENGTH")}`) && panel.includes("估算 · 组织价目表第 7 版") && panel.includes("来源说明：2026 Q3 华东采购参考"), "AC-UI 8: organization rows show revision + full persisted sourceNote");
  assert(count(panel, "估算 · 平台通用区间") === expected.PLATFORM_ESTIMATE && count(panel, "核实单价 · 单价") === 2 && !panel.includes("ignored: VERIFIED wins"), "AC-UI 8: platform rows 估算 · 平台通用区间, VERIFIED rows 核实单价, no reference text on VERIFIED rows");
  const malformedRows: Array<[string, Record<string, unknown>]> = [
    ["no priceBasis (legacy)", { priceBasis: undefined, estimateBasis: undefined }],
    ["source wrong", { estimateBasis: { source: "platform", revision: 1, sourceNote: "x" } }],
    ["revision 0", { estimateBasis: { source: "organization-price-reference", revision: 0, sourceNote: "x" } }],
    ["revision string", { estimateBasis: { source: "organization-price-reference", revision: "1", sourceNote: "x" } }],
    ["array", { estimateBasis: [] }],
    ["VERIFIED with estimateBasis", { priceBasis: "VERIFIED", estimateBasis: { source: "organization-price-reference", revision: 1, sourceNote: "x" } }],
  ];
  for (const [label, o] of malformedRows) {
    const kind = priceBasis.budgetItemPriceBasis({ ...items[0], priceBasis: "ESTIMATE", ...o } as BudgetRecord["items"][number]).kind;
    assert(kind === (o.priceBasis === "VERIFIED" ? "VERIFIED" : "PLATFORM_ESTIMATE"), `AC-UI 7: ${label} → ${kind}`);
  }

  // AC-UI 9 — historical Budget A keeps r1 after the current reference moves to r2.
  const HIST_ORG = "org-c6a-ui-hist";
  const HIST_PROJECT = "proj-c6a-ui-hist";
  db.projects.set(HIST_PROJECT, { ...db.projects.get(INT_PROJECT)!, id: HIST_PROJECT, organizationId: HIST_ORG });
  db.quotes.set("q-ui-hist", { id: "q-ui-hist", projectId: HIST_PROJECT, companyInfo: { companyName: "C6A Corp", targetUsers: 200, areaM2: 400 }, content: null, createdAt: nextDate() });
  const noteR1 = adverseNote(120, "UI-HIST-r1");
  const noteR2 = adverseNote(120, "UI-HIST-r2", 33);
  const r1 = await manager.savePriceReference(HIST_ORG, body({ sourceNote: noteR1 }), uiFetch("OWNER"));
  assert(r1.ok && r1.value.revision === 1, "fixture: r1 via the UI");
  const budgetA = await calculate("q-ui-hist", "mid", HIST_ORG);
  assert(json(budgetA.result.engine.structure.detailedItems) === json(budgetA.stored.items), "AC-UI 9: page detail (calculate response structure.detailedItems) = persisted Budget items");
  const panelA = () => decode(html(react.createElement(priceBasis.BudgetPriceBasisPanel, { items: budgetA.stored.items })));
  const panelA1 = panelA();
  assert(panelA1.includes("估算 · 组织价目表第 1 版") && panelA1.includes(`来源说明：${noteR1}`), "AC-UI 9: Budget A shows 第 1 版 + r1 sourceNote");
  const r2 = await manager.savePriceReference(HIST_ORG, body({ unitPriceMax: "70000", sourceNote: noteR2 }), uiFetch("OWNER"));
  assert(r2.ok && r2.value.revision === 2, "fixture: current reference → r2 via the UI");
  const storedA = (await budgetModel.findUnique({ where: { id: budgetA.result.budget.id } } as never)) as { items: BudgetRecord["items"] };
  const panelAfter = decode(html(react.createElement(priceBasis.BudgetPriceBasisPanel, { items: storedA.items })));
  assert(panelAfter === panelA1 && panelA() === panelA1, "AC-UI 9: Budget A panel identical after r2 (persisted row and cached detail)");
  assert(!panelAfter.includes("第 2 版") && !panelAfter.includes(noteR2) && !panelAfter.includes("UI-HIST-r2"), "AC-UI 9: Budget A never shows r2");
  const budgetB = await calculate("q-ui-hist", "mid", HIST_ORG);
  const panelB = decode(html(react.createElement(priceBasis.BudgetPriceBasisPanel, { items: budgetB.stored.items })));
  assert(panelB.includes("估算 · 组织价目表第 2 版") && panelB.includes(`来源说明：${noteR2}`) && !panelB.includes(noteR1), "AC-UI 9: new Budget B shows 第 2 版 + r2 sourceNote");
  out("✓ AC-UI 7–9. Budget 价格依据 panel: 核实单价 / 组织价目估算 / 平台通用估算 counts from the persisted rows (malformed / legacy → platform, VERIFIED stays VERIFIED); organization rows 「估算 · 组织价目表第 N 版」 + full 120-char persisted 来源说明, platform rows 「估算 · 平台通用区间」; Budget A (r1) renders byte-identical after the current reference moves to r2 and never shows r2, Budget B shows r2; page detail = calculate response = persisted items");

  // AC-UI 10–12 — Budget page static guard, delivery path, C.1.
  const budgetPage = fs.readFileSync(path.join(ROOT, UI_BUDGET_PAGE), "utf8");
  const basisSrc = fs.readFileSync(path.join(ROOT, UI_PRICE_BASIS), "utf8");
  for (const [file, src] of [[UI_BUDGET_PAGE, budgetPage], [UI_PRICE_BASIS, basisSrc]] as const) {
    assert(!/\/api\/organization-price-references|organization-price-reference\.service|organizationPriceReference|OrganizationPriceReference|@\/lib\/prisma|@prisma\/client|PriceReferenceManager/.test(src), `AC-UI 10: ${file} never queries the current price reference (API / service / model / Prisma)`);
  }
  assert(!/fetch\(/.test(basisSrc) && /^import type \{ BudgetItem \} from "@\/lib\/domain\/tender";$/m.test(basisSrc) && (basisSrc.match(/^import /gm) ?? []).length === 1, "AC-UI 10: price-basis helper is pure (domain types only, no fetch)");
  const fetchTargets = (src: string) => [...src.matchAll(/fetch\(\s*([`"][^`"]*)/g)].map((m) => m[1]).sort();
  assert(json(fetchTargets(budgetPage)) === json(fetchTargets(gitShow(UI_BUDGET_PAGE))), `AC-UI 10: Budget page fetches exactly the baseline endpoints (got ${json(fetchTargets(budgetPage))})`);
  assert(budgetPage.includes("<BudgetPriceBasisPanel items={budgetDetail.items} />") && budgetPage.includes("budgetId && budgetDetail?.quoteId === quoteId ?"), "AC-UI 10: panel reads only the current Budget's detail (calculate response / identity-bound cache)");
  const diff = execSync(`git diff -U0 ${BASELINE} -- "${UI_BUDGET_PAGE}"`, { cwd: ROOT, encoding: "utf8" }).split(/\r?\n/);
  const removed = diff.filter((l) => l.startsWith("-") && !l.startsWith("---")).map((l) => l.slice(1).trim());
  const added = diff.filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1));
  assert(json(removed) === json(['{option.priceBasis === "VERIFIED" ? "（已核实单价）" : "（估算单价）"}']), `AC-UI 11 / 12: the only removed Budget page line is the C.1 basis label (got ${json(removed)})`);
  assert(!added.some((l) => /bg-white|bg-emerald-400|下一步|handleCalculate|handleDownloadPdf|\/tender|setAdjust|readStored|writeStored|router\./.test(l)), "AC-UI 11: additions touch no primary CTA / delivery / calculation / cache code");
  assert(added.some((l) => l.includes('<Link href="/budget/price-reference" className="underline hover:text-zinc-300">')) && added.some((l) => l.trim() === "管理组织估算价目表"), "navigation: low-key 「管理组织估算价目表」 text link");
  assert(budgetPage.includes("交付路径：项目 → 方案 → 预算 → 投标 → 下载") && budgetPage.includes("下一步：生成投标文件") && budgetPage.includes("下载预算 PDF"), "AC-UI 11: delivery path + primary CTAs present");
  assert(execSync(`git diff --name-only ${BASELINE} -- lib/budget/over-budget-adjustment.ts lib/budget/over-budget-adjustment-flow.ts`, { cwd: ROOT, encoding: "utf8" }).trim() === "", "AC-UI 12: C.1 core + flow untouched");
  const slots = pi.buildCandidateSlots(officePlaceholders);
  const slotKeys = officePlaceholders.map((p) => (pi.isProductSlotCategory(p.category) && p.subCategory ? pi.productSlotKey(p.category, p.subCategory) : null));
  const platformOnly = persistBudget(generateBudgetModule.generateBudget(PROJECT, officePlaceholders, { priceBand: "mid" }));
  const orgPriced = persistBudget(generateBudgetModule.generateBudget(PROJECT, officePlaceholders, { priceBand: "mid", estimatePriceReferences: [pdfReference({ subcategoryKey: "cardio.commercial_treadmill", revision: 2, unitPriceMin: 30000, unitPriceMax: 50000 })] }));
  const legacyAdjustment = loadBaselineModule<typeof adjustment>("lib/budget/over-budget-adjustment.ts");
  for (const budget of [platformOnly, orgPriced, mixed]) {
    const rows = budget.items as unknown as BudgetRecord["items"];
    assert(rows.length === slotKeys.length, "fixture: Budget rows index-aligned with slot keys");
    const reduction = adjustment.buildQuantityReductionOptions({ items: rows, slotKeys, slots });
    assert(json(reduction) === json(legacyAdjustment.buildQuantityReductionOptions({ items: rows, slotKeys, slots })), "AC-UI 12: C.1 options identical to the baseline C.1 core");
    for (const option of reduction.options) {
      const item = rows[slotKeys.indexOf(option.slotKey)];
      const label = priceBasis.reductionOptionPriceBasisLabel(option.priceBasis, item);
      const baselineLabel = option.priceBasis === "VERIFIED" ? "（已核实单价）" : "（估算单价）";
      assert(option.priceBasis === "VERIFIED" ? label === baselineLabel : label === (item.estimateBasis ? "（组织价目估算单价）" : "（平台通用估算单价）"), `AC-UI 12: ${option.subCategory} label ${label}`);
    }
  }
  assert(/reductionOptionPriceBasisLabel\(\s*option\.priceBasis,\s*budgetDetail\?\.items\[budgetDetail\.slotKeys\.indexOf\(option\.slotKey\)\],\s*\)/.test(budgetPage), "AC-UI 12: label derived from the option's own priceBasis + its persisted row");
  out("✓ AC-UI 10–12. Budget page + price-basis helper never fetch / import the current price reference API / service / model (fetch endpoints = baseline), panel reads only the current Budget's persisted detail; the only removed line is the C.1 basis label, additions touch no CTA / delivery / calculation / cache code, low-key 「管理组织估算价目表」 link; C.1 core untouched, options identical to baseline, label = 已核实 / 组织价目估算 / 平台通用估算");
}

// ---------------------------------------------------------------------------
// Schema + migration
// ---------------------------------------------------------------------------

const MIGRATION = "prisma/migrations/20261006120000_organization_price_reference/migration.sql";

function checkSchemaAndMigration() {
  const schema = fs.readFileSync(path.join(ROOT, "prisma/schema.prisma"), "utf8");
  const start = schema.indexOf("model OrganizationPriceReference {");
  assert(start >= 0, "schema: OrganizationPriceReference model present");
  const model = schema.slice(start, schema.indexOf("\n}", start)).replace(/\/\/\/.*$/gm, "");
  const fields = model
    .split(/\r?\n/)
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("@@") && !l.startsWith("organization "))
    .map((l) => l.split(/\s+/).slice(0, 2).join(" "));
  assert(
    json(fields) ===
      json([
        "id String", "organizationId String", "subcategoryKey String", "budgetTier PriceBand", "unitPriceMin Int", "unitPriceMax Int",
        "sourceNote String", "revision Int", "active Boolean", "createdBy String?", "updatedBy String?", "createdAt DateTime", "updatedAt DateTime",
      ]),
    `schema: exact minimal field set (got ${json(fields)})`,
  );
  assert(/revision\s+Int\s+@default\(1\)/.test(model) && /active\s+Boolean\s+@default\(true\)/.test(model) && /id\s+String\s+@id @default\(cuid\(\)\)/.test(model), "schema: cuid id, revision default 1, active default true");
  assert(/organization Organization @relation\(fields: \[organizationId\], references: \[id\], onDelete: Cascade\)/.test(model), "schema: organization relation (cascade)");
  assert(/@@unique\(\[organizationId, subcategoryKey, budgetTier\]\)/.test(model) && /@@map\("organization_price_reference"\)/.test(model), "schema: unique (org, key, tier) + table name");
  assert(!/currency|supplier|Json/i.test(model), "schema: no currency / supplier / JSON pricebook");
  const baseSchema = gitShow("prisma/schema.prisma");
  const org = (src: string) => src.slice(src.indexOf("model Organization {"), src.indexOf("\n}", src.indexOf("model Organization {")));
  assert(org(schema) === org(baseSchema).replace("  procurementProducts ProcurementProduct[]\n", "  procurementProducts ProcurementProduct[]\n  organizationPriceReferences OrganizationPriceReference[]\n"), "schema: Organization gains only the relation field");
  const withoutNew = schema.slice(0, schema.indexOf("/// C.6-A — Organization estimate price reference")) + schema.slice(schema.indexOf("\n}", start) + 4);
  assert(withoutNew.replace("  organizationPriceReferences OrganizationPriceReference[]\n", "") === baseSchema, "schema: nothing else changed");

  const migration = fs.readFileSync(path.join(ROOT, MIGRATION), "utf8");
  const statements = migration.split(";").map((s) => s.replace(/--.*$/gm, "").replace(/\s+/g, " ").trim()).filter(Boolean);
  assert(statements.length === 3, `migration: exactly 3 statements (got ${statements.length})`);
  assert(statements[0].startsWith('CREATE TABLE "organization_price_reference" (') && statements[0].includes('"budgetTier" "PriceBand" NOT NULL'), "migration: CREATE TABLE reusing the existing PriceBand enum");
  assert(statements[1] === 'CREATE UNIQUE INDEX "organization_price_reference_organizationId_subcategoryKey__key" ON "organization_price_reference"("organizationId", "subcategoryKey", "budgetTier")', "migration: unique (organizationId, subcategoryKey, budgetTier)");
  assert(statements[2].startsWith('ALTER TABLE "organization_price_reference" ADD CONSTRAINT "organization_price_reference_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id")'), "migration: FK → organization");
  assert(!/\b(DROP|INSERT|DELETE FROM|TRUNCATE|CREATE TYPE|ALTER TYPE)\b/i.test(migration) && !/UPDATE\s+"/i.test(migration), "migration: additive only, no backfill / data change / new type");
  const historical = execSync(`git diff --name-only ${BASELINE} -- prisma/migrations`, { cwd: ROOT, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
  assert(historical.every((f) => f === "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql"), `migration: no historical migration modified by C.6-A (got ${json(historical)})`);
  out("✓ schema + migration: exact minimal OrganizationPriceReference (PriceBand reused, no currency / supplier / JSON), Organization gains only the relation; migration = CREATE TABLE + UNIQUE(org, key, tier) + FK, additive, no backfill, no historical migration touched");
}

// ---------------------------------------------------------------------------
// Static guards + scope
// ---------------------------------------------------------------------------

function checkStaticAndScope() {
  const gen = fs.readFileSync(path.join(ROOT, BUDGET_FILE), "utf8");
  const baseGen = gitShow(BUDGET_FILE);
  const table = (src: string) => src.slice(src.indexOf("function getUnitPriceRange("), src.indexOf("function buildBudgetItem("));
  assert(table(gen).length > 0 && table(gen) === table(baseGen), "static: getUnitPriceRange source byte-identical to baseline (frozen C.2-A3 guard)");
  assert(!/skuDatabase|priceBand\.(min|max)/.test(gen), "static: generateBudget never reads catalog priceBand");
  const verifiedBranch = (src: string) => {
    const start = src.indexOf("  const priceFact = candidateLabel ? placeholder.priceFact : undefined;");
    return src.slice(start, src.indexOf("\n  }\n", start));
  };
  assert(verifiedBranch(gen).length > 0 && verifiedBranch(gen) === verifiedBranch(baseGen), "static: VERIFIED branch source byte-identical to baseline");

  const refSrc = fs.readFileSync(path.join(ROOT, REFERENCE_FILE), "utf8");
  const imports = refSrc.match(/^import[\s\S]*?from\s+"([^"]+)";/gm) ?? [];
  assert(imports.length === 1 && imports[0].includes('from "@/lib/domain/tender"') && imports[0].startsWith("import type"), "purity: estimate-price-reference imports domain types only (no Prisma / service / template)");

  const lines = (cmd: string) =>
    execSync(cmd, { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  const knownDirty = new Set([
    "lib/commercial/action-delivery/index.ts",
    "lib/payments/wechatProvider.ts",
    "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql",
    "login-gzip.html",
  ]);
  const allowed = new Set([
    REFERENCE_FILE,
    "lib/domain/tender.ts",
    BUDGET_FILE,
    VERIFIER,
    "prisma/schema.prisma",
    MIGRATION,
    "lib/services/organization-price-reference.service.ts",
    "app/api/organization-price-references/shared.ts",
    "app/api/organization-price-references/route.ts",
    "app/api/organization-price-references/[id]/route.ts",
    BUDGET_SERVICE,
    ...PDF_FILES,
    ...UI_FILES,
    CALCULATE_ROUTE,
  ]);
  for (const file of [...lines(`git diff --name-only ${BASELINE}`), ...lines("git ls-files --others --exclude-standard")]) {
    if (knownDirty.has(file)) continue;
    assert(allowed.has(file), `C.6-A Slice 1–4 scope: unexpected change ${file}`);
  }
  assert(
    lines(`git diff --name-only ${BASELINE} -- app/api/pdf app/api/tender app/api/budget lib/tender lib/templates lib/product-engine lib/budget/over-budget-adjustment.ts lib/budget/over-budget-adjustment-flow.ts lib/services/quote.service.ts lib/services/procurement-product.service.ts app/api/procurement-products`).every((f) => f === CALCULATE_ROUTE),
    "C.6-A scope: no PDF route / budget route (except the calculate 500 hardening) / C.1 / C.3 / template / PI / Quote / procurement change",
  );
  const productUi = [...lines(`git diff --name-only ${BASELINE} -- "app/(product)"`), ...lines('git ls-files --others --exclude-standard -- "app/(product)"')];
  assert(productUi.every((f) => UI_FILES.includes(f)), `C.6-A Slice 5 scope: only the Budget page + price-basis helper + price reference page / manager in app/(product) (got ${json(productUi)})`);  assert(!/organization-price-reference|OrganizationPriceReference|estimateBasis/.test(fs.readFileSync(path.join(ROOT, "lib/budget/over-budget-adjustment.ts"), "utf8")), "C.1 core does not read organization price references");
  out("✓ static + scope: getUnitPriceRange and the VERIFIED branch byte-identical to baseline; no catalog price read; reference module DB-free; only the Slice 1 + Slice 2 files + budget.service + the three Budget PDF files + the four Slice 5 UI files changed; C.1 core untouched");
}

async function main() {
  checkRegistry();
  checkValidation();
  checkNoReference();
  checkHitAndPartial();
  checkVerifiedAndSources();
  checkSchemaAndMigration();
  const ids = await checkRevisionLifecycle();
  await checkRbacAndIsolation(ids);
  await checkValidationAndConflicts(ids);
  seedIntegration();
  await checkEmptyAndLegacy();
  await checkIntegrationLifecycle();
  await checkReadFailure();
  await checkCalculateRouteSecurity();
  await checkOrganizationSource();
  await checkBudgetPdf();
  await checkUi();
  checkStaticAndScope();
  out("\nverify-c6-a-organization-estimate-price-reference (Slice 1–5 + SEC): ALL PASS");
}

console.error = () => undefined;
main().catch((err) => {
  out(err);
  process.exit(1);
});

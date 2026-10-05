/**
 * C.5-A — Procurement Product Source Foundation verification.
 * Organization-scoped procurement products as a Quote candidate source: OWNER / ADMIN maintenance,
 * tenant isolation, reuse across projects, full immutable Quote snapshot (candidate + optional
 * priceFact), revision-bound identity, soft deactivation, C.4 revision / C.1 snapshot continuity,
 * no latest/current fallback, and byte-identical reference-catalog / customer-specified behaviour
 * (differential against the HEAD implementation, transpiled in memory).
 * Runs the real procurement routes, quote / budget services, PI engine, Budget + Plan PDF renderers
 * against an in-memory Prisma stub (SaaS gate, growth / CRM / sales bridges stubbed).
 * No DB, no network, no files written.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import vm from "node:vm";

import type { NextRequest } from "next/server";
import ts from "typescript";

import type { BudgetItem } from "../lib/domain/tender";

const ROOT = path.resolve(__dirname, "..");
const PI_FILE = "lib/product-engine/product-intelligence.ts";
const BUDGET_FILE = "lib/services/tender/generateBudget.ts";
const VERIFIER = "scripts/verify-c5-a-procurement-product-source.ts";
const MIGRATION = "prisma/migrations/20261005120000_procurement_product/migration.sql";

const out = console.log.bind(console);
console.log = () => undefined;
console.info = () => undefined;
console.warn = () => undefined;
console.error = () => undefined;

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const json = (value: unknown) => JSON.stringify(value);

/** Key-order-insensitive deep equality. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const row = value as Record<string, unknown>;
    return `{${Object.keys(row)
      .filter((k) => row[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(row[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

// ---------------------------------------------------------------------------
// In-memory Prisma stub (every call logged)
// ---------------------------------------------------------------------------

type Row = Record<string, unknown> & { id: string };
type Call = { model: string; method: string; args: unknown };

const db = {
  projects: new Map<string, Row>(),
  quotes: new Map<string, Row>(),
  products: new Map<string, Row>(),
  budgets: [] as Row[],
  calls: [] as Call[],
  seq: 0,
};

const WRITE_METHODS = new Set(["create", "createMany", "update", "updateMany", "upsert", "delete", "deleteMany"]);

function stubModule(rel: string, exports: Record<string, unknown>) {
  const filename = require.resolve(path.join(ROOT, rel));
  const mod = new Module(filename);
  mod.filename = filename;
  mod.loaded = true;
  mod.exports = exports;
  require.cache[filename] = mod;
}

function nextDate() {
  return new Date(Date.UTC(2026, 9, 1) + ++db.seq * 1000);
}

function clone<T>(row: T | undefined): T | null {
  return row ? structuredClone(row) : null;
}

/* eslint-disable @typescript-eslint/no-require-imports */
const prismaClient = require("@prisma/client") as typeof import("@prisma/client");
/* eslint-enable @typescript-eslint/no-require-imports */
const DB_NULL = prismaClient.Prisma.DbNull;

function matches(row: Row, where: Record<string, unknown> | undefined): boolean {
  if (!where) return true;
  return Object.entries(where).every(([key, expected]) => {
    if (key === "NOT") return !matches(row, expected as Record<string, unknown>);
    if (expected && typeof expected === "object" && "in" in (expected as object)) {
      return ((expected as { in: unknown[] }).in ?? []).includes(row[key]);
    }
    return row[key] === expected;
  });
}

function productData(data: Record<string, unknown>, row: Row) {
  for (const [key, value] of Object.entries(data)) {
    if (value === DB_NULL) row[key] = null;
    else if (key === "revision" && value && typeof value === "object") {
      row.revision = Number(row.revision) + Number((value as { increment: number }).increment);
    } else row[key] = structuredClone(value);
  }
}

const models: Record<string, Record<string, (args: never) => Promise<unknown>>> = {
  project: {
    findUnique: async ({ where }: { where: { id: string } }) => clone(db.projects.get(where.id)),
  },
  quote: {
    create: async ({ data }: { data: Record<string, unknown> }) => {
      const now = nextDate();
      const row: Row = { id: `q-${db.seq}`, createdAt: now, updatedAt: now, content: null, orchestrationId: null, ...structuredClone(data) };
      db.quotes.set(row.id, row);
      return structuredClone(row);
    },
    update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
      const row = db.quotes.get(where.id);
      if (!row) throw new Error(`quote ${where.id} not found`);
      Object.assign(row, structuredClone(data), { updatedAt: nextDate() });
      return structuredClone(row);
    },
    findUnique: async ({ where, include }: { where: { id: string }; include?: { project?: boolean } }) => {
      const row = db.quotes.get(where.id);
      if (!row) return null;
      const result = structuredClone(row) as Row & { project?: Row };
      if (include?.project) result.project = clone(db.projects.get(String(row.projectId))) ?? undefined;
      return result;
    },
  },
  budget: {
    create: async ({ data }: { data: Record<string, unknown> }) => {
      const row: Row = { id: `b-${++db.seq}`, createdAt: new Date(Date.UTC(2026, 9, 1)), ...structuredClone(data) };
      db.budgets.push(row);
      return structuredClone(row);
    },
  },
  procurementProduct: {
    create: async ({ data }: { data: Record<string, unknown> }) => {
      const now = nextDate();
      const row: Row = { id: `ppc5a${db.seq}`, keySpecs: [], priceFact: null, revision: 1, active: true, createdBy: null, updatedBy: null, createdAt: now, updatedAt: now };
      productData(data, row);
      db.products.set(row.id, row);
      return structuredClone(row);
    },
    findFirst: async ({ where }: { where: Record<string, unknown> }) =>
      clone([...db.products.values()].find((row) => matches(row, where))),
    findMany: async ({ where, take }: { where: Record<string, unknown>; take?: number }) =>
      [...db.products.values()]
        .filter((row) => matches(row, where))
        .sort((a, b) => (a.createdAt as Date).getTime() - (b.createdAt as Date).getTime() || a.id.localeCompare(b.id))
        .slice(0, take ?? Infinity)
        .map((row) => structuredClone(row)),
    updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      const rows = [...db.products.values()].filter((row) => matches(row, where));
      for (const row of rows) {
        productData(data, row);
        row.updatedAt = nextDate();
      }
      return { count: rows.length };
    },
  },
};

function modelProxy(model: string) {
  const impl = models[model] ?? {};
  return new Proxy(impl, {
    get(target, prop) {
      if (typeof prop !== "string" || prop === "then") return undefined;
      return async (args: unknown) => {
        db.calls.push({ model, method: prop, args });
        const fn = target[prop];
        if (!fn) throw new Error(`unexpected prisma.${model}.${prop}`);
        return fn(args as never);
      };
    },
  });
}

stubModule("lib/prisma", {
  prisma: new Proxy({} as Record<string, unknown>, {
    get(_target, prop) {
      if (typeof prop !== "string" || prop === "then") return undefined;
      if (prop.startsWith("$")) {
        return () => {
          throw new Error(`unexpected prisma.${prop}`);
        };
      }
      return modelProxy(prop);
    },
  }),
});

// ---------------------------------------------------------------------------
// SaaS gate + side-effect bridges
// ---------------------------------------------------------------------------

const ORG = "org-c5a";
const OTHER_ORG = "org-c5a-other";
const EMPTY_ORG = "org-c5a-empty";
const gate = { org: ORG, role: "OWNER", user: "user-c5a-owner" };

class FeatureGateError extends Error {
  readonly code = "FEATURE_GATE_DENIED";
}

const gateContext = () => ({
  organizationId: gate.org,
  userId: gate.user,
  email: `${gate.user}@example.test`,
  role: gate.role,
  membership: {},
  traceId: "trace-c5a",
  plan: "PRO",
  feature: { plan: "PRO" },
});

stubModule("lib/feature-flags/feature-gate", { FeatureGateError });
stubModule("lib/saas/api-gate", {
  runSaasApiGate: async () => gateContext(),
  runSaasOrgGate: async () => gateContext(),
  trackFeatureUsage: async () => undefined,
  saasGateErrorResponse: () => new Response(JSON.stringify({ ok: false }), { status: 401 }),
});
stubModule("lib/growth/growth.api-helper", {
  growthAwareGateErrorResponse: () => new Response(JSON.stringify({ ok: false }), { status: 403 }),
});
stubModule("lib/growth/activation/first-action.tracker", { hasFirstQuote: () => true });
stubModule("lib/growth/growth.service", { recordQuoteGenerationSuccess: async () => undefined });
stubModule("lib/crm/crm.product-bridge", { recordQuoteAsLead: async () => null });
stubModule("lib/sales/sales.product-bridge", { onQuoteGenerated: () => undefined });

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

const pdfLib = require("pdf-lib") as typeof import("pdf-lib");
const pi = require("../lib/product-engine/product-intelligence") as typeof import("../lib/product-engine/product-intelligence");
const generateBudgetModule = require("../lib/services/tender/generateBudget") as typeof import("../lib/services/tender/generateBudget");
const adjustment = require("../lib/budget/over-budget-adjustment") as typeof import("../lib/budget/over-budget-adjustment");
const templates = require("../lib/templates/placeholderTemplates") as typeof import("../lib/templates/placeholderTemplates");
const quoteService = require("../lib/services/quote.service") as typeof import("../lib/services/quote.service");
const budgetService = require("../lib/services/budget.service") as typeof import("../lib/services/budget.service");
const planPdf = require("../lib/pdf/renderPlanPdf") as typeof import("../lib/pdf/renderPlanPdf");
const budgetPdf = require("../lib/pdf/renderBudgetPdf") as typeof import("../lib/pdf/renderBudgetPdf");
const productsRoute = require("../app/api/procurement-products/route") as typeof import("../app/api/procurement-products/route");
const productRoute = require("../app/api/procurement-products/[id]/route") as typeof import("../app/api/procurement-products/[id]/route");
const piRoute = require("../app/api/quote/product-intelligence/route") as typeof import("../app/api/quote/product-intelligence/route");
/* eslint-enable @typescript-eslint/no-require-imports */

type PI = typeof pi;
type Selection = import("../lib/product-engine/product-intelligence").ProductSelection;
type Slot = import("../lib/product-engine/product-intelligence").ProductCandidateSlot;
type ProductView = import("../lib/services/procurement-product.service").ProcurementProductView;

/** HEAD implementation of a module, transpiled in memory (legacy oracle). */
function loadHeadModule<T>(rel: string): T {
  const source = execSync(`git show HEAD:${rel}`, { cwd: ROOT, encoding: "utf8" });
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const dir = path.join(ROOT, path.dirname(rel));
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
  return mod.exports as unknown as T;
}

const legacyPi = loadHeadModule<PI>(PI_FILE);
const legacyBudget = loadHeadModule<typeof generateBudgetModule>(BUDGET_FILE);

// ---------------------------------------------------------------------------
// Drawn-text recorder (Budget / Plan PDF)
// ---------------------------------------------------------------------------

const drawn: string[] = [];
const originalDrawText = pdfLib.PDFPage.prototype.drawText;
pdfLib.PDFPage.prototype.drawText = function (this: InstanceType<typeof pdfLib.PDFPage>, value: string, options?: unknown) {
  drawn.push(String(value));
  return originalDrawText.call(this, value, options as never);
};
const squash = (s: string) => s.replace(/\s+/g, "");

async function planPdfTexts(quoteId: string) {
  const source = await quoteService.ensureQuotePlanPdfSource(quoteId);
  drawn.length = 0;
  const pdf = await planPdf.renderPlanPdf(source as never, source.solution as never, source.placeholders as never, { tier: "enterprise" });
  assert(pdf.subarray(0, 5).toString() === "%PDF-", "Plan PDF renders");
  return { texts: [...drawn], flat: squash(drawn.join("")) };
}

async function budgetFor(quoteId: string, organizationId = ORG, projectId = PROJECT) {
  const result = await budgetService.calculateBudget({ quoteId, organizationId, projectId, budgetTier: "mid" });
  const items = result.engine.structure.detailedItems as unknown as BudgetItem[];
  const slotKeys = result.engine.structure.detailedItemSlotKeys;
  drawn.length = 0;
  const pdf = await budgetPdf.renderBudgetPdf(result.budget as never, {
    tier: "enterprise",
    planId: "plan-c5a",
    companyName: "C5A Corp",
    companySize: 200,
    budgetLevel: "mid",
  });
  assert(pdf.subarray(0, 5).toString() === "%PDF-", "Budget PDF renders");
  return {
    items,
    slotKeys,
    row: (slotKey: string) => items[slotKeys.indexOf(slotKey)],
    assumptions: result.engine.structure.assumptions as string[],
    structure: json({ items, slotKeys, totals: [result.engine.structure.totalEstimateMin, result.engine.structure.totalEstimateMax] }),
    pdfTexts: [...drawn],
    pdfFlat: squash(drawn.join("")),
  };
}

// ---------------------------------------------------------------------------
// Route harness
// ---------------------------------------------------------------------------

type ApiResult = {
  status: number;
  body: Record<string, unknown> & { ok?: boolean; code?: string; message?: string };
  calls: Call[];
};

async function asUser<T>(org: string, role: string, run: () => Promise<T>): Promise<T> {
  const prev = { ...gate };
  gate.org = org;
  gate.role = role;
  gate.user = `user-${org}-${role.toLowerCase()}`;
  try {
    return await run();
  } finally {
    Object.assign(gate, prev);
  }
}

async function capture(run: () => Promise<Response>): Promise<ApiResult> {
  const before = db.calls.length;
  const res = await run();
  return {
    status: res.status,
    body: (await res.json()) as ApiResult["body"],
    calls: db.calls.slice(before),
  };
}

function request(method: string, url: string, body?: unknown): NextRequest {
  const init: RequestInit = { method, headers: { "Content-Type": "application/json", "x-organization-id": gate.org } };
  if (body !== undefined) init.body = JSON.stringify(body);
  const req = new Request(url, init) as unknown as NextRequest & { nextUrl: URL };
  Object.defineProperty(req, "nextUrl", { value: new URL(url) });
  return req;
}

const BASE = "http://localhost/api/procurement-products";

function api(org: string, role: string) {
  return {
    list: (includeInactive = false) =>
      asUser(org, role, () => capture(() => productsRoute.GET(request("GET", `${BASE}${includeInactive ? "?includeInactive=1" : ""}`)))),
    create: (body: unknown) => asUser(org, role, () => capture(() => productsRoute.POST(request("POST", BASE, body)))),
    update: (id: string, body: unknown) =>
      asUser(org, role, () => capture(() => productRoute.PATCH(request("PATCH", `${BASE}/${id}`, body), { params: Promise.resolve({ id }) }))),
    deactivate: (id: string) =>
      asUser(org, role, () => capture(() => productRoute.DELETE(request("DELETE", `${BASE}/${id}`), { params: Promise.resolve({ id }) }))),
    saveSelections: (quoteId: string, projectId: string, selections: unknown) =>
      asUser(org, role, () =>
        capture(() => piRoute.POST(request("POST", "http://localhost/api/quote/product-intelligence", { quoteId, projectId, organizationId: org, selections }))),
      ),
  };
}

const writesOf = (r: { calls: Call[] }) => r.calls.filter((c) => WRITE_METHODS.has(c.method));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PROJECT = "p-c5a";
const PROJECT_2 = "p-c5a-2";
const FOREIGN_PROJECT = "p-c5a-foreign";
const EMPTY_PROJECT = "p-c5a-empty";
const TREADMILL_SLOT = "有氧设备|商业级跑步机";
const ELLIPTICAL_SLOT = "有氧设备|椭圆机";
const STRENGTH_SLOT = "力量设备|综合训练器";
const FREE_WEIGHT_SLOT = "力量设备|自由力量区设备";

const PRODUCT_PRICE_FACT = {
  unitPrice: 42000,
  currency: "CNY",
  sourceType: "procurement_contract",
  sourceReference: "PC-C5A-001",
  quotedAt: "2026-09-01",
  supplier: "华东采购供应商",
  taxStatus: "tax_included",
  validUntil: "2026-12-31",
};
const CLIENT_PRICE_FACT = {
  unitPrice: 50000,
  currency: "CNY",
  sourceType: "supplier_quote",
  sourceReference: "SQ-C5A-CLIENT",
  quotedAt: "2026-09-20",
};

function projectRow(id: string, organizationId: string): Row {
  const now = nextDate();
  return {
    id,
    name: "C5A采购库产品来源验收",
    clientName: "C5A Corp",
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
    createdAt: now,
    updatedAt: now,
  };
}

async function baseQuote(projectId: string, organizationId: string) {
  const base = await quoteService.generateQuote({
    projectId,
    workspaceId: organizationId,
    organizationId,
    companyInfo: { companyName: "C5A Corp", targetUsers: 200, areaM2: 400 },
  });
  return base.quote.id;
}

async function version(baseId: string, projectId: string, organizationId: string, selections: unknown) {
  const v = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: baseId,
    organizationId,
    projectId,
    decidedBy: "user-c5a-decider",
    selections,
  });
  assert(v.quote.status === "READY", "fixture Quote version READY");
  return v.quote.id;
}

function storedSelections(quoteId: string): Selection[] {
  return ((db.quotes.get(quoteId)!.companyInfo as { productSelections?: Selection[] }).productSelections ?? []) as Selection[];
}

const sel = (quoteId: string, slotKey: string) => storedSelections(quoteId).find((s) => s.slotKey === slotKey);

async function piView(quoteId: string, organizationId = ORG, projectId = PROJECT) {
  return quoteService.getQuoteProductIntelligence({ quoteId, organizationId, projectId });
}

const slotOf = (slots: Slot[], slotKey: string) => slots.find((s) => s.slotKey === slotKey)!;
const procurementIds = (slot: Slot) => slot.candidates.filter((c) => c.source === "procurement-product").map((c) => c.candidateId);

type Products = { treadmill: ProductView; elliptical: ProductView; rack: ProductView; foreign: ProductView };

// ---------------------------------------------------------------------------
// AC1 — management, RBAC, validation, tenant isolation
// ---------------------------------------------------------------------------

async function checkManagement(): Promise<Products> {
  const owner = api(ORG, "OWNER");
  const admin = api(ORG, "ADMIN");
  const member = api(ORG, "MEMBER");

  const forbidden = await member.create({ category: "treadmill", brand: "Life Fitness", model: "Integrity SL" });
  assert(forbidden.status === 403 && forbidden.body.code === "PROCUREMENT_PRODUCT_FORBIDDEN" && writesOf(forbidden).length === 0, `AC1. MEMBER create → 403, zero writes (got ${forbidden.status} ${json(forbidden.body)})`);

  const treadmill = await admin.create({ category: "treadmill", brand: " Life  Fitness ", model: "Integrity SL", keySpecs: ["最高速度 20 km/h", "  质保 5 年  ", ""], organizationId: OTHER_ORG });
  assert(treadmill.status === 201 && treadmill.body.ok === true, `AC1. ADMIN create → 201 (got ${treadmill.status} ${json(treadmill.body)})`);
  const t = treadmill.body.product as ProductView;
  assert(t.brand === "Life Fitness" && json(t.keySpecs) === json(["最高速度 20 km/h", "质保 5 年"]) && t.revision === 1 && t.active === true && t.priceFact === null, `AC1. normalized product, revision 1, no priceFact (got ${json(t)})`);
  assert(db.products.get(t.id)!.organizationId === ORG, "AC1. body organizationId ignored; product owned by the gate organization");

  const elliptical = await owner.create({ category: "elliptical", brand: "Precor", model: "EFX 835", priceFact: PRODUCT_PRICE_FACT });
  assert(elliptical.status === 201, `AC1. OWNER create with priceFact → 201 (got ${json(elliptical.body)})`);
  const e = elliptical.body.product as ProductView;
  assert(canonical(e.priceFact) === canonical(PRODUCT_PRICE_FACT), "AC1. validated priceFact stored");
  const rack = await owner.create({ category: "rack", brand: "Hammer Strength", model: "HD Elite Rack" });
  const r = rack.body.product as ProductView;
  const foreign = await api(OTHER_ORG, "OWNER").create({ category: "treadmill", brand: "Foreign Brand", model: "FB-9" });
  const f = foreign.body.product as ProductView;
  assert(rack.status === 201 && foreign.status === 201, "AC1. rack + foreign-org products created");

  for (const [label, body, code] of [
    ["slotKey string as category", { category: TREADMILL_SLOT, brand: "X", model: "Y" }, "PROCUREMENT_PRODUCT_INVALID"],
    ["Chinese subCategory as category", { category: "商业级跑步机", brand: "X", model: "Y" }, "PROCUREMENT_PRODUCT_INVALID"],
    ["category without a current slot (bike)", { category: "bike", brand: "X", model: "Y" }, "PROCUREMENT_PRODUCT_INVALID"],
    ["Pilates (no taxonomy expansion)", { category: "pilates", brand: "X", model: "Y" }, "PROCUREMENT_PRODUCT_INVALID"],
    ["missing model", { category: "treadmill", brand: "X" }, "PROCUREMENT_PRODUCT_INVALID"],
    ["invalid priceFact source", { category: "treadmill", brand: "X", model: "Y", priceFact: { ...PRODUCT_PRICE_FACT, sourceType: "purchase_contract" } }, "PROCUREMENT_PRODUCT_INVALID"],
    ["future quotedAt", { category: "treadmill", brand: "X", model: "Y", priceFact: { ...PRODUCT_PRICE_FACT, quotedAt: "2099-01-01" } }, "PROCUREMENT_PRODUCT_INVALID"],
    ["11 key specs", { category: "treadmill", brand: "X", model: "Y", keySpecs: Array.from({ length: 11 }, (_, i) => `参数${i}`) }, "PROCUREMENT_PRODUCT_INVALID"],
    ["active duplicate (case-insensitive)", { category: "treadmill", brand: "life fitness", model: "INTEGRITY SL" }, "PROCUREMENT_PRODUCT_DUPLICATE"],
  ] as const) {
    const res = await owner.create(body);
    assert(res.body.code === code && writesOf(res).length === 0, `AC1. ${label} → ${code}, zero writes (got ${res.status} ${json(res.body)})`);
  }

  const listOrg = await member.list();
  const listForeign = await api(OTHER_ORG, "MEMBER").list();
  const orgIds = (listOrg.body.products as ProductView[]).map((p) => p.id);
  assert(listOrg.status === 200 && json(orgIds) === json([t.id, e.id, r.id]), `AC1. MEMBER lists own organization products only (got ${json(orgIds)})`);
  assert(json((listForeign.body.products as ProductView[]).map((p) => p.id)) === json([f.id]), "AC1. foreign org lists only its own product");
  assert(listOrg.calls.every((c) => (c.args as { where: { organizationId: string } }).where.organizationId === ORG), "AC1. list query scoped by organizationId");

  for (const [label, run] of [
    ["MEMBER update", () => member.update(t.id, { model: "Hacked" })],
    ["MEMBER deactivate", () => member.deactivate(t.id)],
  ] as const) {
    const res = await run();
    assert(res.status === 403 && writesOf(res).length === 0, `AC1. ${label} → 403, zero writes`);
  }
  for (const [label, run] of [
    ["cross-org update", () => owner.update(f.id, { model: "Hijack" })],
    ["cross-org deactivate", () => owner.deactivate(f.id)],
    ["missing update", () => owner.update("pp-missing", { model: "X" })],
  ] as const) {
    const res = await run();
    assert(res.status === 404 && res.body.code === "PROCUREMENT_PRODUCT_NOT_FOUND" && writesOf(res).length === 0, `AC1. ${label} → 404, zero writes (got ${res.status})`);
  }
  assert(db.products.get(f.id)!.model === "FB-9" && db.products.get(f.id)!.active === true, "AC1. foreign product untouched");

  const noop = await owner.update(t.id, { brand: "Life Fitness" });
  assert(noop.status === 200 && writesOf(noop).length === 0 && (noop.body.product as ProductView).revision === 1, "AC1. no-op update → no write, revision unchanged");
  const empty = await owner.update(t.id, { unrelated: 1 });
  assert(empty.status === 400 && writesOf(empty).length === 0, "AC1. update without fields → 400");
  out("✓ AC1a. OWNER / ADMIN create; MEMBER 403 on create / update / deactivate; category is a SKU category (slotKey / subCategory / bike / Pilates rejected); priceFact strictly validated; active duplicate 409; list + writes scoped to the gate organization; cross-org update / deactivate 404 with zero writes");
  return { treadmill: t, elliptical: e, rack: r, foreign: f };
}

async function checkCandidateIsolation(p: Products, q0: string, qForeign: string) {
  const view = await piView(q0);
  const treadmillIds = procurementIds(slotOf(view.slots, TREADMILL_SLOT));
  assert(json(treadmillIds) === json([pi.procurementCandidateId(p.treadmill.id, 1)]), `AC1. own treadmill product offered in treadmill slot (got ${json(treadmillIds)})`);
  assert(json(procurementIds(slotOf(view.slots, ELLIPTICAL_SLOT))) === json([pi.procurementCandidateId(p.elliptical.id, 1)]), "AC1. elliptical product offered in elliptical slot only");
  assert(json(procurementIds(slotOf(view.slots, FREE_WEIGHT_SLOT))) === json([pi.procurementCandidateId(p.rack.id, 1)]), "AC1. rack category adapted to 自由力量区设备 slot");
  assert(procurementIds(slotOf(view.slots, STRENGTH_SLOT)).length === 0, "AC1. no product in 综合训练器 slot");
  assert(!json(view).includes(p.foreign.id) && !json(view).includes("Foreign Brand"), "AC1. foreign product never offered");
  const foreignView = await piView(qForeign, OTHER_ORG, FOREIGN_PROJECT);
  assert(json(procurementIds(slotOf(foreignView.slots, TREADMILL_SLOT))) === json([pi.procurementCandidateId(p.foreign.id, 1)]) && !json(foreignView).includes(p.treadmill.id), "AC1. foreign org sees only its own product");

  for (const [label, selection] of [
    ["foreign product id", { slotKey: TREADMILL_SLOT, action: "replace", candidateId: pi.procurementCandidateId(p.foreign.id, 1) }],
    ["own product in an ineligible slot", { slotKey: ELLIPTICAL_SLOT, action: "replace", candidateId: pi.procurementCandidateId(p.treadmill.id, 1) }],
    ["future revision", { slotKey: TREADMILL_SLOT, action: "replace", candidateId: pi.procurementCandidateId(p.treadmill.id, 2) }],
    ["malformed procurement id", { slotKey: TREADMILL_SLOT, action: "replace", candidateId: `proc:${p.treadmill.id}` }],
  ] as const) {
    const count = db.quotes.size;
    const res = await api(ORG, "MEMBER").saveSelections(q0, PROJECT, [selection]);
    assert(res.status === 400 && String(res.body.message).startsWith("候选不存在") && writesOf(res).length === 0 && db.quotes.size === count, `AC1. ${label} → 400 候选不存在, zero writes (got ${res.status} ${json(res.body)})`);
    assert(res.calls.filter((c) => c.model === "procurementProduct").every((c) => (c.args as { where: { organizationId: string } }).where.organizationId === ORG), `AC1. ${label}: product lookup scoped to the requesting organization`);
  }
  out("✓ AC1b. PI view offers only the organization's products, adapted category → current slot (rack → 自由力量区设备); foreign / ineligible-slot / unknown-revision / malformed procurement ids → 400 候选不存在 with zero writes; lookups always organization-scoped");
}

// ---------------------------------------------------------------------------
// AC2 / AC3 / AC4 — reuse, snapshot, optional priceFact
// ---------------------------------------------------------------------------

async function checkSnapshotAndPrice(p: Products, q0: string, q0b: string) {
  const treadmillId = pi.procurementCandidateId(p.treadmill.id, 1);
  const ellipticalId = pi.procurementCandidateId(p.elliptical.id, 1);
  const view = await piView(q0);
  const optionT = slotOf(view.slots, TREADMILL_SLOT).candidates.find((c) => c.candidateId === treadmillId)!;
  const save = await api(ORG, "MEMBER").saveSelections(q0, PROJECT, [
    { slotKey: TREADMILL_SLOT, action: "replace", candidateId: treadmillId, quantity: 7 },
    { slotKey: ELLIPTICAL_SLOT, action: "replace", candidateId: ellipticalId, quantity: 3 },
  ]);
  assert(save.status === 200 && save.body.ok === true, `AC3. MEMBER saves procurement selections (got ${save.status} ${json(save.body)})`);
  const q1 = String(save.body.quoteId);
  const lookups = save.calls.filter((c) => c.model === "procurementProduct");
  assert(lookups.length === 1 && json((lookups[0].args as { where: unknown }).where) === json({ organizationId: ORG, active: true, id: { in: [p.treadmill.id, p.elliptical.id] } }), `AC3. one organization-scoped lookup of the selected active products (got ${json(lookups.map((c) => c.args))})`);

  const t = sel(q1, TREADMILL_SLOT)!;
  const e = sel(q1, ELLIPTICAL_SLOT)!;
  assert(
    json(Object.keys(t.candidate!)) === json(["candidateId", "brand", "model", "category", "keySpecs", "fitReason", "source", "verificationStatus", "openQuestions"]) &&
      json(t.candidate) === json(optionT) &&
      t.candidate!.candidateId === treadmillId &&
      t.candidate!.brand === "Life Fitness" &&
      t.candidate!.model === "Integrity SL" &&
      t.candidate!.category === "商业级跑步机" &&
      json(t.candidate!.keySpecs) === json(["最高速度 20 km/h", "质保 5 年"]) &&
      t.candidate!.fitReason.includes("第 1 版") &&
      t.candidate!.source === "procurement-product" &&
      t.candidate!.verificationStatus === "unverified" &&
      t.quantity === 7 &&
      t.decidedBy === "user-org-c5a-member" &&
      !("priceFact" in t),
    `AC3. full immutable candidate snapshot (id + revision, brand, model, specs, source) stored without priceFact (got ${json(t)})`,
  );
  assert(canonical(e.priceFact) === canonical(PRODUCT_PRICE_FACT) && e.quantity === 3, `AC4. stored valid product priceFact auto-snapshotted on new selection (got ${json(e)})`);
  const stored = json(db.quotes.get(q1)!.companyInfo);
  assert(!/identityKey|organizationId|createdBy|updatedBy|"active"/.test(stored), "AC3. snapshot carries no master-data internals");
  const roundTrip = pi.readStoredProductSelections(JSON.parse(json(storedSelections(q1))));
  assert(json(roundTrip) === json(storedSelections(q1)), "AC3. canonical stored reader returns the snapshot byte-identical (not demoted to reference-catalog)");
  out("✓ AC3. Quote stores the full candidate snapshot (proc:<id>:r1, brand / model / specs / fitReason / source procurement-product / unverified) + quantity; canonical reader round-trips it byte-identical");

  const budget = await budgetFor(q1);
  const tRow = budget.row(TREADMILL_SLOT);
  const eRow = budget.row(ELLIPTICAL_SLOT);
  assert(tRow.priceBasis === "ESTIMATE" && tRow.remark.includes("当前配置：Life Fitness Integrity SL（采购库产品；单价未核实）"), `AC4. no priceFact → ESTIMATE, labelled 采购库产品 (got ${json(tRow)})`);
  assert(eRow.priceBasis === "VERIFIED" && eRow.unitPriceMin === 42000 && eRow.subtotalMin === 126000 && eRow.remark.includes("当前配置：Precor EFX 835（采购库产品；参数未核实）"), `AC4. priceFact present → VERIFIED 42000 × 3, labelled 采购库产品 (got ${json(eRow)})`);
  assert(budget.assumptions.some((a) => a.startsWith("其中采购库产品 2 项")), "AC4. Budget assumptions name procurement products");
  assert(budget.pdfFlat.includes(squash("Life Fitness Integrity SL（采购库产品；单价未核实）")), "AC4. Budget PDF carries the procurement source label");
  const plan = await planPdfTexts(q1);
  assert(plan.flat.includes(squash("采购库产品：Life Fitness Integrity SL")) && plan.flat.includes(squash("采购库产品：Precor EFX 835")), "AC4. Plan PDF labels procurement products explicitly");
  assert(!plan.flat.includes(squash("参考候选：Life Fitness Integrity SL")) && !plan.flat.includes(squash("参考候选：Precor EFX 835")), "AC4. procurement products never labelled 参考候选 in the Plan PDF");
  out("✓ AC4. priceFact optional: absent → ESTIMATE, stored valid fact auto-snapshotted → VERIFIED 42000; Budget rows / assumptions / Budget PDF / Plan PDF label 采购库产品");

  const overridden = await version(q0, PROJECT, ORG, [{ slotKey: ELLIPTICAL_SLOT, action: "replace", candidateId: ellipticalId, priceFact: CLIENT_PRICE_FACT }]);
  assert(canonical(sel(overridden, ELLIPTICAL_SLOT)!.priceFact) === canonical(CLIENT_PRICE_FACT), "AC4. explicit client priceFact (strictly validated) wins over the stored product fact");
  const bad = await api(ORG, "MEMBER").saveSelections(q0, PROJECT, [{ slotKey: ELLIPTICAL_SLOT, action: "replace", candidateId: ellipticalId, priceFact: { ...CLIENT_PRICE_FACT, currency: "USD" } }]);
  assert(bad.status === 400 && writesOf(bad).length === 0, "AC4. invalid client priceFact on a procurement candidate → 400, zero writes");

  const q2 = await version(q0b, PROJECT_2, ORG, [{ slotKey: TREADMILL_SLOT, action: "confirm", candidateId: treadmillId, quantity: 2 }]);
  assert(json(sel(q2, TREADMILL_SLOT)!.candidate) === json(t.candidate), "AC2. same product reused in another project of the organization → identical snapshot");
  assert(db.quotes.get(q2)!.projectId === PROJECT_2 && db.products.size === 4, "AC2. no per-project copy of the master data");
  out("✓ AC2. one organization product reused across two projects with identical snapshots; explicit client priceFact still allowed (strict), invalid → 400");
  return q1;
}

// ---------------------------------------------------------------------------
// AC5 / AC6 / AC8 — master changes never rewrite history
// ---------------------------------------------------------------------------

async function checkHistoryImmutable(p: Products, q0: string, q1: string) {
  const q1Row = json(db.quotes.get(q1));
  const budgetBefore = await budgetFor(q1);
  const planBefore = await planPdfTexts(q1);

  const owner = api(ORG, "OWNER");
  const updT = await owner.update(p.treadmill.id, { model: "Integrity SL Plus", keySpecs: ["最高速度 22 km/h"] });
  assert(updT.status === 200 && (updT.body.product as ProductView).revision === 2, `AC5. update increments revision to 2 (got ${json(updT.body)})`);
  const updE = await owner.update(p.elliptical.id, { priceFact: { ...PRODUCT_PRICE_FACT, unitPrice: 39000, sourceReference: "PC-C5A-002" } });
  assert((updE.body.product as ProductView).revision === 2, "AC5. priceFact change increments revision");
  const deact = await owner.deactivate(p.elliptical.id);
  assert(deact.status === 200 && (deact.body.product as ProductView).active === false && (deact.body.product as ProductView).revision === 2, "AC5. soft deactivation keeps revision");
  const again = await owner.deactivate(p.elliptical.id);
  assert(again.status === 200 && writesOf(again).length === 0, "AC5. deactivation idempotent (no second write)");
  const editInactive = await owner.update(p.elliptical.id, { model: "EFX 999" });
  assert(editInactive.status === 409 && editInactive.body.code === "PROCUREMENT_PRODUCT_INACTIVE", "AC5. inactive product cannot be edited");
  assert(db.products.has(p.elliptical.id) && !db.calls.some((c) => c.model === "procurementProduct" && (c.method === "delete" || c.method === "deleteMany")), "AC5. no physical delete");
  for (const role of ["OWNER", "ADMIN"]) {
    const inactiveList = await api(ORG, role).list(true);
    assert(inactiveList.status === 200 && (inactiveList.body.products as ProductView[]).some((x) => x.id === p.elliptical.id && x.active === false), `AC5. ${role} lists inactive products with includeInactive=1`);
  }
  for (const role of ["MEMBER", "member", "VIEWER"]) {
    const forbiddenList = await api(ORG, role).list(true);
    assert(
      forbiddenList.status === 403 &&
        forbiddenList.body.code === "PROCUREMENT_PRODUCT_FORBIDDEN" &&
        !("products" in forbiddenList.body) &&
        forbiddenList.calls.length === 0,
      `AC5. ${role} includeInactive=1 → 403 PROCUREMENT_PRODUCT_FORBIDDEN with zero Prisma calls (got ${forbiddenList.status} ${json(forbiddenList.body)} calls=${json(forbiddenList.calls.map((c) => `${c.model}.${c.method}`))})`,
    );
  }
  const activeList = await api(ORG, "MEMBER").list();
  assert(
    activeList.status === 200 &&
      !(activeList.body.products as ProductView[]).some((x) => x.id === p.elliptical.id || x.active !== true) &&
      activeList.calls.length === 1 &&
      json((activeList.calls[0].args as { where: unknown }).where) === json({ organizationId: ORG, active: true }),
    "AC5. MEMBER default list → active products only (query filters active: true)",
  );

  assert(json(db.quotes.get(q1)) === q1Row, "AC5. historical Quote row byte-identical");
  const budgetAfter = await budgetFor(q1);
  assert(budgetAfter.structure === budgetBefore.structure, "AC5. historical Budget items / totals unchanged");
  assert(json(budgetAfter.pdfTexts) === json(budgetBefore.pdfTexts), "AC5. historical Budget PDF text unchanged");
  const planAfter = await planPdfTexts(q1);
  assert(json(planAfter.texts) === json(planBefore.texts), "AC5. historical Plan PDF text unchanged");
  assert(planAfter.flat.includes(squash("采购库产品：Life Fitness Integrity SL")) && !planAfter.flat.includes(squash("Integrity SL Plus")), "AC5. Plan PDF still names the selected revision");

  const view = await piView(q1);
  const tSlot = slotOf(view.slots, TREADMILL_SLOT);
  const eSlot = slotOf(view.slots, ELLIPTICAL_SLOT);
  const r1 = pi.procurementCandidateId(p.treadmill.id, 1);
  const r2 = pi.procurementCandidateId(p.treadmill.id, 2);
  assert(json(procurementIds(tSlot)) === json([r2, r1]), `AC5. PI view offers current r2 and retains the selected r1 snapshot (got ${json(procurementIds(tSlot))})`);
  assert(json(tSlot.candidates.find((c) => c.candidateId === r1)) === json(sel(q1, TREADMILL_SLOT)!.candidate), "AC5. retained r1 candidate is the stored snapshot");
  assert(json(procurementIds(eSlot)) === json([pi.procurementCandidateId(p.elliptical.id, 1)]), "AC5. deactivated product's selected snapshot retained in the view, no current option");
  assert(json(view.selections) === json(storedSelections(q1)), "AC5. PI view selections are the stored snapshots");
  out("✓ AC5. update → revision 2, priceFact change → revision 2, soft deactivation (idempotent, inactive edit 409, no delete); includeInactive=1 OWNER / ADMIN only (MEMBER / unknown role → 403 PROCUREMENT_PRODUCT_FORBIDDEN, zero Prisma calls), default list active-only; historical Quote row, Budget items / totals, Budget PDF and Plan PDF text unchanged; PI view retains the selected r1 / deactivated snapshots next to current r2");

  const revisionCalls = db.calls.length;
  const revised = await quoteService.generateQuoteRevision({
    baseQuoteId: q1,
    projectId: PROJECT,
    workspaceId: ORG,
    organizationId: ORG,
    companyInfo: { companyName: "C5A Corp", targetUsers: 200, areaM2: 300, notes: "补充要求：场地调整为 300平米" },
  });
  const q3 = revised.quote.id;
  assert(json(storedSelections(q3)) === json(storedSelections(q1)), "AC6. C.4 revision carries procurement candidate / quantity / priceFact byte-identical");
  assert(!db.calls.slice(revisionCalls).some((c) => c.model === "procurementProduct"), "AC6. revision never reads current procurement master data");
  const revisedBudget = await budgetFor(q3);
  assert(revisedBudget.row(TREADMILL_SLOT).remark.includes("Life Fitness Integrity SL（采购库产品") && !revisedBudget.row(TREADMILL_SLOT).remark.includes("Plus"), "AC6. revised Budget keeps the r1 identity");
  assert(revisedBudget.row(ELLIPTICAL_SLOT).priceBasis === "VERIFIED" && revisedBudget.row(ELLIPTICAL_SLOT).unitPriceMin === 42000, "AC6. revised Budget keeps the snapshotted 42000 priceFact (not current 39000)");
  out("✓ AC6. C.4 revision preserves the procurement snapshot (candidate r1, qty 7 / 3, priceFact 42000) byte-identical without reading master data");

  // AC8 — explicit re-confirmation of retained snapshots, stale ids, C.1 snapshot
  const reconfirmCalls = db.calls.length;
  const reconfirmed = await version(q1, PROJECT, ORG, [
    { slotKey: TREADMILL_SLOT, action: "replace", candidateId: r1, quantity: 7 },
    { slotKey: ELLIPTICAL_SLOT, action: "replace", candidateId: pi.procurementCandidateId(p.elliptical.id, 1), quantity: 3, priceFact: sel(q1, ELLIPTICAL_SLOT)!.priceFact },
  ]);
  assert(json(sel(reconfirmed, TREADMILL_SLOT)!.candidate) === json(sel(q1, TREADMILL_SLOT)!.candidate), "AC8. re-confirming base r1 keeps the r1 snapshot (not current r2)");
  assert(!("priceFact" in sel(reconfirmed, TREADMILL_SLOT)!), "AC8. re-confirmed r1 gains no price from master data");
  assert(json(sel(reconfirmed, ELLIPTICAL_SLOT)!.priceFact) === json(sel(q1, ELLIPTICAL_SLOT)!.priceFact) && json(sel(reconfirmed, ELLIPTICAL_SLOT)!.candidate) === json(sel(q1, ELLIPTICAL_SLOT)!.candidate), "AC8. deactivated product's snapshot + priceFact preserved exactly");
  assert(!db.calls.slice(reconfirmCalls).some((c) => c.model === "procurementProduct"), "AC8. retained snapshots resolved without querying master data");

  const stale = await api(ORG, "MEMBER").saveSelections(q0, PROJECT, [{ slotKey: TREADMILL_SLOT, action: "replace", candidateId: r1 }]);
  assert(stale.status === 400 && writesOf(stale).length === 0, "AC8. stale r1 on a base without it → 400 (never resolved to r2)");
  const inactive = await api(ORG, "MEMBER").saveSelections(q0, PROJECT, [{ slotKey: ELLIPTICAL_SLOT, action: "replace", candidateId: pi.procurementCandidateId(p.elliptical.id, 1) }]);
  assert(inactive.status === 400 && writesOf(inactive).length === 0, "AC8. deactivated product cannot be newly selected");
  const current = await version(q0, PROJECT, ORG, [{ slotKey: TREADMILL_SLOT, action: "replace", candidateId: r2 }]);
  assert(sel(current, TREADMILL_SLOT)!.candidate!.model === "Integrity SL Plus" && sel(current, TREADMILL_SLOT)!.candidate!.fitReason.includes("第 2 版"), "AC8. explicitly choosing current r2 snapshots r2");
  const swapped = await version(q1, PROJECT, ORG, [{ slotKey: TREADMILL_SLOT, action: "replace", candidateId: r2 }]);
  assert(sel(swapped, TREADMILL_SLOT)!.candidate!.candidateId === r2, "AC8. switching from retained r1 to r2 only by explicit user choice");

  const adjusted = adjustment.buildAdjustedSelectionSnapshot({ slots: view.slots, selections: view.selections, approved: { [TREADMILL_SLOT]: 5 } });
  assert(adjusted.ok, `AC8. C.1 snapshot accepts retained procurement candidates (got ${json(adjusted)})`);
  const c1Calls = db.calls.length;
  const c1 = await version(q1, PROJECT, ORG, adjusted.ok ? adjusted.selections : []);
  assert(sel(c1, TREADMILL_SLOT)!.quantity === 5 && json(sel(c1, TREADMILL_SLOT)!.candidate) === json(sel(q1, TREADMILL_SLOT)!.candidate), "AC8. C.1 adjustment keeps the r1 snapshot with the approved quantity");
  assert(json(sel(c1, ELLIPTICAL_SLOT)) !== undefined && json(sel(c1, ELLIPTICAL_SLOT)!.candidate) === json(sel(q1, ELLIPTICAL_SLOT)!.candidate) && json(sel(c1, ELLIPTICAL_SLOT)!.priceFact) === json(sel(q1, ELLIPTICAL_SLOT)!.priceFact), "AC8. C.1 adjustment keeps the deactivated product snapshot + priceFact");
  assert(!db.calls.slice(c1Calls).some((c) => c.model === "procurementProduct"), "AC8. C.1 adjustment never reads current master data");

  const forged = pi.readStoredProductSelections([
    { slotKey: TREADMILL_SLOT, action: "replace", candidate: { ...sel(q1, TREADMILL_SLOT)!.candidate, candidateId: "proc:bad id:r1" } },
    { slotKey: ELLIPTICAL_SLOT, action: "replace", candidate: { ...sel(q1, ELLIPTICAL_SLOT)!.candidate, verificationStatus: "verified" } },
    { slotKey: STRENGTH_SLOT, action: "replace", candidate: { ...sel(q1, TREADMILL_SLOT)!.candidate, brand: " Life Fitness " } },
  ]);
  assert(forged.every((s) => s.candidate === null), `AC8. non-canonical procurement snapshots are dropped, never demoted to reference-catalog (got ${json(forged)})`);
  out("✓ AC8. re-confirming / C.1-adjusting a base keeps r1 and the deactivated snapshot + priceFact exactly with zero master-data reads; stale r1 / deactivated ids on other bases → 400; r2 only by explicit choice; forged snapshots dropped");
}

// ---------------------------------------------------------------------------
// AC7 — reference-catalog / customer-specified unchanged (HEAD oracle)
// ---------------------------------------------------------------------------

async function checkLegacyUnchanged(p: Products, q0: string) {
  const view = await piView(q0);
  const free = view.slots.filter((s) => s.slotKey !== ELLIPTICAL_SLOT && s.slotKey !== STRENGTH_SLOT);
  const catalogSlot = free.find((s) => s.candidates.filter((c) => c.source === "reference-catalog").length >= 2)!;
  assert(Boolean(catalogSlot), "fixture: a slot with ≥ 2 catalog candidates");
  const removeSlot = free.find((s) => s.slotKey !== catalogSlot.slotKey)!;
  assert(Boolean(removeSlot), "fixture: a slot to remove");
  const catalog = catalogSlot.candidates.filter((c) => c.source === "reference-catalog");
  const inputs = [
    { slotKey: catalogSlot.slotKey, action: "replace", candidateId: catalog[1].candidateId, quantity: 4, priceFact: CLIENT_PRICE_FACT },
    { slotKey: ELLIPTICAL_SLOT, action: "replace", customProduct: { brand: "Precor", model: "EFX 885" }, priceFact: PRODUCT_PRICE_FACT },
    { slotKey: STRENGTH_SLOT, action: "confirm", candidateId: null, quantity: 6 },
    { slotKey: removeSlot.slotKey, action: "remove" },
  ];
  const placeholders = templates.buildPlaceholders(
    PROJECT,
    { name: "C5A", clientName: "C5A Corp", industry: "enterprise", siteType: "office", areaM2: 400, targetUsers: 200, city: "上海市", budgetLevel: "mid", deliveryMode: "standard" },
    { quantityModel: templates.QUANTITY_MODEL_PER_USER_V2 },
  );
  const slots = pi.buildCandidateSlots(placeholders);
  assert(json(slots) === json(legacyPi.buildCandidateSlots(placeholders)), "AC7. catalog slots identical to HEAD");
  const options = pi.buildProcurementCandidateOptions(
    [...db.products.values()].filter((row) => row.organizationId === ORG).map((row) => ({ id: row.id, category: String(row.category), brand: String(row.brand), model: String(row.model), keySpecs: row.keySpecs, priceFact: row.priceFact, revision: Number(row.revision) })),
    slots,
  );
  assert(options.length > 0, "fixture: procurement options exist");
  const decidedAt = "2026-10-05T00:00:00.000Z";
  const legacy = legacyPi.resolveProductSelectionInputs({ inputs, slots, decidedAt, decidedBy: "u" });
  const plain = pi.resolveProductSelectionInputs({ inputs, slots, decidedAt, decidedBy: "u" });
  const withProcurement = pi.resolveProductSelectionInputs({ inputs, slots, decidedAt, decidedBy: "u", procurement: { options, retained: storedSelections(q0) } });
  assert(json(plain) === json(legacy) && json(withProcurement) === json(legacy), "AC7. catalog / custom / qty-only / remove resolution byte-identical to HEAD, with or without procurement options");
  const legacyApplied = legacyPi.applyProductSelections(placeholders, legacy);
  const applied = pi.applyProductSelections(placeholders, withProcurement);
  assert(json(applied) === json(legacyApplied), "AC7. overlay byte-identical to HEAD");
  assert(json(pi.readStoredProductSelections(JSON.parse(json(legacy)))) === json(legacyPi.readStoredProductSelections(JSON.parse(json(legacy)))), "AC7. stored reader byte-identical to HEAD for catalog / custom rows");
  const legacyBudgetOut = legacyBudget.generateBudget(PROJECT, legacyApplied.placeholders, { priceBand: "mid" });
  const budgetOut = generateBudgetModule.generateBudget(PROJECT, applied.placeholders, { priceBand: "mid" });
  assert(canonical({ ...budgetOut, createdAt: null }) === canonical({ ...legacyBudgetOut, createdAt: null }), "AC7. generateBudget output (except its wall-clock createdAt) identical to HEAD for catalog / custom");
  const remarks = budgetOut.items.map((i) => i.remark).join("\n");
  assert(remarks.includes("（参考候选；参数未核实）") && remarks.includes("Precor EFX 885（客户指定；参数未核实）") && !remarks.includes("采购库产品"), "AC7. labels 参考候选 / 客户指定 unchanged");

  const legacyQuote = await version(q0, PROJECT, ORG, inputs);
  const plan = await planPdfTexts(legacyQuote);
  assert(plan.flat.includes(squash(`参考候选：${catalog[1].brand} ${catalog[1].model}（非采购确认）`)) && plan.flat.includes(squash("客户指定：Precor EFX 885")) && !plan.flat.includes(squash("采购库产品：")), "AC7. Plan PDF lines 参考候选 / 客户指定 unchanged");
  const legacyBudgetRun = await budgetFor(legacyQuote);
  assert(!legacyBudgetRun.assumptions.some((a) => a.includes("采购库产品")), "AC7. no procurement assumption without procurement products");

  const emptyQuote = await baseQuote(EMPTY_PROJECT, EMPTY_ORG);
  const emptyView = await piView(emptyQuote, EMPTY_ORG, EMPTY_PROJECT);
  const storedSlots = pi.readStoredProductIntelligence((db.quotes.get(emptyQuote)!.content as { productIntelligence: unknown }).productIntelligence)!.slots;
  assert(json(emptyView.slots) === json(storedSlots) && emptyView.warnings.length === 0, "AC7. organization without products: PI view slots identical to the stored catalog snapshot");
  const storedSnapshot = (db.quotes.get(q0)!.content as { productIntelligence: { slots: Slot[] } }).productIntelligence.slots;
  assert(storedSnapshot.every((s) => s.candidates.every((c) => c.source === "reference-catalog")), "AC7. stored Quote PI snapshot slots stay catalog-only");
  out("✓ AC7. HEAD oracle: catalog slots, catalog / custom / qty / remove resolution (with and without procurement options), overlay, stored reader, generateBudget byte-identical; labels 参考候选 / 客户指定 unchanged in Budget + Plan PDF; org without products sees exactly the stored catalog slots");
  void p;
}

// ---------------------------------------------------------------------------
// Source / purity / migration / scope
// ---------------------------------------------------------------------------

function checkSource() {
  const piSrc = fs.readFileSync(path.join(ROOT, PI_FILE), "utf8");
  const imports = piSrc.match(/^import[\s\S]*?from\s+"([^"]+)";/gm) ?? [];
  assert(imports.every((i) => !/prisma|@prisma|lib\/services|procurement-product/.test(i)), "purity: product-intelligence.ts imports no Prisma / service module");

  const migration = fs.readFileSync(path.join(ROOT, MIGRATION), "utf8");
  const statements = migration.split(";").map((s) => s.replace(/--.*$/gm, "").trim()).filter(Boolean);
  assert(statements.length === 4 && statements[0].startsWith('CREATE TABLE "procurement_product"') && statements.slice(1, 3).every((s) => s.startsWith("CREATE INDEX")) && statements[3].startsWith('ALTER TABLE "procurement_product" ADD CONSTRAINT'), "migration: additive only (CREATE TABLE + 2 indexes + FK)");
  assert(
    statements.every((s) => /^(CREATE TABLE "procurement_product"|CREATE INDEX "procurement_product_\w+" ON "procurement_product"|ALTER TABLE "procurement_product" ADD CONSTRAINT)/.test(s)) &&
      !/\bDROP\b/i.test(migration),
    "migration: touches no existing table",
  );
  const historical = execSync("git diff --name-only HEAD -- prisma/migrations", { cwd: ROOT, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
  assert(historical.every((f) => f === "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql"), `migration: no historical migration modified by C.5-A (got ${json(historical)})`);

  const schema = fs.readFileSync(path.join(ROOT, "prisma/schema.prisma"), "utf8");
  const model = schema.slice(schema.indexOf("model ProcurementProduct {"), schema.indexOf("}", schema.indexOf("model ProcurementProduct {")));
  assert(!/slotKey|ProductPlaceholder|SkuMapping|supplierId|inventory/i.test(model.replace(/\/\/\/.*$/gm, "")), "schema: no slotKey / placeholder / SKU mapping / supplier / inventory binding");

  const page = fs.readFileSync(path.join(ROOT, "app/(product)/quote/page.tsx"), "utf8");
  assert(page.includes('const PROCUREMENT_PRODUCT_BADGE = "采购库产品 / 参数未核实";') && /c\.source === PROCUREMENT_PRODUCT_SOURCE \?/.test(page) && /selection\.candidate\.source === PROCUREMENT_PRODUCT_SOURCE/.test(page), "page: procurement badge on candidates + selection summary");
  const roleRoute = fs.readFileSync(path.join(ROOT, "app/api/procurement-products/shared.ts"), "utf8");
  const roleSrc = fs.readFileSync(path.join(ROOT, "lib/organization/role.service.ts"), "utf8");
  assert(roleRoute.includes('normalized === "OWNER" || normalized === "ADMIN"') && !/procurement/i.test(roleSrc), "RBAC: OWNER / ADMIN role check, no new capability");
  out("✓ source: PI stays DB-free; migration is one additive CREATE TABLE + indexes + FK; no historical migration touched; model not bound to slotKey / placeholder / SKU mapping; Quote page labels procurement products; OWNER / ADMIN without a new RBAC capability");
}

function checkScope() {
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
    "prisma/schema.prisma",
    MIGRATION,
    PI_FILE,
    "lib/product-engine/index.ts",
    "lib/domain/tender.ts",
    "lib/services/procurement-product.service.ts",
    "lib/services/quote.service.ts",
    "lib/services/budget.service.ts",
    BUDGET_FILE,
    "lib/pdf/renderPlanPdf.ts",
    "app/api/procurement-products/route.ts",
    "app/api/procurement-products/[id]/route.ts",
    "app/api/procurement-products/shared.ts",
    "app/(product)/quote/page.tsx",
    VERIFIER,
  ]);
  for (const file of [...lines("git diff --name-only HEAD"), ...lines("git ls-files --others --exclude-standard")]) {
    if (knownDirty.has(file)) continue;
    assert(allowed.has(file), `C.5-A scope: unexpected change ${file}`);
  }
  assert(lines("git diff --name-only HEAD -- app/api/pdf app/api/tender lib/tender lib/templates lib/budget lib/pdf/budgetRender.ts lib/pdf/renderBudgetPdf.ts app/api/quote").length === 0, "C.5-A scope: no Tender / ZIP / C.3 / template / C.1 / Budget PDF / Quote route change");
  out("✓ scope: only the C.5-A schema / migration / PI / services / labels / procurement routes / Quote page / this verifier changed");
}

async function main() {
  db.projects.set(PROJECT, projectRow(PROJECT, ORG));
  db.projects.set(PROJECT_2, projectRow(PROJECT_2, ORG));
  db.projects.set(FOREIGN_PROJECT, projectRow(FOREIGN_PROJECT, OTHER_ORG));
  db.projects.set(EMPTY_PROJECT, projectRow(EMPTY_PROJECT, EMPTY_ORG));
  const q0 = await baseQuote(PROJECT, ORG);
  const q0b = await baseQuote(PROJECT_2, ORG);
  const qForeign = await baseQuote(FOREIGN_PROJECT, OTHER_ORG);

  const products = await checkManagement();
  await checkCandidateIsolation(products, q0, qForeign);
  const q1 = await checkSnapshotAndPrice(products, q0, q0b);
  await checkHistoryImmutable(products, q0, q1);
  await checkLegacyUnchanged(products, q0);
  checkSource();
  checkScope();
  out("\nverify-c5-a-procurement-product-source: ALL PASS");
}

main().catch((err) => {
  out(err);
  process.exit(1);
});

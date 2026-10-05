/**
 * C.4 — Quote Regeneration Selection Continuity verification.
 * A requirement revision (POST /api/quote/generate with an explicit baseQuoteId) creates a NEW
 * Quote that carries the exact READY base Quote's stored productSelections (customer-specified
 * identity, explicit quantity, full priceFact incl. expired validity, decidedAt / decidedBy,
 * orphaned slots), never the latest Quote, never client-supplied selections; the base is
 * immutable; first generation is unchanged; every rejected base writes nothing and tracks no usage.
 * Runs the real route, real quote.service / product engine / tenant guard against an in-memory
 * Prisma stub (SaaS gate, growth / CRM / sales bridges stubbed). No DB, no network, no files.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";

import type { NextRequest } from "next/server";

const ROOT = path.resolve(__dirname, "..");
const SERVICE = "lib/services/quote.service.ts";
const ROUTE = "app/api/quote/generate/route.ts";
const PAGE = "app/(product)/quote/page.tsx";
const VERIFIER = "scripts/verify-c4-quote-revision-selection-continuity.ts";

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
// SaaS gate + side-effect bridges (counted)
// ---------------------------------------------------------------------------

const ORG = "org-c4";
const OTHER_ORG = "org-c4-other";
const gate = { org: ORG };
const effects = { usage: 0, growth: 0, crm: 0, sales: 0 };

class FeatureGateError extends Error {
  readonly code = "FEATURE_GATE_DENIED";
}

stubModule("lib/feature-flags/feature-gate", { FeatureGateError });
stubModule("lib/saas/api-gate", {
  runSaasApiGate: async () => ({ organizationId: gate.org, userId: "user-c4", traceId: "trace-c4", feature: { plan: "PRO" } }),
  trackFeatureUsage: async () => {
    effects.usage += 1;
  },
  saasGateErrorResponse: () => new Response(JSON.stringify({ ok: false }), { status: 401 }),
});
stubModule("lib/growth/growth.api-helper", {
  growthAwareGateErrorResponse: () => new Response(JSON.stringify({ ok: false }), { status: 403 }),
});
stubModule("lib/growth/activation/first-action.tracker", { hasFirstQuote: () => true });
stubModule("lib/growth/growth.service", {
  recordQuoteGenerationSuccess: async () => {
    effects.growth += 1;
  },
});
stubModule("lib/crm/crm.product-bridge", {
  recordQuoteAsLead: async () => {
    effects.crm += 1;
    return null;
  },
});
stubModule("lib/sales/sales.product-bridge", {
  onQuoteGenerated: () => {
    effects.sales += 1;
  },
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

const quoteService = require("../lib/services/quote.service") as typeof import("../lib/services/quote.service");
const route = require("../app/api/quote/generate/route") as typeof import("../app/api/quote/generate/route");
/* eslint-enable @typescript-eslint/no-require-imports */

type Selection = import("../lib/product-engine/product-intelligence").ProductSelection;

// ---------------------------------------------------------------------------
// Fixtures through the real services
// ---------------------------------------------------------------------------

const PROJECT = "p-c4";
const OTHER_PROJECT = "p-c4-other";
const FOREIGN_PROJECT = "p-c4-foreign";
const TREADMILL_SLOT = "有氧设备|商业级跑步机";
const ELLIPTICAL_SLOT = "有氧设备|椭圆机";
const ORPHAN_SLOT = "有氧设备|C4已不存在的设备位";
const PRICE_FACT = {
  unitPrice: 50000,
  currency: "CNY",
  sourceType: "supplier_quote",
  sourceReference: "C2B-PROD-001",
  quotedAt: "2026-09-20",
  supplier: "上海测试器材供应商",
  taxStatus: "tax_included",
  validUntil: "2026-12-31",
};
const EXPIRED_PRICE_FACT = {
  unitPrice: 18800,
  currency: "CNY",
  sourceType: "procurement_contract",
  sourceReference: "C4-EXPIRED-2025",
  quotedAt: "2025-01-02",
  supplier: "历史合同供应商",
  taxStatus: "tax_excluded",
  validUntil: "2025-03-31",
};

function projectRow(id: string, organizationId: string): Row {
  const now = nextDate();
  return {
    id,
    name: "C4方案修订选型延续验收",
    clientName: "C4 Corp",
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
    companyInfo: { companyName: "C4 Corp", targetUsers: 200, areaM2: 400 },
  });
  return base.quote.id;
}

async function version(baseId: string, projectId: string, organizationId: string, selections: unknown[]) {
  const v = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: baseId,
    organizationId,
    projectId,
    decidedBy: "user-c4-decider",
    selections,
  });
  assert(v.quote.status === "READY", "fixture Quote version READY");
  return v.quote.id;
}

function storedSelections(quoteId: string): Selection[] {
  return ((db.quotes.get(quoteId)!.companyInfo as { productSelections?: Selection[] }).productSelections ?? []) as Selection[];
}

async function buildFixtures() {
  db.projects.set(PROJECT, projectRow(PROJECT, ORG));
  db.projects.set(OTHER_PROJECT, projectRow(OTHER_PROJECT, ORG));
  db.projects.set(FOREIGN_PROJECT, projectRow(FOREIGN_PROJECT, OTHER_ORG));

  const q0 = await baseQuote(PROJECT, ORG);
  const view = await quoteService.getQuoteProductIntelligence({ quoteId: q0, organizationId: ORG, projectId: PROJECT });
  const others = view.slots.filter((s) => s.slotKey !== TREADMILL_SLOT && s.slotKey !== ELLIPTICAL_SLOT);
  const catalogSlot = others.find((s) => s.candidates.length >= 2);
  assert(Boolean(catalogSlot), "fixture: a slot with ≥ 2 catalog candidates");
  const removeSlot = others.find((s) => s.slotKey !== catalogSlot!.slotKey);
  assert(Boolean(removeSlot), "fixture: a slot to remove");

  const selectionsFor = (ellipticalQuantity: number) => [
    { slotKey: TREADMILL_SLOT, action: "confirm", candidateId: null, quantity: 13 },
    {
      slotKey: ELLIPTICAL_SLOT,
      action: "replace",
      customProduct: { brand: "Precor", model: "EFX 885" },
      quantity: ellipticalQuantity,
      priceFact: PRICE_FACT,
    },
    {
      slotKey: catalogSlot!.slotKey,
      action: "replace",
      candidateId: catalogSlot!.candidates[1].candidateId,
      quantity: 4,
      priceFact: EXPIRED_PRICE_FACT,
    },
    { slotKey: removeSlot!.slotKey, action: "remove" },
  ];
  const q1 = await version(q0, PROJECT, ORG, selectionsFor(9));
  assert(storedSelections(q1).length === 4, "fixture Q1 stores 4 selections");

  const foreign0 = await baseQuote(FOREIGN_PROJECT, OTHER_ORG);
  const foreign = await version(foreign0, FOREIGN_PROJECT, OTHER_ORG, [
    { slotKey: ELLIPTICAL_SLOT, action: "replace", customProduct: { brand: "Foreign", model: "X1" }, quantity: 2 },
  ]);

  return { q0, q1, foreign, catalogSlot: catalogSlot!, removeSlot: removeSlot!, selectionsFor };
}

type Fixtures = Awaited<ReturnType<typeof buildFixtures>>;

// ---------------------------------------------------------------------------
// Route harness
// ---------------------------------------------------------------------------

type GenResult = {
  status: number;
  body: { ok?: boolean; code?: string; message?: string; quoteId?: string; status?: string; projectId?: string };
  calls: Call[];
  effects: typeof effects;
};

async function postGenerate(body: Record<string, unknown>, organizationId = ORG): Promise<GenResult> {
  gate.org = organizationId;
  const before = { ...effects };
  const callsBefore = db.calls.length;
  const req = new Request("http://localhost/api/quote/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-organization-id": organizationId },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
  const res = await route.POST(req);
  await new Promise((resolve) => setImmediate(resolve));
  const result: GenResult = {
    status: res.status,
    body: (await res.json()) as GenResult["body"],
    calls: db.calls.slice(callsBefore),
    effects: {
      usage: effects.usage - before.usage,
      growth: effects.growth - before.growth,
      crm: effects.crm - before.crm,
      sales: effects.sales - before.sales,
    },
  };
  gate.org = ORG;
  return result;
}

function revision(baseQuoteId: unknown, extra: Record<string, unknown> = {}) {
  return {
    projectId: PROJECT,
    companyName: "C4 Corp",
    workspaceId: ORG,
    organizationId: ORG,
    industry: "enterprise",
    city: "上海市",
    targetUsers: 200,
    areaM2: 400,
    notes: "补充要求：场地调整为 300平米，增加拉伸区",
    baseQuoteId,
    ...extra,
  };
}

function quotesSnapshot() {
  return json([...db.quotes.entries()]);
}

function writesOf(r: GenResult) {
  return r.calls.filter((c) => WRITE_METHODS.has(c.method));
}

function assertNewQuote(r: GenResult, label: string) {
  assert(r.status === 200 && r.body.ok === true && r.body.status === "READY", `${label}: 200 READY (got ${r.status} ${json(r.body)})`);
  const id = String(r.body.quoteId);
  const writes = writesOf(r);
  assert(
    json(writes.map((c) => `${c.model}.${c.method}`)) === json(["quote.create", "quote.update"]) &&
      (writes[1].args as { where: { id: string } }).where.id === id,
    `${label}: writes only quote.create + quote.update of the new Quote (got ${json(writes.map((c) => `${c.model}.${c.method}`))})`,
  );
  assert(!r.calls.some((c) => c.method === "findFirst" || c.method === "findMany"), `${label}: no latest-Quote selector`);
  assert(r.effects.usage === 1, `${label}: usage tracked once`);
  return id;
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

async function checkExactContinuity(f: Fixtures) {
  const q1Before = quotesSnapshot();
  const q1Row = json(db.quotes.get(f.q1));
  const base = storedSelections(f.q1);
  const r = await postGenerate(revision(f.q1));
  const q2 = assertNewQuote(r, "A. revision of Q1");
  assert(q2 !== f.q1, "A. Q2 is a NEW Quote");
  assert(json(db.quotes.get(f.q1)) === q1Row, "A. Q1 row byte-identical after revision (immutable)");
  assert(quotesSnapshot().startsWith(q1Before.slice(0, -1)), "A. no existing Quote row changed");
  const baseLookups = r.calls.filter((c) => c.model === "quote" && c.method === "findUnique");
  assert(baseLookups.length === 1 && (baseLookups[0].args as { where: { id: string } }).where.id === f.q1, "A. exact base Quote read by id");
  const baseReadAt = r.calls.indexOf(baseLookups[0]);
  const firstWriteAt = r.calls.findIndex((c) => WRITE_METHODS.has(c.method));
  assert(baseReadAt >= 0 && baseReadAt < firstWriteAt, "A. base validated before the first Quote write");

  const inherited = storedSelections(q2);
  assert(canonical(inherited) === canonical(base), `A. Q2 productSelections deep-equal Q1 (got ${json(inherited)})`);
  assert(json(inherited) === json(base), "A. Q2 productSelections byte-identical JSON to Q1");

  const elliptical = inherited.find((s) => s.slotKey === ELLIPTICAL_SLOT)!;
  assert(
    elliptical.action === "replace" &&
      elliptical.quantity === 9 &&
      elliptical.candidate?.source === "customer-specified" &&
      elliptical.candidate.brand === "Precor" &&
      elliptical.candidate.model === "EFX 885" &&
      elliptical.candidate.candidateId === base.find((s) => s.slotKey === ELLIPTICAL_SLOT)!.candidate!.candidateId &&
      canonical(elliptical.priceFact) === canonical(PRICE_FACT),
    "A. customer-specified Precor EFX 885 × 9 with full priceFact preserved",
  );
  const treadmill = inherited.find((s) => s.slotKey === TREADMILL_SLOT)!;
  assert(treadmill.action === "confirm" && treadmill.quantity === 13 && treadmill.candidate === null, "A. explicit quantity 13 preserved");
  assert(inherited.find((s) => s.slotKey === f.removeSlot.slotKey)?.action === "remove", "A. remove action preserved");
  const q1Decided = base.map((s) => [s.decidedAt, s.decidedBy]);
  assert(json(inherited.map((s) => [s.decidedAt, s.decidedBy])) === json(q1Decided) && q1Decided.every(([, by]) => by === "user-c4-decider"), "A. decidedAt / decidedBy carried over, not re-stamped");

  const q2Info = db.quotes.get(q2)!.companyInfo as { notes?: string; areaM2?: number; targetUsers?: number };
  assert(q2Info.notes === "补充要求：场地调整为 300平米，增加拉伸区" && q2Info.areaM2 === 300, `A. revised notes / area from the request (got ${json(q2Info)})`);
  const pi = (db.quotes.get(q2)!.content as { productIntelligence: { appliedSelectionCount: number } }).productIntelligence;
  assert(pi.appliedSelectionCount === 4, `A. all 4 inherited selections applied on Q2 (got ${pi.appliedSelectionCount})`);
  const source = quoteService.buildQuotePlanPdfSource({ ...(db.quotes.get(q2) as Row), project: db.projects.get(PROJECT) } as never);
  const ellipticalPlaceholder = source.placeholders.find((p) => String(p.subCategory ?? "").includes("椭圆机")) as
    | { brand?: string; model?: string; quantity?: number; priceVerified?: boolean; productSource?: string }
    | undefined;
  assert(
    ellipticalPlaceholder?.brand === "Precor" &&
      ellipticalPlaceholder.model === "EFX 885" &&
      ellipticalPlaceholder.quantity === 9 &&
      ellipticalPlaceholder.productSource === "customer-specified" &&
      ellipticalPlaceholder.priceVerified === true,
    `A. Q2 plan source renders customer-specified Precor EFX 885 × 9, price verified (got ${json(ellipticalPlaceholder)})`,
  );
  out("✓ A. revision with baseQuoteId=Q1 → NEW Q2; productSelections byte-identical (custom Precor EFX 885 × 9 + full priceFact, explicit qty 13, remove, decidedAt / decidedBy); revised notes / 300㎡ from request; Q1 immutable; base read by id before any write");
  return q2;
}

async function checkExpiredPriceFact(f: Fixtures, q2: string) {
  const catalog = storedSelections(q2).find((s) => s.slotKey === f.catalogSlot.slotKey)!;
  assert(catalog.action === "replace" && catalog.candidate?.candidateId === f.catalogSlot.candidates[1].candidateId && catalog.quantity === 4, "B. catalog replacement identity + qty preserved");
  assert(canonical(catalog.priceFact) === canonical(EXPIRED_PRICE_FACT), `B. expired priceFact preserved in full (got ${json(catalog.priceFact)})`);
  assert(EXPIRED_PRICE_FACT.validUntil < new Date().toISOString().slice(0, 10), "B. fixture priceFact is expired");
  const src = fs.readFileSync(path.join(ROOT, SERVICE), "utf8");
  const fn = src.slice(src.indexOf("export async function generateQuoteRevision("));
  const body = fn.slice(0, fn.indexOf("\n}\n") + 2);
  assert(body.includes("loadReadyQuoteForTenant(") && body.includes("readCompanyInfo(base.companyInfo).productSelections"), "B. revision reads stored selections via the canonical stored reader");
  assert(!/resolveProductSelectionInputs|validatePriceFact|buildCandidateSlots/.test(body), "B. inherited selections never re-validated / re-resolved");
  out("✓ B. expired priceFact (validUntil 2025-03-31) + catalog candidate identity carried over unchanged; no resolveProductSelectionInputs re-validation");
}

async function checkExplicitBaseNotLatest(f: Fixtures) {
  const q3 = await version(f.q1, PROJECT, ORG, f.selectionsFor(8));
  assert(storedSelections(q3).find((s) => s.slotKey === ELLIPTICAL_SLOT)!.quantity === 8, "C. Q3 (latest) has elliptical × 8");
  const fromQ1 = await postGenerate(revision(f.q1));
  const viaQ1 = assertNewQuote(fromQ1, "C. revise Q1 after Q3");
  assert(storedSelections(viaQ1).find((s) => s.slotKey === ELLIPTICAL_SLOT)!.quantity === 9, "C. based on explicit Q1 → × 9, not latest Q3 × 8");
  assert(canonical(storedSelections(viaQ1)) === canonical(storedSelections(f.q1)), "C. selections equal Q1, not Q3");
  const fromQ3 = await postGenerate(revision(q3));
  const viaQ3 = assertNewQuote(fromQ3, "C. revise Q3");
  assert(canonical(storedSelections(viaQ3)) === canonical(storedSelections(q3)), "C. based on Q3 → Q3 selections");
  out("✓ C. explicit base wins: revising Q1 after newer Q3 inherits Q1 (× 9), revising Q3 inherits Q3 (× 8); no findFirst / findMany");
}

async function checkFirstGenerationAndInjection(f: Fixtures) {
  const { baseQuoteId: _omit, ...first } = revision(undefined);
  void _omit;
  const r = await postGenerate(first);
  const q = assertNewQuote(r, "D. first generation");
  assert(!r.calls.some((c) => c.model === "quote" && c.method === "findUnique"), "D. first generation reads no base Quote");
  assert(json(r.calls.map((c) => `${c.model}.${c.method}`)) === json(["project.findUnique", "quote.create", "quote.update"]), `D. first generation call sequence unchanged (got ${json(r.calls.map((c) => `${c.model}.${c.method}`))})`);
  const info = db.quotes.get(q)!.companyInfo as Record<string, unknown>;
  assert(!("productSelections" in info), "D. first generation stores no productSelections");
  assert(json(Object.keys(info).sort()) === json(["areaM2", "city", "companyName", "industry", "notes", "targetUsers"]), `D. first generation companyInfo shape unchanged (got ${json(Object.keys(info))})`);

  const injected = [
    { slotKey: ELLIPTICAL_SLOT, action: "replace", candidate: { candidateId: "custom:evil:x", brand: "Evil", model: "X", source: "customer-specified", verificationStatus: "unverified" }, quantity: 50, priceFact: { ...PRICE_FACT, unitPrice: 1 }, decidedAt: "2020-01-01" },
  ];
  const noBase = await postGenerate({ ...first, productSelections: injected, companyInfo: { companyName: "C4 Corp", productSelections: injected } });
  const qNoBase = assertNewQuote(noBase, "E. injected selections, no base");
  assert(!("productSelections" in (db.quotes.get(qNoBase)!.companyInfo as Record<string, unknown>)), "E. injected selections ignored without base");
  const withBase = await postGenerate(revision(f.q1, { productSelections: injected, companyInfo: { companyName: "C4 Corp", productSelections: injected } }));
  const qWithBase = assertNewQuote(withBase, "E. injected selections + base");
  assert(canonical(storedSelections(qWithBase)) === canonical(storedSelections(f.q1)), "E. with base: exactly Q1 selections, injected ignored");
  assert(!json(db.quotes.get(qWithBase)!.companyInfo).includes("Evil"), "E. no injected product persisted");
  out("✓ D. first generation (no baseQuoteId): no base read, call sequence + companyInfo shape unchanged, no selections");
  out("✓ E. client productSelections (top-level and companyInfo) ignored with and without base");
}

async function checkRejections(f: Fixtures) {
  const generating = `q-c4-generating-${++db.seq}`;
  const failed = `q-c4-failed-${++db.seq}`;
  for (const [id, status] of [[generating, "GENERATING"], [failed, "FAILED"]] as const) {
    db.quotes.set(id, { ...structuredClone(db.quotes.get(f.q1)!), id, status });
  }
  const cases: Array<[string, unknown, { status: number; code?: string }, Record<string, unknown>?]> = [
    ["blank baseQuoteId", "", { status: 400, code: "BASE_QUOTE_ID_REQUIRED" }],
    ["whitespace baseQuoteId", "   ", { status: 400, code: "BASE_QUOTE_ID_REQUIRED" }],
    ["null baseQuoteId", null, { status: 400, code: "BASE_QUOTE_ID_REQUIRED" }],
    ["numeric baseQuoteId", 123, { status: 400, code: "BASE_QUOTE_ID_REQUIRED" }],
    ["object baseQuoteId", { id: f.q1 }, { status: 400, code: "BASE_QUOTE_ID_REQUIRED" }],
    ["nonexistent base", "q-c4-missing", { status: 404 }],
    ["cross-org base", f.foreign, { status: 403, code: "TENANT_ISOLATION" }],
    ["cross-org base with its own project id", f.foreign, { status: 403, code: "TENANT_ISOLATION" }, { projectId: FOREIGN_PROJECT }],
    ["cross-project base", f.q1, { status: 409, code: "QUOTE_PROJECT_MISMATCH" }, { projectId: OTHER_PROJECT }],
    ["GENERATING base", generating, { status: 409 }],
    ["FAILED base", failed, { status: 409 }],
  ];
  for (const [label, baseQuoteId, expected, extra] of cases) {
    const snapshot = quotesSnapshot();
    const count = db.quotes.size;
    const r = await postGenerate(revision(baseQuoteId, extra ?? {}));
    assert(r.status === expected.status, `F. ${label}: status ${expected.status} (got ${r.status} ${json(r.body)})`);
    assert(r.body.ok === false, `F. ${label}: ok=false`);
    if (expected.code) assert(r.body.code === expected.code, `F. ${label}: code ${expected.code} (got ${r.body.code})`);
    assert(writesOf(r).length === 0, `F. ${label}: zero Prisma writes (got ${json(writesOf(r).map((c) => `${c.model}.${c.method}`))})`);
    assert(db.quotes.size === count && quotesSnapshot() === snapshot, `F. ${label}: no Quote created / changed`);
    assert(json(r.effects) === json({ usage: 0, growth: 0, crm: 0, sales: 0 }), `F. ${label}: zero usage / growth / CRM / sales (got ${json(r.effects)})`);
    assert(!r.calls.some((c) => c.method === "findFirst" || c.method === "findMany"), `F. ${label}: no latest fallback`);
  }
  out("✓ F. blank / whitespace / null / number / object baseQuoteId → 400 BASE_QUOTE_ID_REQUIRED; missing → 404; cross-org → 403 TENANT_ISOLATION; cross-project → 409 QUOTE_PROJECT_MISMATCH; GENERATING / FAILED → 409; zero writes, zero usage, no fallback");
}

async function checkOrphan(f: Fixtures) {
  const orphanBase = `q-c4-orphan-${++db.seq}`;
  const q1 = structuredClone(db.quotes.get(f.q1)!);
  const selections = storedSelections(f.q1);
  const orphan = { ...structuredClone(selections.find((s) => s.slotKey === ELLIPTICAL_SLOT)!), slotKey: ORPHAN_SLOT };
  const companyInfo = { ...(q1.companyInfo as Record<string, unknown>), productSelections: [...selections, orphan] };
  db.quotes.set(orphanBase, { ...q1, id: orphanBase, companyInfo });
  const r = await postGenerate(revision(orphanBase));
  const q = assertNewQuote(r, "G. orphan base");
  const inherited = storedSelections(q);
  assert(canonical(inherited) === canonical([...selections, orphan]), "G. orphaned selection preserved verbatim");
  const pi = (db.quotes.get(q)!.content as { productIntelligence: { appliedSelectionCount: number; selectionWarnings: string[] } }).productIntelligence;
  assert(pi.appliedSelectionCount === 4 && pi.selectionWarnings.some((w) => w.includes(ORPHAN_SLOT)), `G. orphan ignored by application with a warning (got ${json(pi)})`);
  out("✓ G. orphaned stored selection carried over verbatim; existing overlay ignores it with a selectionWarning");
}

function fnSlice(src: string, start: string, end: string) {
  const a = src.indexOf(start);
  const b = src.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `source: ${start} … ${end}`);
  return src.slice(a, b);
}

function checkSource() {
  const page = fs.readFileSync(path.join(ROOT, PAGE), "utf8");
  const handler = fnSlice(page, "async function handleGenerate(", "const clarificationInvalid");
  assert(handler.includes('const baseQuoteId = isRevision ? trimQuoteId(quoteId) : "";'), "page: revision base = current quoteId");
  assert(/if \(isRevision\) \{\s*payload\.baseQuoteId = baseQuoteId;\s*\}/.test(handler), "page: baseQuoteId sent only on revision");
  const payloadAssignments = handler.match(/payload\.baseQuoteId\s*=[^;]*;/g) ?? [];
  assert(
    (handler.match(/\bbaseQuoteId\s*=(?!=)/g) ?? []).length === 2 && json(payloadAssignments) === json(["payload.baseQuoteId = baseQuoteId;"]),
    "page: no other baseQuoteId source (no latest inference)",
  );
  assert(handler.indexOf("payload.baseQuoteId") < handler.indexOf('fetch("/api/quote/generate"'), "page: baseQuoteId set before the request");
  assert(/if \(isRevision && res\.status === 409 && data\.code === QUOTE_PROJECT_MISMATCH_CODE\) \{\s*discardMismatchedQuote\(baseQuoteId, organizationId, nextProjectId\);\s*return;/.test(handler), "page: revision 409 mismatch → discardMismatchedQuote");
  const failAt = handler.indexOf("if (isRevision && data.ok !== true)");
  assert(failAt > 0 && failAt < handler.indexOf("setProposal(readyProposal)"), "page: failed revision returns before replacing the current version");
  assert(!/不会带入|需要在新版本中重新选择|window\.confirm/.test(handler) && !page.includes("不会带入这些选择"), "page: obsolete 'selections not carried' warning removed");
  assert(page.includes("已确认的设备选择与核实单价会带入新版本"), "page: revision copy states selections carry forward");
  assert(!handler.includes("productSelections"), "page: client never sends productSelections");

  const routeSrc = fs.readFileSync(path.join(ROOT, ROUTE), "utf8");
  assert(!routeSrc.includes("productSelections"), "route: never reads client productSelections");
  assert(routeSrc.indexOf('"BASE_QUOTE_ID_REQUIRED"') < routeSrc.indexOf("generateQuoteRevision({"), "route: blank base rejected before generation");
  out("✓ source: page sends baseQuoteId = current quoteId only on revision, handles 409 mismatch / failure without clobbering the current version, obsolete warning removed; route ignores client productSelections");
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
  const allowed = new Set([SERVICE, ROUTE, PAGE, VERIFIER]);
  for (const file of [...lines("git diff --name-only HEAD"), ...lines("git ls-files --others --exclude-standard")]) {
    if (knownDirty.has(file)) continue;
    assert(allowed.has(file), `C.4 scope: unexpected change ${file}`);
  }
  assert(lines("git diff --name-only HEAD -- prisma/schema.prisma lib/product-engine lib/templates lib/services/budget.service.ts lib/services/tender.service.ts app/api/pdf app/api/tender app/api/quote/product-intelligence").length === 0, "C.4 scope: no schema / engine / quantity / budget / tender / ZIP / PI route change");
  const serviceDiff = execSync(`git diff HEAD -- ${SERVICE}`, { cwd: ROOT, encoding: "utf8" });
  const removed = serviceDiff.split(/\r?\n/).filter((l) => l.startsWith("-") && !l.startsWith("---"));
  assert(removed.length === 0, `C.4 scope: quote.service only adds code (generateQuote untouched) (removed ${json(removed)})`);
  out("✓ scope: quote.service (additive) + generate route + quote page + this verifier; no schema / engine / Budget / Tender / ZIP change");
}

async function main() {
  const f = await buildFixtures();
  const q2 = await checkExactContinuity(f);
  await checkExpiredPriceFact(f, q2);
  await checkExplicitBaseNotLatest(f);
  await checkFirstGenerationAndInjection(f);
  await checkRejections(f);
  await checkOrphan(f);
  checkSource();
  checkScope();
  out("\nverify-c4-quote-revision-selection-continuity: ALL PASS");
}

main().catch((err) => {
  out(err);
  process.exit(1);
});

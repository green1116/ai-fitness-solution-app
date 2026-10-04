/**
 * C.3-B — Tender-Bound ZIP Delivery verification.
 * POST /api/pdf/tender/zip with a tenderId renders plan.pdf / budget.pdf / final-tender-pack.pdf
 * only from Tender.quoteId + Tender.budgetId (re-validated), never from the project's latest Budget;
 * production never provisions placeholder Project/Solution/Budget rows. Runs the real ZIP route,
 * real quote / budget / tender services and real PDF renderers (text recorded via pdf-lib
 * PDFPage.drawText) against an in-memory Prisma stub (entitlement + org gate stubbed).
 * No DB, no network, no files.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";

import JSZip from "jszip";
import type { NextRequest } from "next/server";

import type { BudgetItem } from "../lib/domain/tender";

const ROOT = path.resolve(__dirname, "..");
const ZIP_ROUTE = "app/api/pdf/tender/zip/route.ts";
const SERVICE = "lib/services/tender.service.ts";
const DOWNLOAD = "components/documents/downloadTenderPack.ts";
const TENDER_PAGE = "app/(product)/tender/page.tsx";
const PILOT_CENTER = "components/pilot/IntakeArtifactCenter.tsx";
const VERIFIER = "scripts/verify-c3-b-tender-zip-binding.ts";

const env = process.env as Record<string, string | undefined>;
delete env.ALLOW_DEBUG_API;
delete env.VERCEL_ENV;
delete env.DEV_ZIP_ALLOW_ALL;
delete env.DEV_ZIP_ALLOWED_PLAN_IDS;
const setNodeEnv = (value: "production" | "development") => {
  env.NODE_ENV = value;
};

const out = console.log.bind(console);
console.log = () => undefined;
console.info = () => undefined;
console.warn = () => undefined;

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function json(value: unknown) {
  return JSON.stringify(value);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const squash = (s: string) => s.replace(/\s+/g, "");

// ---------------------------------------------------------------------------
// In-memory Prisma stub (every call logged)
// ---------------------------------------------------------------------------

type Row = Record<string, unknown> & { id: string };
type Call = { model: string; method: string; args: unknown };

const db = {
  projects: new Map<string, Row>(),
  solutions: new Map<string, Row>(),
  quotes: new Map<string, Row>(),
  budgets: new Map<string, Row>(),
  tenders: new Map<string, Row>(),
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

function withProject(row: Row | undefined, include?: { project?: boolean }) {
  if (!row) return null;
  const result = structuredClone(row) as Row & { project?: Row };
  if (include?.project) {
    const project = db.projects.get(String(row.projectId));
    result.project = project ? structuredClone(project) : undefined;
  }
  return result;
}

function latestBudgetOf(projectId: string) {
  return [...db.budgets.values()]
    .filter((b) => b.projectId === projectId)
    .sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime())[0];
}

function insert(map: Map<string, Row>, prefix: string, data: Record<string, unknown>, defaults: Record<string, unknown> = {}) {
  const now = nextDate();
  const row: Row = { id: `${prefix}-${db.seq}`, createdAt: now, updatedAt: now, ...defaults, ...structuredClone(data) };
  map.set(row.id, row);
  return structuredClone(row);
}

function update(map: Map<string, Row>, label: string, where: { id: string }, data: Record<string, unknown>) {
  const row = map.get(where.id);
  if (!row) throw new Error(`${label} ${where.id} not found`);
  Object.assign(row, structuredClone(data), { updatedAt: nextDate() });
  return structuredClone(row);
}

const models: Record<string, Record<string, (args: never) => Promise<unknown>>> = {
  project: {
    findUnique: async ({ where }: { where: { id: string } }) => clone(db.projects.get(where.id)),
    findFirst: async ({ where, include }: { where: { id: string }; include?: Record<string, unknown> }) => {
      const row = db.projects.get(where.id);
      if (!row) return null;
      const result = structuredClone(row) as Row;
      if (include) {
        result.solution = clone([...db.solutions.values()].find((s) => s.projectId === row.id)) ?? null;
        result.placeholders = [];
        const latest = latestBudgetOf(row.id);
        result.budgets = latest ? [structuredClone(latest)] : [];
      }
      return result;
    },
    create: async ({ data }: { data: Record<string, unknown> }) => insert(db.projects, "p", data, { organizationId: null }),
  },
  solution: {
    create: async ({ data }: { data: Record<string, unknown> }) => insert(db.solutions, "s", data),
  },
  quote: {
    create: async ({ data }: { data: Record<string, unknown> }) =>
      insert(db.quotes, "q", data, { content: null, orchestrationId: null }),
    update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => update(db.quotes, "quote", where, data),
    findUnique: async ({ where, include }: { where: { id: string }; include?: { project?: boolean } }) =>
      withProject(db.quotes.get(where.id), include),
  },
  budget: {
    create: async ({ data }: { data: Record<string, unknown> }) => insert(db.budgets, "b", data),
    findUnique: async ({ where }: { where: { id: string } }) => clone(db.budgets.get(where.id)),
    findFirst: async () => {
      const rows = [...db.budgets.values()];
      return clone(rows[rows.length - 1]);
    },
  },
  tender: {
    create: async ({ data }: { data: Record<string, unknown> }) => insert(db.tenders, "t", data),
    update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => update(db.tenders, "tender", where, data),
    findUnique: async ({ where }: { where: { id: string } }) => clone(db.tenders.get(where.id)),
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
// Entitlement + org gate stubs (legacy ZIP entitlement still evaluated by the real evaluateZipAccess)
// ---------------------------------------------------------------------------

const ORG = "org-c3b";
const OTHER_ORG = "org-c3b-other";
const gate = { sessionOrg: ORG as string | null, calls: 0, endpoints: [] as string[] };

class NamedError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}

stubModule("lib/auth/currentUser", { getCurrentUser: async () => null });
stubModule("lib/entitlements/publicEntitlement", { toSafeEntitlementsDebug: () => ({}) });
stubModule("lib/entitlements/resolveEntitlement", {
  resolveRequestEntitlement: async ({ planId }: { planId: string }) => ({
    entitlement: { effectiveLevel: "enterprise", zipEnabled: true, budgetEnabled: true },
    debug: {
      planId,
      paidOrders: [],
      allOrders: [],
      orderWinner: null,
      licenseWinner: null,
      licenseCandidates: [],
      finalRank: 2,
      winningSource: "c3b-stub",
    },
    source: "c3b-stub",
    userId: "user-c3b",
  }),
});
stubModule("lib/saas/api-gate", {
  runSaasOrgGate: async (req: Request, endpoint: string) => {
    gate.calls += 1;
    gate.endpoints.push(endpoint);
    if (!gate.sessionOrg) throw new NamedError("SaasAuthError", "Authentication required");
    const requested = (req.headers.get("x-organization-id") || "").trim();
    if (requested !== gate.sessionOrg) throw new NamedError("TenantIsolationError", "Organization mismatch");
    return { userId: "user-c3b", organizationId: gate.sessionOrg, traceId: "trace-c3b" };
  },
});

let provisionCalls = 0;
/* eslint-disable @typescript-eslint/no-require-imports */
const realProvision = require("../lib/services/tender/provisionZipProjectMinimal") as typeof import("../lib/services/tender/provisionZipProjectMinimal");
stubModule("lib/services/tender/provisionZipProjectMinimal", {
  provisionZipProjectMinimal: async (input: Parameters<typeof realProvision.provisionZipProjectMinimal>[0]) => {
    provisionCalls += 1;
    return realProvision.provisionZipProjectMinimal(input);
  },
});

// ---------------------------------------------------------------------------
// Real renderers, wrapped to capture arguments and label drawn text per document
// ---------------------------------------------------------------------------

const pdfLib = require("pdf-lib") as typeof import("pdf-lib");
type Drawn = { doc: string; text: string };
const drawn: Drawn[] = [];
let currentDoc = "";
const originalDrawText = pdfLib.PDFPage.prototype.drawText;
pdfLib.PDFPage.prototype.drawText = function (this: InstanceType<typeof pdfLib.PDFPage>, value: string, options?: unknown) {
  drawn.push({ doc: currentDoc || "other", text: String(value) });
  return originalDrawText.call(this, value, options as never);
};

const realPlan = require("../lib/pdf/renderPlanPdf") as typeof import("../lib/pdf/renderPlanPdf");
const realBudget = require("../lib/pdf/renderBudgetPdf") as typeof import("../lib/pdf/renderBudgetPdf");
const realPack = require("../lib/pdf/renderTenderPack") as typeof import("../lib/pdf/renderTenderPack");

const captured = { plan: [] as unknown[][], budget: [] as unknown[][], pack: [] as unknown[][] };

function labelled<A extends unknown[], R>(doc: keyof typeof captured, fn: (...args: A) => Promise<R>) {
  return async (...args: A): Promise<R> => {
    captured[doc].push(args);
    const previous = currentDoc;
    if (!previous) currentDoc = doc;
    try {
      return await fn(...args);
    } finally {
      currentDoc = previous;
    }
  };
}

stubModule("lib/pdf/renderPlanPdf", { ...realPlan, renderPlanPdf: labelled("plan", realPlan.renderPlanPdf) });
stubModule("lib/pdf/renderBudgetPdf", { ...realBudget, renderBudgetPdf: labelled("budget", realBudget.renderBudgetPdf) });
stubModule("lib/pdf/renderTenderPack", { ...realPack, renderTenderPack: labelled("pack", realPack.renderTenderPack) });

const quoteService = require("../lib/services/quote.service") as typeof import("../lib/services/quote.service");
const budgetService = require("../lib/services/budget.service") as typeof import("../lib/services/budget.service");
const tenderService = require("../lib/services/tender.service") as typeof import("../lib/services/tender.service");
const zipRoute = require("../app/api/pdf/tender/zip/route") as typeof import("../app/api/pdf/tender/zip/route");
/* eslint-enable @typescript-eslint/no-require-imports */

type Selection = import("../lib/product-engine/product-intelligence").ProductSelection;

// ---------------------------------------------------------------------------
// Fixtures through the real services
// ---------------------------------------------------------------------------

const PROJECT = "p-c3b";
const OTHER_PROJECT = "p-c3b-other";
const FOREIGN_PROJECT = "p-c3b-foreign";
const EMPTY_PROJECT = "p-c3b-empty";
const TREADMILL_SLOT = "有氧设备|商业级跑步机";
const ELLIPTICAL_SLOT = "有氧设备|椭圆机";
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

function projectRow(id: string, organizationId: string): Row {
  const now = nextDate();
  return {
    id,
    name: "C3B投标交付绑定验收",
    clientName: "C3B Corp",
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

async function quoteVersion(projectId: string, organizationId: string, ellipticalQuantity: number) {
  const base = await quoteService.generateQuote({
    projectId,
    workspaceId: "ws-c3b",
    organizationId,
    companyInfo: { companyName: "C3B Corp", targetUsers: 200, areaM2: 400 },
  });
  const version = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: base.quote.id,
    organizationId,
    projectId,
    decidedBy: "user-c3b",
    selections: [
      { slotKey: TREADMILL_SLOT, action: "confirm", candidateId: null, quantity: 13 },
      {
        slotKey: ELLIPTICAL_SLOT,
        action: "replace",
        customProduct: { brand: "Precor", model: "EFX 885" },
        quantity: ellipticalQuantity,
        priceFact: PRICE_FACT,
      },
    ],
  });
  assert(version.quote.status === "READY", "fixture Quote version READY");
  return version.quote.id;
}

async function budgetFor(quoteId: string, projectId: string, organizationId: string) {
  const result = await budgetService.calculateBudget({ quoteId, organizationId, projectId, budgetTier: "mid" });
  return result.budget.id;
}

async function tenderFor(projectId: string, quoteId: string, budgetId: string, organizationId: string) {
  const { tender } = await tenderService.generateTender({ projectId, quoteId, budgetId, organizationId });
  assert(db.tenders.get(tender.id)!.status === "READY", "fixture Tender READY");
  return tender.id;
}

function rawTender(data: Record<string, unknown>) {
  const now = nextDate();
  const id = `t-raw-${db.seq}`;
  db.tenders.set(id, { id, status: "READY", fileName: null, fileUrl: null, createdAt: now, updatedAt: now, ...data });
  return id;
}

async function buildFixtures() {
  db.projects.set(PROJECT, projectRow(PROJECT, ORG));
  db.projects.set(OTHER_PROJECT, projectRow(OTHER_PROJECT, ORG));
  db.projects.set(FOREIGN_PROJECT, projectRow(FOREIGN_PROJECT, OTHER_ORG));
  db.projects.set(EMPTY_PROJECT, projectRow(EMPTY_PROJECT, ORG));

  const q1 = await quoteVersion(PROJECT, ORG, 9);
  const b1 = await budgetFor(q1, PROJECT, ORG);
  const t1 = await tenderFor(PROJECT, q1, b1, ORG);

  const failedQuote = await quoteVersion(PROJECT, ORG, 9);
  const failedQuoteBudget = await budgetFor(failedQuote, PROJECT, ORG);

  const otherQuote = await quoteVersion(OTHER_PROJECT, ORG, 9);
  const otherBudget = await budgetFor(otherQuote, OTHER_PROJECT, ORG);

  const foreignQuote = await quoteVersion(FOREIGN_PROJECT, OTHER_ORG, 9);
  const foreignBudget = await budgetFor(foreignQuote, FOREIGN_PROJECT, OTHER_ORG);
  const foreignTender = await tenderFor(FOREIGN_PROJECT, foreignQuote, foreignBudget, OTHER_ORG);

  const forgedBudget = `b-forged-${++db.seq}`;
  db.budgets.set(forgedBudget, { ...structuredClone(db.budgets.get(b1)!), id: forgedBudget, projectId: OTHER_PROJECT });
  const legacyBudget = `b-legacy-${++db.seq}`;
  db.budgets.set(legacyBudget, {
    ...structuredClone(db.budgets.get(b1)!),
    id: legacyBudget,
    createdAt: new Date(Date.UTC(2020, 0, 1)),
    assumptions: ["当前预算为投标阶段建议区间，不代表最终成交价。"],
  });

  return { q1, b1, t1, failedQuote, failedQuoteBudget, otherQuote, otherBudget, foreignTender, forgedBudget, legacyBudget };
}

type Fixtures = Awaited<ReturnType<typeof buildFixtures>> & { q2: string; b2: string; t2: string };

function ellipticalItem(budgetId: string): BudgetItem {
  const items = db.budgets.get(budgetId)!.items as BudgetItem[];
  const found = items.filter((i) => String(i.name ?? i.category).includes("椭圆机"));
  assert(found.length === 1, `exactly one elliptical row in ${budgetId}`);
  return found[0];
}

function ellipticalSelection(quoteId: string): Selection {
  const stored = (db.quotes.get(quoteId)!.companyInfo as { productSelections: Selection[] }).productSelections;
  return stored.find((s) => s.slotKey === ELLIPTICAL_SLOT)!;
}

function rowCounts() {
  return json({
    projects: db.projects.size,
    solutions: db.solutions.size,
    quotes: db.quotes.size,
    budgets: db.budgets.size,
    tenders: db.tenders.size,
  });
}

function commercialSnapshot() {
  return json({
    projects: [...db.projects.entries()],
    quotes: [...db.quotes.entries()],
    budgets: [...db.budgets.entries()],
    tenders: [...db.tenders.entries()],
  });
}

// ---------------------------------------------------------------------------
// Route harness
// ---------------------------------------------------------------------------

type ZipResult = {
  status: number;
  contentType: string;
  body?: { ok?: boolean; code?: string; message?: string };
  files?: Record<string, Buffer>;
  text: Record<"plan" | "budget" | "pack", string[]>;
  calls: Call[];
  args: { plan: unknown[][]; budget: unknown[][]; pack: unknown[][] };
};

async function postZip(body: Record<string, unknown>, organizationId: string | null = ORG): Promise<ZipResult> {
  drawn.length = 0;
  captured.plan.length = 0;
  captured.budget.length = 0;
  captured.pack.length = 0;
  const callsBefore = db.calls.length;
  const req = new Request("http://localhost/api/pdf/tender/zip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(organizationId ? { "x-organization-id": organizationId } : {}),
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
  const res = await zipRoute.POST(req);
  const contentType = res.headers.get("content-type") || "";
  const result: ZipResult = {
    status: res.status,
    contentType,
    text: {
      plan: drawn.filter((d) => d.doc === "plan").map((d) => d.text),
      budget: drawn.filter((d) => d.doc === "budget").map((d) => d.text),
      pack: drawn.filter((d) => d.doc === "pack").map((d) => d.text),
    },
    calls: db.calls.slice(callsBefore),
    args: { plan: [...captured.plan], budget: [...captured.budget], pack: [...captured.pack] },
  };
  if (contentType.includes("application/zip")) {
    const zip = await JSZip.loadAsync(Buffer.from(await res.arrayBuffer()));
    result.files = {};
    for (const name of Object.keys(zip.files)) {
      result.files[name] = await zip.files[name].async("nodebuffer");
    }
  } else {
    result.body = (await res.json()) as ZipResult["body"];
  }
  return result;
}

function ellipticalRow(texts: string[], label: string) {
  const at = texts.findIndex((t) => t.startsWith("[核实] ") && t.includes("椭圆机"));
  assert(at >= 0, `${label}: elliptical row drawn`);
  return { name: texts[at], qty: texts[at + 1], price: texts[at + 2], subtotal: texts[at + 3] };
}

function assertNoLatestSelector(result: ZipResult, label: string) {
  const offenders = result.calls.filter(
    (c) => c.method === "findFirst" || c.method === "findMany" || json(c.args ?? null).includes("orderBy"),
  );
  assert(offenders.length === 0, `${label}: no latest-version selector (got ${json(offenders.map((c) => `${c.model}.${c.method}`))})`);
  const writes = result.calls.filter((c) => WRITE_METHODS.has(c.method));
  assert(writes.length === 0, `${label}: no Prisma writes (got ${json(writes.map((c) => `${c.model}.${c.method}`))})`);
}

function assertDelivered(
  result: ZipResult,
  label: string,
  expected: { budgetId: string; quantity: number; min: string; max: string; subtotal: string },
  forbidden: { quantity: number; min: string; max: string; subtotal: string },
) {
  assert(result.status === 200 && result.contentType.includes("application/zip"), `${label}: 200 application/zip (got ${result.status} ${json(result.body)})`);
  for (const name of ["plan.pdf", "budget.pdf", "final-tender-pack.pdf"]) {
    const file = result.files?.[name];
    assert(Boolean(file) && file!.subarray(0, 5).toString() === "%PDF-", `${label}: ${name} is a PDF`);
  }
  assert(result.args.budget.length === 1 && result.args.pack.length === 1 && result.args.plan.length === 1, `${label}: one render per document`);
  const budgetArg = result.args.budget[0][0] as Row;
  const packArg = result.args.pack[0][0] as { budget: Row; placeholders: Array<{ subCategory?: string; quantity?: number }> };
  assert(budgetArg.id === expected.budgetId, `${label}: budget.pdf rendered from ${expected.budgetId} (got ${budgetArg.id})`);
  assert(packArg.budget.id === expected.budgetId, `${label}: final-tender-pack.pdf rendered from ${expected.budgetId}`);

  const budgetRow = ellipticalRow(result.text.budget, `${label} budget.pdf`);
  assert(budgetRow.name.includes("Precor") || budgetRow.name.endsWith("…") || budgetRow.name.endsWith("..."), `${label}: budget row names the customer-specified product`);
  assert(budgetRow.qty === `${expected.quantity}-${expected.quantity}`, `${label}: budget.pdf elliptical qty ${expected.quantity} (got ${budgetRow.qty})`);
  assert(budgetRow.price === "50,000", `${label}: budget.pdf verified unit price 50,000 (got ${budgetRow.price})`);
  assert(budgetRow.subtotal === `${expected.subtotal}-${expected.subtotal}`, `${label}: budget.pdf elliptical subtotal ${expected.subtotal} (got ${budgetRow.subtotal})`);
  const packRow = ellipticalRow(result.text.pack, `${label} final-tender-pack.pdf`);
  assert(packRow.qty === budgetRow.qty && packRow.subtotal === budgetRow.subtotal, `${label}: final-tender-pack.pdf elliptical row equals budget.pdf`);

  const budgetFlat = squash(result.text.budget.join(""));
  const packFlat = squash(result.text.pack.join(""));
  for (const [doc, flat] of [["budget.pdf", budgetFlat], ["final-tender-pack.pdf", packFlat]] as const) {
    assert(flat.includes(expected.min) && flat.includes(expected.max), `${label}: ${doc} totals ${expected.min}–${expected.max}`);
    assert(!flat.includes(forbidden.min) && !flat.includes(forbidden.max), `${label}: ${doc} has no ${forbidden.min}–${forbidden.max}`);
    assert(!flat.includes(`${forbidden.subtotal}-${forbidden.subtotal}`), `${label}: ${doc} has no ${forbidden.subtotal} elliptical subtotal`);
  }

  const planFlat = squash(result.text.plan.join(""));
  assert(planFlat.includes(`确认数量：${expected.quantity}台/套`), `${label}: plan.pdf elliptical 确认数量 ${expected.quantity}`);
  assert(!planFlat.includes(`确认数量：${forbidden.quantity}台/套`), `${label}: plan.pdf has no 确认数量 ${forbidden.quantity}`);
  const packPlanQty = packArg.placeholders.filter((p) => String(p.subCategory ?? "").includes("椭圆机")).map((p) => p.quantity);
  assert(json(packPlanQty) === json([expected.quantity]), `${label}: Tender Pack placeholders carry elliptical ${expected.quantity} (got ${json(packPlanQty)})`);
  assert(!budgetFlat.includes("投标企业") && !planFlat.includes("投标企业"), `${label}: no placeholder company`);

  assertNoLatestSelector(result, label);
  return { budgetRow, planFlat, budgetFlat, packFlat };
}

// ---------------------------------------------------------------------------
// A–J
// ---------------------------------------------------------------------------

const T1_EXPECT = { quantity: 9, min: "685,000", max: "949,000", subtotal: "450,000" };
const T2_EXPECT = { quantity: 8, min: "635,000", max: "899,000", subtotal: "400,000" };

async function checkT1Before(f: Awaited<ReturnType<typeof buildFixtures>>) {
  const r = await postZip({ projectId: PROJECT, planId: PROJECT, tenderId: f.t1 });
  const delivered = assertDelivered(r, "A. T1", { budgetId: f.b1, ...T1_EXPECT }, T2_EXPECT);
  out("✓ A. T1 (Q1 Precor EFX 885 × 9 + B1 685000–949000, verified 50000) → plan / budget / pack render exactly that pair");
  return delivered;
}

async function createSecondVersion(f: Awaited<ReturnType<typeof buildFixtures>>): Promise<Fixtures> {
  const q2 = await quoteVersion(PROJECT, ORG, 8);
  const b2 = await budgetFor(q2, PROJECT, ORG);
  const t2 = await tenderFor(PROJECT, q2, b2, ORG);
  assert(latestBudgetOf(PROJECT)!.id === b2, "B. B2 is now the project's latest Budget");
  assert(db.budgets.get(b2)!.totalEstimateMin === 635000 && db.budgets.get(b2)!.totalEstimateMax === 899000, "B. B2 = 635000–899000");
  assert(db.tenders.get(t2)!.quoteId === q2 && db.tenders.get(t2)!.budgetId === b2, "B. T2 bound to Q2 + B2");
  assert(db.tenders.get(f.t1)!.quoteId === f.q1 && db.tenders.get(f.t1)!.budgetId === f.b1, "B. T1 binding untouched");
  out("✓ B. Q2 (× 8) → B2 (635000–899000) → T2; B2 is now the latest Budget; T1 binding untouched");
  return { ...f, q2, b2, t2 };
}

async function checkT1After(f: Fixtures, before: Awaited<ReturnType<typeof checkT1Before>>) {
  const r = await postZip({ projectId: PROJECT, planId: PROJECT, tenderId: f.t1 });
  const after = assertDelivered(r, "C. T1 after T2", { budgetId: f.b1, ...T1_EXPECT }, T2_EXPECT);
  assert(json(after.budgetRow) === json(before.budgetRow), "C. T1 budget row identical before / after T2");
  out("✓ C. T1 re-downloaded after T2: still 9 / 685000–949000 / 450000; no 8, no 635000–899000, no 400000");
}

async function checkT2(f: Fixtures) {
  const r = await postZip({ projectId: PROJECT, planId: PROJECT, tenderId: f.t2 });
  assertDelivered(r, "D. T2", { budgetId: f.b2, ...T2_EXPECT }, T1_EXPECT);
  out("✓ D. T2: 8 / 635000–899000 / elliptical subtotal 400000; no 9, no 685000–949000");
  return r;
}

function checkPriceFacts(f: Fixtures, t1: Awaited<ReturnType<typeof checkT1Before>>, t2: ZipResult) {
  for (const [label, budgetId, quoteId] of [["T1", f.b1, f.q1], ["T2", f.b2, f.q2]] as const) {
    const item = ellipticalItem(budgetId);
    assert(item.priceBasis === "VERIFIED" && json(item.priceFact) === json(PRICE_FACT), `E. ${label} Budget row keeps VERIFIED price fact`);
    assert(json(ellipticalSelection(quoteId).priceFact) === json(PRICE_FACT), `E. ${label} Quote selection keeps price fact`);
  }
  const t2Budget = squash(t2.text.budget.join(""));
  const t2Plan = squash(t2.text.plan.join(""));
  for (const [label, budgetFlat, planFlat] of [["T1", t1.budgetFlat, t1.planFlat], ["T2", t2Budget, t2Plan]] as const) {
    for (const token of ["核实单价来源", "C2B-PROD-001", "上海测试器材供应商", "2026-12-31"]) {
      assert(budgetFlat.includes(squash(token)), `E. ${label} budget.pdf discloses ${token}`);
    }
    assert(planFlat.includes("单价已核实，详见预算"), `E. ${label} plan.pdf: 单价已核实，详见预算`);
    assert(!/上海测试器材供应商|C2B-PROD-001|有效期至/.test(planFlat), `E. ${label} plan.pdf has no procurement metadata`);
  }
  out("✓ E. priceFact + C.2-B disclosure (source / supplier / validity in budget.pdf; plan.pdf → 单价已核实，详见预算) preserved in T1 and T2");
}

async function expectZipRejected(
  label: string,
  body: Record<string, unknown>,
  expected: { status: number; code: string },
  organizationId: string | null = ORG,
) {
  const countsBefore = rowCounts();
  const snapshotBefore = commercialSnapshot();
  const provisionBefore = provisionCalls;
  const r = await postZip(body, organizationId);
  assert(r.status === expected.status, `${label}: status ${expected.status} (got ${r.status} ${json(r.body)})`);
  assert(r.body?.ok === false && r.body.code === expected.code, `${label}: code ${expected.code} (got ${r.body?.code})`);
  assert(!r.files, `${label}: no ZIP delivered`);
  assert(r.args.plan.length + r.args.budget.length + r.args.pack.length === 0, `${label}: nothing rendered`);
  assert(rowCounts() === countsBefore && commercialSnapshot() === snapshotBefore, `${label}: no row created / changed`);
  assert(provisionCalls === provisionBefore, `${label}: provisionZipProjectMinimal not called`);
  assertNoLatestSelector(r, label);
  return r;
}

async function checkTamperedBindings(f: Fixtures) {
  const q2b1 = rawTender({ projectId: PROJECT, quoteId: f.q2, budgetId: f.b1 });
  const q1b2 = rawTender({ projectId: PROJECT, quoteId: f.q1, budgetId: f.b2 });
  const basisLess = rawTender({ projectId: PROJECT, quoteId: f.q1, budgetId: f.legacyBudget });
  const otherQuote = rawTender({ projectId: PROJECT, quoteId: f.otherQuote, budgetId: f.b1 });
  const forged = rawTender({ projectId: PROJECT, quoteId: f.q1, budgetId: f.forgedBudget });
  const failed = rawTender({ projectId: PROJECT, quoteId: f.failedQuote, budgetId: f.failedQuoteBudget });
  db.quotes.get(f.failedQuote)!.status = "FAILED";

  await expectZipRejected("F. Q2 + B1", { projectId: PROJECT, tenderId: q2b1 }, { status: 409, code: "BUDGET_QUOTE_MISMATCH" });
  await expectZipRejected("F. Q1 + B2", { projectId: PROJECT, tenderId: q1b2 }, { status: 409, code: "BUDGET_QUOTE_MISMATCH" });
  await expectZipRejected("F. basis-less Budget", { projectId: PROJECT, tenderId: basisLess }, { status: 409, code: "BUDGET_QUOTE_MISMATCH" });
  await expectZipRejected("F. other-project Quote", { projectId: PROJECT, tenderId: otherQuote }, { status: 409, code: "QUOTE_PROJECT_MISMATCH" });
  await expectZipRejected("F. other-project Budget claiming Q1", { projectId: PROJECT, tenderId: forged }, { status: 409, code: "BUDGET_PROJECT_MISMATCH" });
  await expectZipRejected("F. Quote FAILED", { projectId: PROJECT, tenderId: failed }, { status: 409, code: "QUOTE_NOT_READY" });
  for (const status of ["PENDING", "GENERATING", "FAILED"]) {
    const t = rawTender({ projectId: PROJECT, quoteId: f.q1, budgetId: f.b1, status });
    await expectZipRejected(`F. Tender ${status}`, { projectId: PROJECT, tenderId: t }, { status: 409, code: "TENDER_NOT_READY" });
  }
  out("✓ F. tampered bindings (Q2+B1, Q1+B2, basis-less, foreign Quote / Budget, Quote FAILED, Tender not READY) → 409; no latest fallback, nothing rendered");
}

async function checkMissingFacts(f: Fixtures) {
  const noQuote = rawTender({ projectId: PROJECT, quoteId: null, budgetId: f.b1 });
  const noBudget = rawTender({ projectId: PROJECT, quoteId: f.q1, budgetId: null });
  const deletedQuote = rawTender({ projectId: PROJECT, quoteId: "q-deleted", budgetId: f.b1 });
  const deletedBudget = rawTender({ projectId: PROJECT, quoteId: f.q1, budgetId: "b-deleted" });

  await expectZipRejected("G. blank tenderId", { projectId: PROJECT, tenderId: "  " }, { status: 400, code: "TENDER_ID_REQUIRED" });
  await expectZipRejected("G. null tenderId", { projectId: PROJECT, tenderId: null }, { status: 400, code: "TENDER_ID_REQUIRED" });
  await expectZipRejected("G. missing projectId", { tenderId: f.t1 }, { status: 400, code: "ZIP_BAD_REQUEST" });
  await expectZipRejected("G. nonexistent Tender", { projectId: PROJECT, tenderId: "t-missing" }, { status: 404, code: "TENDER_NOT_FOUND" });
  await expectZipRejected("G. Tender without quoteId", { projectId: PROJECT, tenderId: noQuote }, { status: 422, code: "TENDER_BINDING_INCOMPLETE" });
  await expectZipRejected("G. Tender without budgetId", { projectId: PROJECT, tenderId: noBudget }, { status: 422, code: "TENDER_BINDING_INCOMPLETE" });
  await expectZipRejected("G. Tender → deleted Quote", { projectId: PROJECT, tenderId: deletedQuote }, { status: 422, code: "TENDER_BINDING_INCOMPLETE" });
  await expectZipRejected("G. Tender → deleted Budget", { projectId: PROJECT, tenderId: deletedBudget }, { status: 422, code: "TENDER_BINDING_INCOMPLETE" });
  out("✓ G. blank / null tenderId → 400, missing projectId → 400, unknown Tender → 404, Tender missing quoteId / budgetId / rows → 422; no placeholder records");
}

async function checkProductionNoPlaceholder() {
  setNodeEnv("production");
  const legacyWrites = (r: ZipResult) => r.calls.filter((c) => WRITE_METHODS.has(c.method));
  for (const [label, projectId] of [["unknown project", "p-c3b-unknown"], ["project without Solution / Budget", EMPTY_PROJECT]] as const) {
    const countsBefore = rowCounts();
    const r = await postZip({ projectId, planId: projectId });
    assert(r.status === 422 && r.body?.code === "ZIP_DELIVERY_FACTS_MISSING", `H. ${label}: 422 ZIP_DELIVERY_FACTS_MISSING (got ${r.status} ${json(r.body)})`);
    assert(!r.files && !json(r.body).includes("投标企业") && !json(r.body).includes("1200"), `H. ${label}: no placeholder delivery`);
    assert(provisionCalls === 0, `H. ${label}: provisionZipProjectMinimal not called in production`);
    assert(rowCounts() === countsBefore && legacyWrites(r).length === 0, `H. ${label}: project / solution / budget counts unchanged, no writes`);
    assert(r.args.plan.length + r.args.budget.length + r.args.pack.length === 0, `H. ${label}: nothing rendered`);
  }

  setNodeEnv("development");
  const devBefore = JSON.parse(rowCounts()) as Record<string, number>;
  const dev = await postZip({ projectId: "p-c3b-dev-fixture", planId: "p-c3b-dev-fixture" });
  const devAfter = JSON.parse(rowCounts()) as Record<string, number>;
  assert(dev.status === 200 && provisionCalls === 1, "H. dev contrast: the legacy dev fixture still provisions locally");
  assert(devAfter.projects === devBefore.projects + 1 && devAfter.solutions === devBefore.solutions + 1 && devAfter.budgets === devBefore.budgets + 1, "H. dev contrast: provisioning writes are observable by this harness");
  setNodeEnv("production");
  out("✓ H. production: former provisioning condition → 422 ZIP_DELIVERY_FACTS_MISSING, provisionZipProjectMinimal never called, counts unchanged, no 投标企业 / 1200㎡ / 200 人 delivery (dev fixture isolated to non-production)");
}

async function checkTenantIsolation(f: Fixtures) {
  await expectZipRejected("I. T1 under another project of the same org", { projectId: OTHER_PROJECT, tenderId: f.t1 }, { status: 409, code: "TENDER_PROJECT_MISMATCH" });
  await expectZipRejected("I. foreign-org Tender with its own project", { projectId: FOREIGN_PROJECT, tenderId: f.foreignTender }, { status: 403, code: "TENANT_ISOLATION" });
  await expectZipRejected("I. foreign-org Tender under own project", { projectId: PROJECT, tenderId: f.foreignTender }, { status: 403, code: "TENANT_ISOLATION" });

  gate.sessionOrg = OTHER_ORG;
  await expectZipRejected("I. other-org member downloading T1", { projectId: PROJECT, tenderId: f.t1 }, { status: 403, code: "TENANT_ISOLATION" }, OTHER_ORG);
  await expectZipRejected("I. org header not matching session", { projectId: PROJECT, tenderId: f.t1 }, { status: 403, code: "TENANT_ISOLATION" }, ORG);
  gate.sessionOrg = null;
  await expectZipRejected("I. no session", { projectId: PROJECT, tenderId: f.t1 }, { status: 401, code: "ZIP_AUTH_REQUIRED" });
  await expectZipRejected("I. no org header", { projectId: PROJECT, tenderId: f.t1 }, { status: 401, code: "ZIP_AUTH_REQUIRED" }, null);
  gate.sessionOrg = ORG;
  assert(gate.endpoints.every((e) => e === "/api/pdf/tender/zip"), "I. org gate scoped to /api/pdf/tender/zip");
  out("✓ I. cross-project → 409 TENDER_PROJECT_MISMATCH; cross-org Tender / other-org member / header ≠ session → 403 TENANT_ISOLATION; no session → 401");
}

async function checkNoLatestSelector(f: Fixtures) {
  const tenderBound = await postZip({ projectId: PROJECT, planId: PROJECT, tenderId: f.t1 });
  assert(tenderBound.status === 200, "J. Tender-bound download succeeds");
  assert(!tenderBound.calls.some((c) => c.model === "project" && c.method === "findFirst"), "J. Tender path never calls project.findFirst (budgets[0])");
  assert(!tenderBound.calls.some((c) => c.model === "budget" && c.method === "findFirst"), "J. Tender path never calls budget.findFirst");
  assertNoLatestSelector(tenderBound, "J. Tender path");
  const lookups = tenderBound.calls.map((c) => `${c.model}.${c.method}:${(c.args as { where?: { id?: string } })?.where?.id}`);
  assert(
    json(lookups.sort()) === json([`budget.findUnique:${f.b1}`, `project.findUnique:${PROJECT}`, `quote.findUnique:${f.q1}`, `tender.findUnique:${f.t1}`].sort()),
    `J. Tender path reads exactly Tender → Project → Quote(id) → Budget(id) (got ${json(lookups)})`,
  );

  const legacy = await postZip({ projectId: PROJECT, planId: PROJECT });
  assert(legacy.calls.some((c) => c.model === "project" && c.method === "findFirst" && json(c.args).includes("orderBy")), "J. instrumentation detects the legacy latest-Budget selector");
  assert((legacy.args.budget[0]?.[0] as Row | undefined)?.id === f.b2, "J. contrast: legacy project-level path picks latest B2, Tender path picks bound B1");
  out("✓ J. Tender path reads exactly tender / project / quote / budget by id — no findFirst / findMany / orderBy (instrumented stub; legacy contrast picks latest B2)");
}

// ---------------------------------------------------------------------------
// Source + scope
// ---------------------------------------------------------------------------

function fnBody(src: string, signature: string) {
  const start = src.indexOf(signature);
  assert(start >= 0, `source: ${signature} present`);
  const next = src.indexOf("\nasync function ", start + signature.length);
  const nextExport = src.indexOf("\nexport ", start + signature.length);
  const end = [next, nextExport].filter((i) => i > 0).sort((a, b) => a - b)[0] ?? src.length;
  return src.slice(start, end);
}

function checkSource() {
  const route = read(ZIP_ROUTE);
  const tenderBound = fnBody(route, "async function resolveTenderBoundSource(");
  assert(tenderBound.includes("loadTenderDeliveryBinding(") && tenderBound.includes("buildQuotePlanPdfSource(quote)"), "route: Tender path uses loadTenderDeliveryBinding + exact Quote source");
  assert(!/budgets\[0\]|findFirst|loadProjectForZip|ensureProjectReadyForZip|provisionZipProjectMinimal|findQuotePlanPdfSourceForProject/.test(tenderBound), "route: Tender path has no latest / provisioning selector");
  const ensure = fnBody(route, "async function ensureProjectReadyForZip(");
  assert(ensure.indexOf("isProductionDelivery()") > 0 && ensure.indexOf("isProductionDelivery()") < ensure.indexOf("provisionZipProjectMinimal("), "route: production refusal precedes provisioning");
  assert(route.includes('"ZIP_DELIVERY_FACTS_MISSING"') && route.includes('"TENDER_ID_REQUIRED"'), "route: 422 / 400 fail-closed codes");
  for (const token of ["resolveRequestEntitlement(", "evaluateZipAccess(", "runSaasOrgGate(req, ZIP_ENDPOINT"]) {
    assert(route.includes(token), `route keeps ${token}`);
  }

  const service = read(SERVICE);
  const delivery = fnBody(service, "export async function loadTenderDeliveryBinding(");
  assert(!/findFirst|orderBy/.test(service), "service: no latest selector");
  assert(delivery.includes("assertResourceBelongsToTenant(") && delivery.includes("assertQuoteBudgetVersion("), "service: delivery binding checks tenant + Quote/Budget version");

  const download = read(DOWNLOAD);
  const tenderDownload = fnBody(download, "export async function downloadTenderPack(");
  assert(/projectId, planId: projectId, tenderId/.test(tenderDownload) && tenderDownload.includes('"x-organization-id"'), "downloadTenderPack sends projectId + tenderId + org header");
  assert(!/quoteId|budgetId/.test(download), "downloadTenderPack never sends quoteId / budgetId");
  const page = read(TENDER_PAGE);
  assert(page.includes("downloadTenderPack({ projectId, tenderId, organizationId })") && page.includes("setTenderId(generatedTenderId)"), "Tender page downloads the Tender it just generated");
  assert(read(PILOT_CENTER).includes("downloadPilotProjectZip(projectId)"), "pilot keeps its legacy project-level helper");
  out("✓ source: Tender path free of budgets[0] / findFirst / provisioning; production refusal precedes provisioning; client sends tenderId only; entitlement + org gate kept");
}

function checkScope() {
  const lines = (cmd: string) =>
    execSync(cmd, { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  const allowed = new Set([
    "app/api/tender/generate/route.ts",
    SERVICE,
    "scripts/verify-c3-a-tender-creation-binding.ts",
    ZIP_ROUTE,
    DOWNLOAD,
    TENDER_PAGE,
    PILOT_CENTER,
    VERIFIER,
  ]);
  const knownDirty = new Set([
    "lib/commercial/action-delivery/index.ts",
    "lib/payments/wechatProvider.ts",
    "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql",
    "login-gzip.html",
  ]);
  for (const file of [...lines("git diff --name-only HEAD"), ...lines("git ls-files --others --exclude-standard")]) {
    if (knownDirty.has(file)) continue;
    assert(allowed.has(file), `C.3-B scope: unexpected change ${file}`);
  }
  assert(lines("git diff --name-only HEAD -- prisma/schema.prisma lib/pdf lib/services/budget.service.ts lib/services/quote.service.ts").length === 0, "scope: no Prisma schema / PDF renderer / budget / quote service change");
  out("✓ scope (C.3-A files + ZIP route + download helper + Tender page + pilot helper import + verifiers; no Prisma / PDF / pricing change)");
}

async function main() {
  setNodeEnv("production");
  const base = await buildFixtures();
  const t1Before = await checkT1Before(base);
  const f = await createSecondVersion(base);
  await checkT1After(f, t1Before);
  const t2 = await checkT2(f);
  checkPriceFacts(f, t1Before, t2);
  await checkTamperedBindings(f);
  await checkMissingFacts(f);
  await checkProductionNoPlaceholder();
  await checkTenantIsolation(f);
  await checkNoLatestSelector(f);
  checkSource();
  checkScope();
  out("\nverify-c3-b-tender-zip-binding: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

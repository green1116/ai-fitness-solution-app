/**
 * C.3 N2 — tender-bound ZIP authorization follows the Product Tender SaaS subscription.
 * POST /api/pdf/tender/zip with a tenderId: org membership + project ownership + exact
 * Tender → Quote → Budget binding, then resolveOrganizationFeatures(org).flags.canGenerateTender.
 * The legacy planId entitlement neither grants nor upgrades that path; requests without tenderId
 * keep the legacy entitlement unchanged. Runs the real ZIP route, the real subscription resolver,
 * the real quote / budget / tender services and real PDF renderers against an in-memory Prisma stub
 * (legacy entitlement + org gate stubbed). No DB, no network, no files.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";

import JSZip from "jszip";
import type { NextRequest } from "next/server";

const ROOT = path.resolve(__dirname, "..");
const ZIP_ROUTE = "app/api/pdf/tender/zip/route.ts";
const VERIFIER = "scripts/verify-c3-n2-tender-zip-subscription.ts";

const env = process.env as Record<string, string | undefined>;
delete env.ALLOW_DEBUG_API;
delete env.VERCEL_ENV;
delete env.DEV_ZIP_ALLOW_ALL;
delete env.DEV_ZIP_ALLOWED_PLAN_IDS;
env.NODE_ENV = "production";

const out = console.log.bind(console);
console.log = () => undefined;
console.info = () => undefined;
console.warn = () => undefined;

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const json = (value: unknown) => JSON.stringify(value);
const squash = (s: string) => s.replace(/\s+/g, "");

// ---------------------------------------------------------------------------
// In-memory Prisma stub (every call logged) incl. Subscription for the real resolver
// ---------------------------------------------------------------------------

type Row = Record<string, unknown> & { id: string };
type Call = { model: string; method: string; args: unknown };

const db = {
  projects: new Map<string, Row>(),
  solutions: new Map<string, Row>(),
  quotes: new Map<string, Row>(),
  budgets: new Map<string, Row>(),
  tenders: new Map<string, Row>(),
  subscriptions: new Map<string, Row>(),
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

function latestBudgetOf(projectId: string) {
  return [...db.budgets.values()]
    .filter((b) => b.projectId === projectId)
    .sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime())[0];
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
  },
  solution: {
    create: async ({ data }: { data: Record<string, unknown> }) => insert(db.solutions, "s", data),
  },
  quote: {
    create: async ({ data }: { data: Record<string, unknown> }) =>
      insert(db.quotes, "q", data, { content: null, orchestrationId: null }),
    update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => update(db.quotes, "quote", where, data),
    findUnique: async ({ where, include }: { where: { id: string }; include?: { project?: boolean } }) => {
      const row = db.quotes.get(where.id);
      if (!row) return null;
      const result = structuredClone(row) as Row & { project?: Row };
      if (include?.project) result.project = clone(db.projects.get(String(row.projectId))) ?? undefined;
      return result;
    },
  },
  budget: {
    create: async ({ data }: { data: Record<string, unknown> }) => insert(db.budgets, "b", data),
    findUnique: async ({ where }: { where: { id: string } }) => clone(db.budgets.get(where.id)),
  },
  tender: {
    create: async ({ data }: { data: Record<string, unknown> }) => insert(db.tenders, "t", data),
    update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => update(db.tenders, "tender", where, data),
    findUnique: async ({ where }: { where: { id: string } }) => clone(db.tenders.get(where.id)),
  },
  subscription: {
    findFirst: async ({ where }: { where: { organizationId: string; status?: string } }) =>
      clone(
        [...db.subscriptions.values()]
          .filter((s) => s.organizationId === where.organizationId && (!where.status || s.status === where.status))
          .sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime())[0],
      ),
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
// Legacy entitlement (configurable, call-counted) + org gate stubs
// ---------------------------------------------------------------------------

const ORG_ENT = "org-n2-enterprise";
const ORG_PRO = "org-n2-pro";
const ORG_BASIC = "org-n2-basic";
const ORG_CANCELED = "org-n2-canceled";

const legacy = { level: "enterprise", zipEnabled: true, calls: 0 };
const gate = { sessionOrg: ORG_ENT as string | null, calls: 0 };

class NamedError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}

stubModule("lib/auth/currentUser", { getCurrentUser: async () => null });
stubModule("lib/entitlements/publicEntitlement", { toSafeEntitlementsDebug: () => ({}) });
stubModule("lib/entitlements/resolveEntitlement", {
  resolveRequestEntitlement: async ({ planId }: { planId: string }) => {
    legacy.calls += 1;
    return {
      entitlement: { effectiveLevel: legacy.level, zipEnabled: legacy.zipEnabled, budgetEnabled: true },
      debug: {
        planId,
        paidOrders: [],
        allOrders: [],
        orderWinner: null,
        licenseWinner: null,
        licenseCandidates: [],
        finalRank: legacy.level === "enterprise" ? 2 : legacy.level === "pro" ? 1 : 0,
        winningSource: "null-plan-license",
      },
      source: "n2-legacy-stub",
      userId: "user-n2",
    };
  },
});
stubModule("lib/saas/api-gate", {
  runSaasOrgGate: async (req: Request) => {
    gate.calls += 1;
    if (!gate.sessionOrg) throw new NamedError("SaasAuthError", "Authentication required");
    const requested = (req.headers.get("x-organization-id") || "").trim();
    if (requested !== gate.sessionOrg) throw new NamedError("TenantIsolationError", "Organization mismatch");
    return { userId: "user-n2", organizationId: gate.sessionOrg, traceId: "trace-n2" };
  },
});

let provisionCalls = 0;
stubModule("lib/services/tender/provisionZipProjectMinimal", {
  provisionZipProjectMinimal: async () => {
    provisionCalls += 1;
    throw new Error("provisioning must not run");
  },
});

// ---------------------------------------------------------------------------
// Real renderers, wrapped to capture arguments and budget.pdf text
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-require-imports */
const pdfLib = require("pdf-lib") as typeof import("pdf-lib");
const budgetText: string[] = [];
let inBudget = false;
const originalDrawText = pdfLib.PDFPage.prototype.drawText;
pdfLib.PDFPage.prototype.drawText = function (this: InstanceType<typeof pdfLib.PDFPage>, value: string, options?: unknown) {
  if (inBudget) budgetText.push(String(value));
  return originalDrawText.call(this, value, options as never);
};

const realPlan = require("../lib/pdf/renderPlanPdf") as typeof import("../lib/pdf/renderPlanPdf");
const realBudget = require("../lib/pdf/renderBudgetPdf") as typeof import("../lib/pdf/renderBudgetPdf");
const realPack = require("../lib/pdf/renderTenderPack") as typeof import("../lib/pdf/renderTenderPack");

const captured = { plan: [] as unknown[][], budget: [] as unknown[][], pack: [] as unknown[][] };
let renderDepth = 0;

function wrap<A extends unknown[], R>(doc: keyof typeof captured, fn: (...args: A) => Promise<R>) {
  return async (...args: A): Promise<R> => {
    if (renderDepth === 0) captured[doc].push(args);
    const markBudget = doc === "budget" && renderDepth === 0;
    renderDepth += 1;
    if (markBudget) inBudget = true;
    try {
      return await fn(...args);
    } finally {
      renderDepth -= 1;
      if (markBudget) inBudget = false;
    }
  };
}

stubModule("lib/pdf/renderPlanPdf", { ...realPlan, renderPlanPdf: wrap("plan", realPlan.renderPlanPdf) });
stubModule("lib/pdf/renderBudgetPdf", { ...realBudget, renderBudgetPdf: wrap("budget", realBudget.renderBudgetPdf) });
stubModule("lib/pdf/renderTenderPack", { ...realPack, renderTenderPack: wrap("pack", realPack.renderTenderPack) });

const quoteService = require("../lib/services/quote.service") as typeof import("../lib/services/quote.service");
const budgetService = require("../lib/services/budget.service") as typeof import("../lib/services/budget.service");
const tenderService = require("../lib/services/tender.service") as typeof import("../lib/services/tender.service");
const zipRoute = require("../app/api/pdf/tender/zip/route") as typeof import("../app/api/pdf/tender/zip/route");
/* eslint-enable @typescript-eslint/no-require-imports */

// ---------------------------------------------------------------------------
// Fixtures through the real services
// ---------------------------------------------------------------------------

const P_ENT = "p-n2-enterprise";
const P_PRO = "p-n2-pro";
const P_BASIC = "p-n2-basic";
const P_CANCELED = "p-n2-canceled";
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
    name: "N2投标交付订阅授权验收",
    clientName: "N2 Corp",
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

function subscriptionRow(organizationId: string, plan: string, status: string) {
  const now = nextDate();
  const id = `sub-${db.seq}`;
  db.subscriptions.set(id, { id, organizationId, plan, status, currentPeriodEnd: null, createdAt: now, updatedAt: now });
}

async function boundTender(projectId: string, organizationId: string, ellipticalQuantity: number) {
  const base = await quoteService.generateQuote({
    projectId,
    workspaceId: "ws-n2",
    organizationId,
    companyInfo: { companyName: "N2 Corp", targetUsers: 200, areaM2: 400 },
  });
  const version = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: base.quote.id,
    organizationId,
    projectId,
    decidedBy: "user-n2",
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
  const quoteId = version.quote.id;
  const { budget } = await budgetService.calculateBudget({ quoteId, organizationId, projectId, budgetTier: "mid" });
  const { tender } = await tenderService.generateTender({ projectId, quoteId, budgetId: budget.id, organizationId });
  assert(db.tenders.get(tender.id)!.status === "READY", "fixture Tender READY");
  return { quoteId, budgetId: budget.id, tenderId: tender.id };
}

async function buildFixtures() {
  for (const [id, org] of [[P_ENT, ORG_ENT], [P_PRO, ORG_PRO], [P_BASIC, ORG_BASIC], [P_CANCELED, ORG_CANCELED]] as const) {
    db.projects.set(id, projectRow(id, org));
  }
  subscriptionRow(ORG_PRO, "ENTERPRISE", "CANCELED");
  subscriptionRow(ORG_ENT, "ENTERPRISE", "ACTIVE");
  subscriptionRow(ORG_PRO, "PRO", "ACTIVE");
  subscriptionRow(ORG_CANCELED, "ENTERPRISE", "CANCELED");

  const ent1 = await boundTender(P_ENT, ORG_ENT, 9);
  const pro = await boundTender(P_PRO, ORG_PRO, 9);
  const basic = await boundTender(P_BASIC, ORG_BASIC, 9);
  const canceled = await boundTender(P_CANCELED, ORG_CANCELED, 9);
  return { ent1, pro, basic, canceled };
}

// ---------------------------------------------------------------------------
// Route harness
// ---------------------------------------------------------------------------

type ZipResult = {
  status: number;
  body?: { ok?: boolean; code?: string; message?: string; plan?: string; reason?: string };
  files?: string[];
  calls: Call[];
  legacyCalls: number;
  gateCalls: number;
  args: { plan: unknown[][]; budget: unknown[][]; pack: unknown[][] };
  budgetText: string;
};

const allCalls: Call[] = [];

async function postZip(
  body: Record<string, unknown>,
  organizationId: string | null,
  extraHeaders: Record<string, string> = {},
): Promise<ZipResult> {
  captured.plan.length = 0;
  captured.budget.length = 0;
  captured.pack.length = 0;
  budgetText.length = 0;
  const callsBefore = db.calls.length;
  const legacyBefore = legacy.calls;
  const gateBefore = gate.calls;
  const req = new Request("http://localhost/api/pdf/tender/zip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(organizationId ? { "x-organization-id": organizationId } : {}),
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
  const res = await zipRoute.POST(req);
  const calls = db.calls.slice(callsBefore);
  allCalls.push(...calls);
  const result: ZipResult = {
    status: res.status,
    calls,
    legacyCalls: legacy.calls - legacyBefore,
    gateCalls: gate.calls - gateBefore,
    args: { plan: [...captured.plan], budget: [...captured.budget], pack: [...captured.pack] },
    budgetText: squash(budgetText.join("")),
  };
  if ((res.headers.get("content-type") || "").includes("application/zip")) {
    const zip = await JSZip.loadAsync(Buffer.from(await res.arrayBuffer()));
    result.files = Object.keys(zip.files).sort();
  } else {
    result.body = (await res.json()) as ZipResult["body"];
  }
  return result;
}

function subscriptionLookups(r: ZipResult) {
  return r.calls.filter((c) => c.model === "subscription").map((c) => (c.args as { where: { organizationId: string } }).where.organizationId);
}

function assertNoWrites(r: ZipResult, label: string) {
  const writes = r.calls.filter((c) => WRITE_METHODS.has(c.method));
  assert(writes.length === 0, `${label}: no Prisma writes (got ${json(writes.map((c) => `${c.model}.${c.method}`))})`);
}

function snapshot() {
  return json([...db.projects, ...db.quotes, ...db.budgets, ...db.tenders, ...db.subscriptions].map(([k, v]) => [k, v]));
}

async function expectRejected(
  label: string,
  body: Record<string, unknown>,
  organizationId: string | null,
  expected: { status: number; code: string },
  extraHeaders: Record<string, string> = {},
) {
  const before = snapshot();
  const r = await postZip(body, organizationId, extraHeaders);
  assert(r.status === expected.status, `${label}: status ${expected.status} (got ${r.status} ${json(r.body)})`);
  assert(r.body?.ok === false && r.body.code === expected.code, `${label}: code ${expected.code} (got ${r.body?.code})`);
  assert(!r.files, `${label}: no ZIP delivered`);
  assert(r.args.plan.length + r.args.budget.length + r.args.pack.length === 0, `${label}: nothing rendered`);
  assert(snapshot() === before, `${label}: no row created / changed`);
  assertNoWrites(r, label);
  return r;
}

function ellipticalQuantities(placeholders: unknown) {
  return (placeholders as Array<{ subCategory?: string; quantity?: number }>)
    .filter((p) => String(p.subCategory ?? "").includes("椭圆机"))
    .map((p) => p.quantity);
}

function assertDeliveredExactly(
  r: ZipResult,
  label: string,
  expected: { budgetId: string; quantity: number; min: string; max: string },
  forbidden?: { min: string; max: string },
) {
  assert(r.status === 200 && Boolean(r.files), `${label}: 200 application/zip (got ${r.status} ${json(r.body)})`);
  assert(json(r.files) === json(["budget.pdf", "final-tender-pack.pdf", "plan.pdf"]), `${label}: plan + budget + final-tender-pack (got ${json(r.files)})`);
  const budgetArg = r.args.budget[0][0] as Row;
  const packArg = r.args.pack[0][0] as { budget: Row; placeholders: unknown; tier: string };
  assert(budgetArg.id === expected.budgetId && packArg.budget.id === expected.budgetId, `${label}: budget.pdf + pack rendered from ${expected.budgetId}`);
  assert(json(ellipticalQuantities(r.args.plan[0][2])) === json([expected.quantity]), `${label}: plan.pdf elliptical quantity ${expected.quantity}`);
  assert(json(ellipticalQuantities(packArg.placeholders)) === json([expected.quantity]), `${label}: pack elliptical quantity ${expected.quantity}`);
  assert(r.budgetText.includes(expected.min) && r.budgetText.includes(expected.max), `${label}: budget.pdf totals ${expected.min}–${expected.max}`);
  if (forbidden) {
    assert(!r.budgetText.includes(forbidden.min) && !r.budgetText.includes(forbidden.max), `${label}: budget.pdf has no ${forbidden.min}–${forbidden.max}`);
  }
  const offenders = r.calls.filter(
    (c) => c.model !== "subscription" && (c.method === "findFirst" || c.method === "findMany" || json(c.args ?? null).includes("orderBy")),
  );
  assert(offenders.length === 0, `${label}: no latest-version selector on commercial facts (got ${json(offenders.map((c) => `${c.model}.${c.method}`))})`);
  assertNoWrites(r, label);
}

function renderTiers(r: ZipResult) {
  const planOpts = r.args.plan[0][3] as { tier: string; tenderDocument: { tier?: string } };
  const budgetOpts = r.args.budget[0][1] as { tier: string };
  const pack = r.args.pack[0]?.[0] as { tier: string } | undefined;
  return { plan: planOpts.tier, budget: budgetOpts.tier, pack: pack?.tier ?? null };
}

const B1 = { quantity: 9, min: "685,000", max: "949,000" };
const B2 = { quantity: 8, min: "635,000", max: "899,000" };
const CLIENT_CLAIMS = { tier: "enterprise", plan: "ENTERPRISE", effectiveLevel: "enterprise", licenseKey: "LIC-NULL-PLAN", zipEnabled: true };
const CLIENT_CLAIM_HEADERS = { "x-plan-id": "enterprise", "x-user-tier": "enterprise", "x-plan": "ENTERPRISE" };

// ---------------------------------------------------------------------------
// 1–6
// ---------------------------------------------------------------------------

type Fixtures = Awaited<ReturnType<typeof buildFixtures>>;

async function check1ProNotUpgraded(f: Fixtures) {
  legacy.level = "enterprise";
  legacy.zipEnabled = true;
  gate.sessionOrg = ORG_PRO;
  const pro = await expectRejected("1. PRO org + legacy Enterprise", { projectId: P_PRO, planId: P_PRO, tenderId: f.pro.tenderId }, ORG_PRO, { status: 403, code: "ZIP_TIER_INSUFFICIENT" });
  assert(pro.body?.plan === "PRO", `1. 403 names the SaaS plan PRO (got ${pro.body?.plan})`);
  assert(pro.legacyCalls === 0, "1. legacy planId entitlement not consulted on the tender path");
  assert(json(subscriptionLookups(pro)) === json([ORG_PRO]), "1. subscription resolved for the session org only");
  assert(/Enterprise/.test(pro.body?.message ?? ""), "1. message asks for Enterprise");

  const claims = await expectRejected(
    "1. PRO org + client tier / plan / license claims",
    { projectId: P_PRO, planId: "enterprise", tenderId: f.pro.tenderId, ...CLIENT_CLAIMS },
    ORG_PRO,
    { status: 403, code: "ZIP_TIER_INSUFFICIENT" },
    CLIENT_CLAIM_HEADERS,
  );
  assert(claims.legacyCalls === 0 && claims.body?.plan === "PRO", "1. client claims ignored");

  gate.sessionOrg = ORG_BASIC;
  const basic = await expectRejected("1. no subscription (BASIC)", { projectId: P_BASIC, tenderId: f.basic.tenderId }, ORG_BASIC, { status: 403, code: "ZIP_TIER_INSUFFICIENT" });
  assert(basic.body?.plan === "BASIC" && basic.legacyCalls === 0, "1. BASIC fallback denied, legacy not consulted");
  gate.sessionOrg = ORG_CANCELED;
  const canceled = await expectRejected("1. CANCELED Enterprise only", { projectId: P_CANCELED, tenderId: f.canceled.tenderId }, ORG_CANCELED, { status: 403, code: "ZIP_TIER_INSUFFICIENT" });
  assert(canceled.body?.plan === "BASIC", "1. CANCELED Enterprise subscription grants nothing");
  out("✓ 1. tenderId + PRO org (legacy says Enterprise / null-plan license, client claims Enterprise) → 403 ZIP_TIER_INSUFFICIENT plan=PRO; BASIC / CANCELED-Enterprise → 403; legacy entitlement never consulted");
}

async function check2EnterpriseAllowed(f: Fixtures) {
  legacy.level = "free";
  legacy.zipEnabled = false;
  gate.sessionOrg = ORG_ENT;
  const r = await postZip({ projectId: P_ENT, planId: P_ENT, tenderId: f.ent1.tenderId }, ORG_ENT);
  assertDeliveredExactly(r, "2. ENTERPRISE org", { budgetId: f.ent1.budgetId, ...B1 });
  assert(r.legacyCalls === 0, "2. legacy entitlement (which would deny) not consulted");
  assert(json(subscriptionLookups(r)) === json([ORG_ENT]), "2. subscription resolved for the session org");
  assert(json(renderTiers(r)) === json({ plan: "enterprise", budget: "enterprise", pack: "enterprise" }), `2. render tier from SaaS plan ENTERPRISE (got ${json(renderTiers(r))})`);
  legacy.level = "enterprise";
  legacy.zipEnabled = true;
  out("✓ 2. tenderId + ENTERPRISE org → 200 plan + budget + final-tender-pack at tier enterprise, even though the legacy entitlement would deny");
}

async function check3CrossOrg(f: Fixtures) {
  gate.sessionOrg = ORG_ENT;
  const entOnPro = await expectRejected("3. ENTERPRISE member → PRO org Tender", { projectId: P_PRO, tenderId: f.pro.tenderId }, ORG_ENT, { status: 403, code: "TENANT_ISOLATION" });
  const entOnProUnderOwn = await expectRejected("3. ENTERPRISE member → PRO Tender under own project", { projectId: P_ENT, tenderId: f.pro.tenderId }, ORG_ENT, { status: 403, code: "TENANT_ISOLATION" });
  gate.sessionOrg = ORG_PRO;
  const proOnEnt = await expectRejected("3. PRO member → ENTERPRISE org Tender", { projectId: P_ENT, tenderId: f.ent1.tenderId }, ORG_PRO, { status: 403, code: "TENANT_ISOLATION" });
  const spoofed = await expectRejected("3. PRO session claiming ENTERPRISE org header", { projectId: P_ENT, tenderId: f.ent1.tenderId }, ORG_ENT, { status: 403, code: "TENANT_ISOLATION" });
  gate.sessionOrg = null;
  const anon = await expectRejected("3. no session", { projectId: P_ENT, tenderId: f.ent1.tenderId }, ORG_ENT, { status: 401, code: "ZIP_AUTH_REQUIRED" });
  for (const r of [entOnPro, entOnProUnderOwn, proOnEnt, spoofed, anon]) {
    assert(subscriptionLookups(r).length === 0 && r.legacyCalls === 0, "3. rejected before any subscription / legacy entitlement lookup");
  }
  gate.sessionOrg = ORG_ENT;
  out("✓ 3. cross-org Tender / foreign Tender under own project / header ≠ session → 403 TENANT_ISOLATION; no session → 401; rejected before entitlement");
}

async function check4BindingUnchanged(f: Fixtures) {
  gate.sessionOrg = ORG_ENT;
  const ent2 = await boundTender(P_ENT, ORG_ENT, 8);
  assert(latestBudgetOf(P_ENT)!.id === ent2.budgetId, "4. B2 is now the project's latest Budget");
  const t1 = await postZip({ projectId: P_ENT, planId: P_ENT, tenderId: f.ent1.tenderId }, ORG_ENT);
  assertDeliveredExactly(t1, "4. T1 after T2", { budgetId: f.ent1.budgetId, ...B1 }, B2);
  const t2 = await postZip({ projectId: P_ENT, planId: P_ENT, tenderId: ent2.tenderId }, ORG_ENT);
  assertDeliveredExactly(t2, "4. T2", { budgetId: ent2.budgetId, ...B2 }, B1);
  const lookups = t1.calls.map((c) => `${c.model}.${c.method}:${(c.args as { where?: { id?: string; organizationId?: string } })?.where?.id ?? (c.args as { where: { organizationId: string } }).where.organizationId}`);
  assert(
    json(lookups) === json([`tender.findUnique:${f.ent1.tenderId}`, `project.findUnique:${P_ENT}`, `quote.findUnique:${f.ent1.quoteId}`, `budget.findUnique:${f.ent1.budgetId}`, `subscription.findFirst:${ORG_ENT}`]),
    `4. reads Tender → Project → Quote(id) → Budget(id), then the org subscription (got ${json(lookups)})`,
  );

  const now = nextDate();
  const tampered = `t-n2-tampered-${db.seq}`;
  db.tenders.set(tampered, { id: tampered, projectId: P_ENT, quoteId: ent2.quoteId, budgetId: f.ent1.budgetId, status: "READY", fileName: null, fileUrl: null, createdAt: now, updatedAt: now });
  const mismatch = await expectRejected("4. ENTERPRISE org, Tender Q2 + B1", { projectId: P_ENT, tenderId: tampered }, ORG_ENT, { status: 409, code: "BUDGET_QUOTE_MISMATCH" });
  assert(subscriptionLookups(mismatch).length === 0, "4. binding validated before entitlement");
  await expectRejected("4. unknown Tender", { projectId: P_ENT, tenderId: "t-n2-missing" }, ORG_ENT, { status: 404, code: "TENDER_NOT_FOUND" });
  await expectRejected("4. blank tenderId", { projectId: P_ENT, tenderId: " " }, ORG_ENT, { status: 400, code: "TENDER_ID_REQUIRED" });
  out("✓ 4. exact binding unchanged: T1 still 9 / 685,000–949,000 after B2 became latest, T2 = 8 / 635,000–899,000; Q2+B1 → 409, unknown → 404, blank → 400");
  return ent2;
}

async function check5LegacyUnchanged(f: Fixtures, ent2: { budgetId: string }) {
  gate.sessionOrg = ORG_ENT;
  legacy.level = "enterprise";
  legacy.zipEnabled = true;
  const legacyEnt = await postZip({ projectId: P_PRO, planId: P_PRO }, ORG_PRO);
  assert(legacyEnt.status === 200 && json(legacyEnt.files) === json(["budget.pdf", "final-tender-pack.pdf", "plan.pdf"]), `5. no tenderId + legacy Enterprise → 200 with pack (got ${legacyEnt.status} ${json(legacyEnt.body)})`);
  assert(legacyEnt.legacyCalls === 1 && legacyEnt.gateCalls === 0 && subscriptionLookups(legacyEnt).length === 0, "5. legacy path: legacy entitlement only, no org gate, no subscription lookup");
  assert(json(renderTiers(legacyEnt)) === json({ plan: "enterprise", budget: "enterprise", pack: "enterprise" }), "5. legacy render tier from legacy effectiveLevel");
  assert((legacyEnt.args.budget[0][0] as Row).id === latestBudgetOf(P_PRO)!.id, "5. legacy path still renders the project's latest Budget");

  legacy.level = "pro";
  const legacyPro = await postZip({ projectId: P_ENT, planId: P_ENT }, ORG_ENT);
  assert(legacyPro.status === 200 && json(renderTiers(legacyPro)) === json({ plan: "pro", budget: "pro", pack: "pro" }), "5. legacy pro + zipEnabled → 200 at tier pro (unchanged)");
  assert((legacyPro.args.budget[0][0] as Row).id === ent2.budgetId && subscriptionLookups(legacyPro).length === 0, "5. legacy path ignores the ENTERPRISE subscription and picks latest B2");

  legacy.level = "free";
  legacy.zipEnabled = false;
  const denied = await expectRejected("5. no tenderId + legacy not purchased, ENTERPRISE org header", { projectId: P_ENT, planId: P_ENT }, ORG_ENT, { status: 403, code: "ZIP_NOT_PURCHASED" });
  assert(denied.body?.reason === "NOT_PURCHASED" && denied.legacyCalls === 1 && subscriptionLookups(denied).length === 0, "5. legacy deny unchanged; SaaS subscription does not grant the legacy path");
  legacy.level = "enterprise";
  legacy.zipEnabled = true;
  void f;
  out("✓ 5. no tenderId: legacy entitlement alone decides (Enterprise → 200 + pack, pro → tier pro, not purchased → 403 ZIP_NOT_PURCHASED); no org gate / subscription lookup; latest Budget as before");
}

function fnBody(src: string, signature: string) {
  const start = src.indexOf(signature);
  assert(start >= 0, `source: ${signature} present`);
  const ends = ["\nasync function ", "\nfunction ", "\nexport ", "\n/**"].map((m) => src.indexOf(m, start + signature.length)).filter((i) => i > 0);
  return src.slice(start, Math.min(...ends, src.length));
}

function check6NoWrites() {
  const writes = allCalls.filter((c) => WRITE_METHODS.has(c.method));
  assert(writes.length === 0, `6. no Prisma writes across every ZIP request (got ${json(writes.map((c) => `${c.model}.${c.method}`))})`);
  assert(provisionCalls === 0, "6. provisionZipProjectMinimal never called");
  assert(allCalls.some((c) => c.model === "subscription"), "6. subscription reads observed (instrumentation live)");

  const diff = execSync(`git diff HEAD -- ${ZIP_ROUTE}`, { cwd: ROOT, encoding: "utf8" });
  const added = diff.split(/\r?\n/).filter((l) => l.startsWith("+") && !l.startsWith("+++")).join("\n");
  assert(!/\.(create|createMany|update|updateMany|upsert|delete|deleteMany)\(|\$transaction|\$executeRaw/.test(added), "6. route diff adds no write call");
  out("✓ 6. zero Prisma writes across all ZIP requests; route diff adds no create / update / upsert / delete / transaction");
}

function checkSource() {
  const route = fs.readFileSync(path.join(ROOT, ZIP_ROUTE), "utf8");
  const tenderBound = fnBody(route, "async function resolveTenderBoundSource(");
  const order = ["resolveZipOrganizationId(", "loadTenderDeliveryBinding(", "resolveOrganizationFeatures(org.organizationId)", "features.flags.canGenerateTender", "buildQuotePlanPdfSource(quote)"].map((t) => tenderBound.indexOf(t));
  assert(order.every((i, k) => i > 0 && (k === 0 || i > order[k - 1])), `source: tender path = org gate → exact binding → subscription → render source (got ${json(order)})`);
  assert(!/resolveRequestEntitlement|evaluateZipAccess|entitlement/.test(tenderBound), "source: tender path never reads the legacy entitlement");
  const post = fnBody(route, "export async function POST(");
  assert(/if \(!tenderIdRequested\) \{\s*const legacyAccess = await authorizeLegacyZipAccess\(/.test(post), "source: legacy entitlement only when tenderId is absent");
  assert(post.includes("const renderTier = resolved.source.renderTier ?? legacyRenderTier;"), "source: tender render tier from SaaS plan, legacy from entitlement");

  const head = execSync(`git show HEAD:${ZIP_ROUTE}`, { cwd: ROOT, encoding: "utf8" });
  const legacyBlock = (src: string) => {
    const start = src.indexOf("const { entitlement, debug, source, userId }");
    const end = src.indexOf("if (!zipDecision.allowed) {", start);
    assert(start > 0 && end > start, "source: legacy entitlement block present");
    return squash(src.slice(start, end));
  };
  assert(legacyBlock(head) === legacyBlock(route), "source: legacy entitlement evaluation + logging identical to HEAD");
  assert(route.includes('return { ok: true, renderTier: normalizeUserTier(entitlement.effectiveLevel ?? "free") };') && head.includes('normalizeUserTier(entitlement.effectiveLevel ?? "free")'), "source: legacy render tier expression unchanged");
  out("✓ source: tender path = org gate → exact binding → resolveOrganizationFeatures → canGenerateTender; legacy entitlement block identical to HEAD and only for no-tenderId");
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
  const allowed = new Set([ZIP_ROUTE, VERIFIER, "scripts/verify-c3-b-tender-zip-binding.ts"]);
  for (const file of [...lines("git diff --name-only HEAD"), ...lines("git ls-files --others --exclude-standard")]) {
    if (knownDirty.has(file)) continue;
    assert(allowed.has(file), `N2 scope: unexpected change ${file}`);
  }
  assert(
    lines("git diff --name-only HEAD -- prisma/schema.prisma lib/entitlements lib/billing lib/feature-flags lib/license lib/services lib/saas lib/auth").length === 0,
    "N2 scope: no Prisma schema / entitlement / license / subscription / service / auth change",
  );
  out("✓ scope: ZIP route + verifiers only; getEntitlement / licenseMatchesPlan / subscription / schema untouched");
}

async function main() {
  const f = await buildFixtures();
  await check1ProNotUpgraded(f);
  await check2EnterpriseAllowed(f);
  await check3CrossOrg(f);
  const ent2 = await check4BindingUnchanged(f);
  await check5LegacyUnchanged(f, ent2);
  check6NoWrites();
  checkSource();
  checkScope();
  out("\nverify-c3-n2-tender-zip-subscription: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

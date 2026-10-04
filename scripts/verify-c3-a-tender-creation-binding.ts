/**
 * C.3-A — Tender Creation Binding verification.
 * A Tender is created only for an explicit Quote + Budget of the same project, READY Quote,
 * and Budget basis quoteId === requested quoteId (canonical readBudgetQuoteBasis). Runs the real
 * quote / budget / tender services and the real POST /api/tender/generate handler against an
 * in-memory Prisma stub (gate / CRM / sales / analytics stubbed). No DB, no network, no files.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";

import type { BudgetItem } from "../lib/domain/tender";

const ROOT = path.resolve(__dirname, "..");
const SERVICE = "lib/services/tender.service.ts";
const ROUTE = "app/api/tender/generate/route.ts";
const VERIFIER = "scripts/verify-c3-a-tender-creation-binding.ts";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function json(value: unknown) {
  return JSON.stringify(value);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

// ---------------------------------------------------------------------------
// In-memory Prisma stub
// ---------------------------------------------------------------------------

type Row = Record<string, unknown> & { id: string };

const db = {
  projects: new Map<string, Row>(),
  quotes: new Map<string, Row>(),
  budgets: new Map<string, Row>(),
  tenders: new Map<string, Row>(),
  budgetFindFirstCalls: 0,
  tenderCreateCalls: 0,
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

function withProject(row: Row | undefined, include?: { project?: boolean }) {
  if (!row) return null;
  const out = structuredClone(row) as Row & { project?: Row };
  if (include?.project) {
    const project = db.projects.get(String(row.projectId));
    out.project = project ? structuredClone(project) : undefined;
  }
  return out;
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
          id: `q-${++db.seq}`,
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
      findUnique: async ({ where, include }: { where: { id: string }; include?: { project?: boolean } }) =>
        withProject(db.quotes.get(where.id), include),
    },
    budget: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const row: Row = { id: `b-${++db.seq}`, createdAt: new Date(), ...structuredClone(data) };
        db.budgets.set(row.id, row);
        return structuredClone(row);
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        const row = db.budgets.get(where.id);
        return row ? structuredClone(row) : null;
      },
      findFirst: async () => {
        db.budgetFindFirstCalls += 1;
        const rows = [...db.budgets.values()];
        return rows.length ? structuredClone(rows[rows.length - 1]) : null;
      },
    },
    tender: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        db.tenderCreateCalls += 1;
        const row: Row = { id: `t-${++db.seq}`, createdAt: new Date(), ...structuredClone(data) };
        db.tenders.set(row.id, row);
        return structuredClone(row);
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = db.tenders.get(where.id);
        if (!row) throw new Error(`tender ${where.id} not found`);
        Object.assign(row, structuredClone(data));
        return structuredClone(row);
      },
    },
  },
});

const ORG = "org-c3a";
const OTHER_ORG = "org-c3a-other";
const PROJECT = "p-c3a";
const OTHER_PROJECT = "p-c3a-other";
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

stubModule("lib/saas/api-gate", {
  runSaasApiGate: async () => ({
    organizationId: ORG,
    userId: "user-c3a",
    traceId: "trace-c3a",
    feature: { plan: "ENTERPRISE" },
  }),
  saasGateErrorResponse: () => {
    throw new Error("unexpected saasGateErrorResponse");
  },
  trackFeatureUsage: async () => undefined,
});
stubModule("lib/crm/crm.product-bridge", { recordTenderAsDeal: async () => null });
stubModule("lib/sales/sales.product-bridge", { onTenderGenerated: async () => undefined });
stubModule("lib/growth/analytics.events", { trackTenderGenerated: () => undefined });
stubModule("lib/growth/growth.api-helper", {
  growthAwareGateErrorResponse: () => {
    throw new Error("unexpected growthAwareGateErrorResponse");
  },
});

/* eslint-disable @typescript-eslint/no-require-imports */
const quoteService = require("../lib/services/quote.service") as typeof import("../lib/services/quote.service");
const budgetService = require("../lib/services/budget.service") as typeof import("../lib/services/budget.service");
const tenderService = require("../lib/services/tender.service") as typeof import("../lib/services/tender.service");
const route = require("../app/api/tender/generate/route") as typeof import("../app/api/tender/generate/route");
/* eslint-enable @typescript-eslint/no-require-imports */

type Selection = import("../lib/product-engine/product-intelligence").ProductSelection;
type GenerateInput = import("../lib/services/tender.service").GenerateTenderInput;

// ---------------------------------------------------------------------------
// Fixtures through the real services
// ---------------------------------------------------------------------------

function projectRow(id: string, organizationId: string): Row {
  return {
    id,
    name: "C3A投标绑定验收",
    clientName: "C3A Corp",
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
  };
}

async function quoteVersion(projectId: string, ellipticalQuantity: number) {
  const base = await quoteService.generateQuote({
    projectId,
    workspaceId: "ws-c3a",
    organizationId: ORG,
    companyInfo: { companyName: "C3A Corp", targetUsers: 200, areaM2: 400 },
  });
  const version = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: base.quote.id,
    organizationId: ORG,
    projectId,
    decidedBy: "user-c3a",
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

async function budgetFor(quoteId: string, projectId: string) {
  const result = await budgetService.calculateBudget({ quoteId, organizationId: ORG, projectId, budgetTier: "mid" });
  return result.budget.id;
}

type Fixtures = Awaited<ReturnType<typeof buildFixtures>>;

async function buildFixtures() {
  db.projects.set(PROJECT, projectRow(PROJECT, ORG));
  db.projects.set(OTHER_PROJECT, projectRow(OTHER_PROJECT, ORG));

  const v1 = await quoteVersion(PROJECT, 9);
  const b1 = await budgetFor(v1, PROJECT);
  const v2 = await quoteVersion(PROJECT, 8);
  const b2 = await budgetFor(v2, PROJECT);

  // Same basis/selection as v1 but not READY; its Budget basis matches, so READY is the only failing invariant.
  const notReady: Record<string, { quoteId: string; budgetId: string }> = {};
  for (const status of ["GENERATING", "FAILED", "DRAFT"]) {
    const quoteId = await quoteVersion(PROJECT, 9);
    const budgetId = await budgetFor(quoteId, PROJECT);
    db.quotes.get(quoteId)!.status = status;
    notReady[status] = { quoteId, budgetId };
  }

  const otherQuote = await quoteVersion(OTHER_PROJECT, 9);
  const otherBudget = await budgetFor(otherQuote, OTHER_PROJECT);

  // Budget of the other project whose assumptions claim v1 as basis.
  const forgedBudget = `b-forged-${++db.seq}`;
  db.budgets.set(forgedBudget, { ...structuredClone(db.budgets.get(b1)!), id: forgedBudget, projectId: OTHER_PROJECT });

  // Legacy Budget of this project with no quote basis line.
  const legacyBudget = `b-legacy-${++db.seq}`;
  db.budgets.set(legacyBudget, {
    ...structuredClone(db.budgets.get(b1)!),
    id: legacyBudget,
    assumptions: ["当前预算为投标阶段建议区间，不代表最终成交价。"],
  });

  return { v1, b1, v2, b2, notReady, otherQuote, otherBudget, forgedBudget, legacyBudget };
}

function ellipticalSelection(quoteId: string): Selection {
  const stored = (db.quotes.get(quoteId)!.companyInfo as { productSelections: Selection[] }).productSelections;
  return stored.find((s) => s.slotKey === ELLIPTICAL_SLOT)!;
}

function ellipticalItem(budgetId: string): BudgetItem {
  const items = db.budgets.get(budgetId)!.items as BudgetItem[];
  const found = items.filter((i) => String(i.name ?? i.category).includes("椭圆机"));
  assert(found.length === 1, `exactly one elliptical row in ${budgetId}`);
  return found[0];
}

function commercialSnapshot() {
  return json({
    quotes: [...db.quotes.entries()],
    budgets: [...db.budgets.entries()],
  });
}

async function expectBindingFailure(
  label: string,
  input: GenerateInput,
  code: import("../lib/services/tender.service").TenderBindingFailure,
  status: 400 | 404 | 409,
) {
  const tendersBefore = db.tenders.size;
  const createsBefore = db.tenderCreateCalls;
  let caught: unknown = null;
  try {
    await tenderService.generateTender(input);
  } catch (err) {
    caught = err;
  }
  assert(caught instanceof tenderService.TenderBindingError, `${label}: rejected with TenderBindingError`);
  const err = caught as InstanceType<typeof tenderService.TenderBindingError>;
  assert(err.code === code, `${label}: code ${code} (got ${err.code})`);
  assert(err.status === status, `${label}: status ${status} (got ${err.status})`);
  assert(db.tenders.size === tendersBefore && db.tenderCreateCalls === createsBefore, `${label}: no Tender row created`);
}

// ---------------------------------------------------------------------------
// A–G service checks
// ---------------------------------------------------------------------------

async function checkValidPair(f: Fixtures) {
  const before = db.tenders.size;
  const { tender } = await tenderService.generateTender({
    projectId: PROJECT,
    quoteId: f.v1,
    budgetId: f.b1,
    organizationId: ORG,
  });
  const row = db.tenders.get(tender.id)!;
  assert(db.tenders.size === before + 1, "A. exactly one Tender row");
  assert(row.projectId === PROJECT && row.quoteId === f.v1 && row.budgetId === f.b1, "A. Tender stores projectId / quoteId=v1 / budgetId=B1");
  assert(row.status === "READY", "A. Tender READY");

  const second = await tenderService.generateTender({ projectId: PROJECT, quoteId: f.v2, budgetId: f.b2, organizationId: ORG });
  const row2 = db.tenders.get(second.tender.id)!;
  assert(row2.quoteId === f.v2 && row2.budgetId === f.b2, "A. v2 + B2 Tender stores its own pair");
  assert(db.tenders.get(tender.id)!.budgetId === f.b1, "A. earlier Tender binding unchanged");
  console.log("✓ A. valid pair: Tender.quoteId === v1, Tender.budgetId === B1 (and v2/B2 bound separately)");
}

async function checkMismatchedPair(f: Fixtures) {
  await expectBindingFailure("B. v2 + B1", { projectId: PROJECT, quoteId: f.v2, budgetId: f.b1, organizationId: ORG }, "BUDGET_QUOTE_MISMATCH", 409);
  await expectBindingFailure("B. v1 + B2", { projectId: PROJECT, quoteId: f.v1, budgetId: f.b2, organizationId: ORG }, "BUDGET_QUOTE_MISMATCH", 409);
  await expectBindingFailure("B. legacy Budget without basis", { projectId: PROJECT, quoteId: f.v1, budgetId: f.legacyBudget, organizationId: ORG }, "BUDGET_QUOTE_MISMATCH", 409);
  console.log("✓ B. mismatched pair (v2 + B1, v1 + B2, basis-less Budget) → 409 BUDGET_QUOTE_MISMATCH, no Tender");
}

async function checkMissingBudgetId(f: Fixtures) {
  const findFirstBefore = db.budgetFindFirstCalls;
  for (const budgetId of ["", "   ", undefined as unknown as string, null as unknown as string]) {
    await expectBindingFailure(`C. budgetId=${json(budgetId)}`, { projectId: PROJECT, quoteId: f.v2, budgetId, organizationId: ORG }, "BUDGET_ID_REQUIRED", 400);
  }
  assert(db.budgetFindFirstCalls === findFirstBefore, "C. latest-Budget lookup never invoked");
  console.log("✓ C. missing budgetId → 400 BUDGET_ID_REQUIRED; latest Budget never selected");
}

async function checkQuoteNotReady(f: Fixtures) {
  for (const [status, pair] of Object.entries(f.notReady)) {
    assert(
      budgetService.readBudgetQuoteBasis(db.budgets.get(pair.budgetId)!.assumptions)?.quoteId === pair.quoteId,
      `D. ${status} fixture Budget basis matches its Quote`,
    );
    await expectBindingFailure(`D. Quote ${status}`, { projectId: PROJECT, ...pair, organizationId: ORG }, "QUOTE_NOT_READY", 409);
  }
  console.log("✓ D. Quote GENERATING / FAILED / DRAFT → 409 QUOTE_NOT_READY, no Tender");
}

async function checkQuoteOtherProject(f: Fixtures) {
  await expectBindingFailure("E. other-project Quote + own Budget", { projectId: PROJECT, quoteId: f.otherQuote, budgetId: f.b1, organizationId: ORG }, "QUOTE_PROJECT_MISMATCH", 409);
  await expectBindingFailure("E. other-project Quote + its Budget", { projectId: PROJECT, quoteId: f.otherQuote, budgetId: f.otherBudget, organizationId: ORG }, "QUOTE_PROJECT_MISMATCH", 409);
  console.log("✓ E. Quote from another project → 409 QUOTE_PROJECT_MISMATCH, no Tender");
}

async function checkBudgetOtherProject(f: Fixtures) {
  await expectBindingFailure("F. other-project Budget", { projectId: PROJECT, quoteId: f.v1, budgetId: f.otherBudget, organizationId: ORG }, "BUDGET_PROJECT_MISMATCH", 409);
  await expectBindingFailure("F. other-project Budget claiming v1 basis", { projectId: PROJECT, quoteId: f.v1, budgetId: f.forgedBudget, organizationId: ORG }, "BUDGET_PROJECT_MISMATCH", 409);
  console.log("✓ F. Budget from another project (incl. one whose basis claims v1) → 409 BUDGET_PROJECT_MISMATCH, no Tender");
}

async function checkMissingRows(f: Fixtures) {
  await expectBindingFailure("G. empty quoteId", { projectId: PROJECT, quoteId: " ", budgetId: f.b1, organizationId: ORG }, "QUOTE_ID_REQUIRED", 400);
  await expectBindingFailure("G. unknown Quote", { projectId: PROJECT, quoteId: "q-missing", budgetId: f.b1, organizationId: ORG }, "QUOTE_NOT_FOUND", 404);
  await expectBindingFailure("G. unknown Budget", { projectId: PROJECT, quoteId: f.v1, budgetId: "b-missing", organizationId: ORG }, "BUDGET_NOT_FOUND", 404);
  await expectBindingFailure("G. unknown Project", { projectId: "p-missing", quoteId: f.v1, budgetId: f.b1, organizationId: ORG }, "PROJECT_NOT_FOUND", 404);
  await expectBindingFailure("G. empty projectId", { projectId: "", quoteId: f.v1, budgetId: f.b1, organizationId: ORG }, "PROJECT_NOT_FOUND", 404);

  const before = db.tenders.size;
  let tenantErr: unknown = null;
  try {
    await tenderService.generateTender({ projectId: PROJECT, quoteId: f.v1, budgetId: f.b1, organizationId: OTHER_ORG });
  } catch (err) {
    tenantErr = err;
  }
  assert(tenantErr instanceof Error && tenantErr.name === "TenantIsolationError", "G. other tenant → TenantIsolationError");
  assert(db.tenders.size === before, "G. other tenant: no Tender row created");
  console.log("✓ G. missing / unknown Quote, Budget, Project → 400 / 404; other tenant rejected; no Tender");
}

// ---------------------------------------------------------------------------
// Route (real handler, stubbed gate)
// ---------------------------------------------------------------------------

async function post(body: Record<string, unknown>) {
  const req = { json: async () => body } as unknown as Parameters<typeof route.POST>[0];
  const res = await route.POST(req);
  return { status: res.status, body: (await res.json()) as { ok?: boolean; code?: string; tenderId?: string } };
}

async function checkRoute(f: Fixtures) {
  const findFirstBefore = db.budgetFindFirstCalls;
  const before = db.tenders.size;

  const missing = await post({ projectId: PROJECT, quoteId: f.v2 });
  assert(missing.status === 400 && missing.body.ok === false, "route: missing budgetId → 400");
  const mismatch = await post({ projectId: PROJECT, quoteId: f.v2, budgetId: f.b1 });
  assert(mismatch.status === 409 && mismatch.body.code === "BUDGET_QUOTE_MISMATCH", "route: v2 + B1 → 409 BUDGET_QUOTE_MISMATCH");
  const notReady = await post({ projectId: PROJECT, ...f.notReady.FAILED });
  assert(notReady.status === 409 && notReady.body.code === "QUOTE_NOT_READY", "route: FAILED Quote → 409 QUOTE_NOT_READY");
  const otherBudget = await post({ projectId: PROJECT, quoteId: f.v1, budgetId: f.otherBudget });
  assert(otherBudget.status === 409 && otherBudget.body.code === "BUDGET_PROJECT_MISMATCH", "route: other-project Budget → 409");
  const unknown = await post({ projectId: PROJECT, quoteId: f.v1, budgetId: "b-missing" });
  assert(unknown.status === 404 && unknown.body.code === "BUDGET_NOT_FOUND", "route: unknown Budget → 404");
  assert(db.tenders.size === before, "route: failures create no Tender");

  const ok = await post({ projectId: PROJECT, quoteId: f.v2, budgetId: f.b2 });
  assert(ok.status === 200 && ok.body.ok === true && typeof ok.body.tenderId === "string", "route: v2 + B2 → 200");
  const row = db.tenders.get(ok.body.tenderId!)!;
  assert(row.projectId === PROJECT && row.quoteId === f.v2 && row.budgetId === f.b2, "route: Tender stores v2 / B2");
  assert(db.tenders.size === before + 1, "route: exactly one Tender created");
  assert(db.budgetFindFirstCalls === findFirstBefore, "route: latest-Budget lookup never invoked");
  console.log("✓ route: 400 missing budgetId, 409 binding conflicts, 404 unknown Budget, 200 valid pair with stored binding");
}

// ---------------------------------------------------------------------------
// H. C.0 / C.1 / C.2 facts unchanged
// ---------------------------------------------------------------------------

function checkFacts(f: Fixtures, snapshotBefore: string) {
  assert(commercialSnapshot() === snapshotBefore, "H. Quote / Budget rows byte-identical before and after all Tender attempts");

  const s1 = ellipticalSelection(f.v1);
  const s2 = ellipticalSelection(f.v2);
  assert(s1.quantity === 9 && s2.quantity === 8, "H. C.0/C.1 quantities: v1 = 9, v2 = 8");
  assert(json(s1.priceFact) === json(PRICE_FACT) && json(s2.priceFact) === json(PRICE_FACT), "H. C.2-B price facts intact on both versions");
  assert(
    s2.candidate?.source === "customer-specified" && s2.candidate.brand === "Precor" && s2.candidate.model === "EFX 885",
    "H. C.2-A customer-specified identity intact",
  );

  const budget1 = db.budgets.get(f.b1)!;
  const budget2 = db.budgets.get(f.b2)!;
  assert(budget1.totalEstimateMin === 685000 && budget1.totalEstimateMax === 949000, "H. B1 = 685000–949000");
  assert(budget2.totalEstimateMin === 635000 && budget2.totalEstimateMax === 899000, "H. B2 = 635000–899000");
  assert(budgetService.readBudgetQuoteBasis(budget1.assumptions)?.quoteId === f.v1, "H. B1 basis = v1");
  assert(budgetService.readBudgetQuoteBasis(budget2.assumptions)?.quoteId === f.v2, "H. B2 basis = v2");

  const e2 = ellipticalItem(f.b2);
  assert(
    e2.quantity === 8 &&
      e2.unitPriceMin === 50000 &&
      e2.unitPriceMax === 50000 &&
      e2.subtotalMin === 400000 &&
      e2.subtotalMax === 400000 &&
      e2.priceBasis === "VERIFIED" &&
      json(e2.priceFact) === json(PRICE_FACT),
    "H. B2 elliptical row: 8 × verified 50000 = 400000 with the price fact",
  );
  const e1 = ellipticalItem(f.b1);
  assert(e1.quantity === 9 && e1.subtotalMin === 450000 && e1.subtotalMax === 450000, "H. B1 elliptical row: 9 × 50000 = 450000");
  console.log("✓ H. C.0/C.1/C.2-A/C.2-B facts unchanged (9 → 8, 685000–949000 → 635000–899000, price fact intact)");
}

// ---------------------------------------------------------------------------
// Source + scope
// ---------------------------------------------------------------------------

function checkSource() {
  const service = read(SERVICE);
  const routeSrc = read(ROUTE);
  assert(!/budget\.findFirst|orderBy/.test(service), "service has no latest-Budget fallback");
  assert(service.includes("readBudgetQuoteBasis(budget.assumptions)"), "service uses canonical readBudgetQuoteBasis");
  assert(service.includes("quote.projectId !== project.id"), "service keeps the Quote/project binding check");
  assert(service.includes("assertResourceBelongsToTenant"), "service keeps the tenant check");
  const createAt = service.indexOf("prisma.tender.create(");
  assert(createAt > service.indexOf("await loadTenderBinding(input)") && service.indexOf("await loadTenderBinding(input)") > 0, "binding validated before prisma.tender.create");
  assert(/budgetId: budget\.id,/.test(service.slice(createAt, createAt + 300)), "Tender persists the validated budgetId");
  assert(/budgetId: string;/.test(service), "GenerateTenderInput.budgetId is required");
  assert(routeSrc.includes("!projectId || !quoteId || !budgetId"), "route requires budgetId");
  assert(routeSrc.includes("err instanceof TenderBindingError") && routeSrc.includes("status: err.status"), "route maps TenderBindingError status");
  for (const token of ["runSaasApiGate", '"canGenerateTender"', "recordTenderAsDeal", "onTenderGenerated", "trackTenderGenerated"]) {
    assert(routeSrc.includes(token), `route keeps ${token}`);
  }
  console.log("✓ source: no latest-Budget fallback, canonical basis, validation before create, route 400/404/409 mapping, gates kept");
}

function checkScope() {
  const lines = (cmd: string) =>
    execSync(cmd, { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  const allowed = new Set([SERVICE, ROUTE, VERIFIER]);
  const knownDirty = new Set([
    "lib/commercial/action-delivery/index.ts",
    "lib/payments/wechatProvider.ts",
    "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql",
    "login-gzip.html",
  ]);
  for (const file of [...lines("git diff --name-only HEAD"), ...lines("git ls-files --others --exclude-standard")]) {
    if (knownDirty.has(file)) continue;
    assert(allowed.has(file), `C.3-A scope: unexpected change ${file}`);
  }
  console.log("✓ scope (tender service + tender generate route + this verifier; no Prisma / PDF / ZIP / page change)");
}

async function main() {
  const fixtures = await buildFixtures();
  const snapshotBefore = commercialSnapshot();
  await checkValidPair(fixtures);
  await checkMismatchedPair(fixtures);
  await checkMissingBudgetId(fixtures);
  await checkQuoteNotReady(fixtures);
  await checkQuoteOtherProject(fixtures);
  await checkBudgetOtherProject(fixtures);
  await checkMissingRows(fixtures);
  await checkRoute(fixtures);
  checkFacts(fixtures, snapshotBefore);
  checkSource();
  checkScope();
  console.log("\nverify-c3-a-tender-creation-binding: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * C.3-C — Product Tender Routing Closure verification.
 * Project → Tender link = latest Budget + the Quote that Budget was calculated from (never
 * quotes[0] + budgets[0]); the Tender page only POSTs with projectId + quoteId + budgetId, shows
 * concrete binding reasons, keeps the returned tenderId and downloads the ZIP with
 * projectId + tenderId + organizationId only. Runs the real quote / budget / tender services,
 * the real POST /api/tender/generate handler and the real download helper against an in-memory
 * Prisma stub (gate / CRM / sales / analytics stubbed). No DB, no network, no files.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const ROUTE_HELPER = "lib/services/tender/projectTenderRoute.ts";
const CLIENT_HELPER = "app/(product)/tender-generation-client.ts";
const PROJECT_PAGE = "app/(workspace)/projects/[id]/page.tsx";
const TENDER_PAGE = "app/(product)/tender/page.tsx";
const VERIFIER = "scripts/verify-c3-c-product-tender-routing.ts";

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

function nextDate() {
  return new Date(Date.UTC(2026, 9, 1) + ++db.seq * 1000);
}

function clone(row: Row | undefined) {
  return row ? structuredClone(row) : null;
}

function insert(map: Map<string, Row>, prefix: string, data: Record<string, unknown>, defaults: Record<string, unknown> = {}) {
  const now = nextDate();
  const row: Row = { id: `${prefix}-${db.seq}`, createdAt: now, updatedAt: now, ...defaults, ...structuredClone(data) };
  map.set(row.id, row);
  return structuredClone(row);
}

function update(map: Map<string, Row>, where: { id: string }, data: Record<string, unknown>) {
  const row = map.get(where.id);
  if (!row) throw new Error(`${where.id} not found`);
  Object.assign(row, structuredClone(data));
  return structuredClone(row);
}

stubModule("lib/prisma", {
  prisma: {
    project: {
      findUnique: async ({ where }: { where: { id: string } }) => clone(db.projects.get(where.id)),
    },
    quote: {
      create: async ({ data }: { data: Record<string, unknown> }) => insert(db.quotes, "q", data, { content: null, orchestrationId: null }),
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => update(db.quotes, where, data),
      findUnique: async ({ where, include }: { where: { id: string }; include?: { project?: boolean } }) => {
        const row = clone(db.quotes.get(where.id));
        if (row && include?.project) row.project = clone(db.projects.get(String(row.projectId)));
        return row;
      },
    },
    budget: {
      create: async ({ data }: { data: Record<string, unknown> }) => insert(db.budgets, "b", data),
      findUnique: async ({ where }: { where: { id: string } }) => clone(db.budgets.get(where.id)),
    },
    tender: {
      create: async ({ data }: { data: Record<string, unknown> }) => insert(db.tenders, "t", data),
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => update(db.tenders, where, data),
      findUnique: async ({ where }: { where: { id: string } }) => clone(db.tenders.get(where.id)),
    },
  },
});

const ORG = "org-c3c";
const PROJECT = "p-c3c";
const OTHER_PROJECT = "p-c3c-other";
const NO_BUDGET_PROJECT = "p-c3c-no-budget";
const EMPTY_PROJECT = "p-c3c-empty";
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
  runSaasApiGate: async () => ({ organizationId: ORG, userId: "user-c3c", traceId: "trace-c3c", feature: { plan: "ENTERPRISE" } }),
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
const routeHelper = require("../lib/services/tender/projectTenderRoute") as typeof import("../lib/services/tender/projectTenderRoute");
const client = require("../app/(product)/tender-generation-client") as typeof import("../app/(product)/tender-generation-client");
const generateRoute = require("../app/api/tender/generate/route") as typeof import("../app/api/tender/generate/route");
const download = require("../components/documents/downloadTenderPack") as typeof import("../components/documents/downloadTenderPack");
/* eslint-enable @typescript-eslint/no-require-imports */

// ---------------------------------------------------------------------------
// Fixtures through the real services
// ---------------------------------------------------------------------------

function projectRow(id: string): Row {
  return {
    id,
    name: "C3C投标路由验收",
    clientName: "C3C Corp",
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
  };
}

async function quoteVersion(projectId: string, ellipticalQuantity: number) {
  const base = await quoteService.generateQuote({
    projectId,
    workspaceId: "ws-c3c",
    organizationId: ORG,
    companyInfo: { companyName: "C3C Corp", targetUsers: 200, areaM2: 400 },
  });
  const version = await quoteService.createQuoteVersionWithSelections({
    baseQuoteId: base.quote.id,
    organizationId: ORG,
    projectId,
    decidedBy: "user-c3c",
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
  return (await budgetService.calculateBudget({ quoteId, organizationId: ORG, projectId, budgetTier: "mid" })).budget.id;
}

/** Same data the Project page reads through getProjectById (quotes / budgets newest first). */
function projectPageData(projectId: string) {
  const newest = (map: Map<string, Row>) =>
    [...map.values()]
      .filter((r) => r.projectId === projectId)
      .sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime())
      .map((r) => structuredClone(r));
  return { id: projectId, quotes: newest(db.quotes).slice(0, 5), budgets: newest(db.budgets).slice(0, 1) };
}

async function projectTenderRoute(projectId: string) {
  const project = projectPageData(projectId);
  const route = await routeHelper.resolveProjectTenderRoute({
    projectId: project.id,
    latestBudget: project.budgets[0] as { id: string; projectId: string; assumptions: unknown } | undefined,
  });
  return { project, route };
}

function rowCounts() {
  return json({ quotes: db.quotes.size, budgets: db.budgets.size, tenders: db.tenders.size });
}

/** Browser fetch → real POST /api/tender/generate handler. */
let generatePosts = 0;
const routeFetch = (async (url: string, init?: RequestInit) => {
  generatePosts += 1;
  assert(url === "/api/tender/generate", `generate endpoint (got ${url})`);
  return generateRoute.POST(new Request(`http://localhost${url}`, init) as never);
}) as unknown as typeof fetch;

// ---------------------------------------------------------------------------
// A–D Project → Tender link
// ---------------------------------------------------------------------------

async function checkStaleQuoteWithoutBudget() {
  db.projects.set(PROJECT, projectRow(PROJECT));
  const q1 = await quoteVersion(PROJECT, 9);
  const b1 = await budgetFor(q1, PROJECT);
  const q2 = await quoteVersion(PROJECT, 8);

  const { project, route } = await projectTenderRoute(PROJECT);
  assert(project.quotes[0].id === q2 && project.budgets[0].id === b1, "A. fixture: newest Quote = Q2, newest Budget = B1");
  assert(route.kind === "ready" && route.quoteId === q1 && route.budgetId === b1, `A. Tender link = Q1 + B1 (got ${json(route)})`);

  let legacyPair: unknown = null;
  try {
    await tenderService.generateTender({ projectId: PROJECT, quoteId: q2, budgetId: b1, organizationId: ORG });
  } catch (err) {
    legacyPair = err;
  }
  assert(
    legacyPair instanceof tenderService.TenderBindingError && legacyPair.code === "BUDGET_QUOTE_MISMATCH",
    "A. the former quotes[0] + budgets[0] pair (Q2 + B1) is exactly what the server rejects",
  );
  console.log("✓ A. Q1 + B1, then Q2 without B2 → Tender link stays Q1 + B1 (old quotes[0] + budgets[0] = Q2 + B1 would be rejected 409)");
  return { q1, b1, q2 };
}

async function checkNewPair(ids: { q2: string }) {
  const b2 = await budgetFor(ids.q2, PROJECT);
  const { route } = await projectTenderRoute(PROJECT);
  assert(route.kind === "ready" && route.quoteId === ids.q2 && route.budgetId === b2, `B. Tender link = Q2 + B2 (got ${json(route)})`);
  console.log("✓ B. Q2 + B2 → Tender link = Q2 + B2");
  return b2;
}

async function checkNoBudget() {
  db.projects.set(NO_BUDGET_PROJECT, projectRow(NO_BUDGET_PROJECT));
  db.projects.set(EMPTY_PROJECT, projectRow(EMPTY_PROJECT));
  await quoteVersion(NO_BUDGET_PROJECT, 9);
  for (const projectId of [NO_BUDGET_PROJECT, EMPTY_PROJECT]) {
    const { route } = await projectTenderRoute(projectId);
    assert(json(route) === json({ kind: "budget-required", reason: "NO_BUDGET" }), `C. ${projectId}: no Tender link, budget required (got ${json(route)})`);
  }
  console.log("✓ C. no Budget (with or without Quote) → no Tender generation link; NO_BUDGET → guide to Budget");
}

async function checkInvalidBasis(ids: { q1: string; b1: string }) {
  db.projects.set(OTHER_PROJECT, projectRow(OTHER_PROJECT));
  const otherQuote = await quoteVersion(OTHER_PROJECT, 9);
  const failedQuote = await quoteVersion(PROJECT, 9);
  db.quotes.get(failedQuote)!.status = "FAILED";
  const b1 = db.budgets.get(ids.b1)!;
  const variants: Array<[string, Record<string, unknown>]> = [
    ["basis line missing", { assumptions: ["当前预算为投标阶段建议区间，不代表最终成交价。"] }],
    ["basis quoteId empty", { assumptions: ["基于 quoteId= 的方案器材配置估算"] }],
    ["assumptions not an array", { assumptions: null }],
    ["basis → unknown Quote", { assumptions: ["基于 quoteId=q-missing 的方案器材配置估算"] }],
    ["basis → other project's Quote", { assumptions: [`基于 quoteId=${otherQuote} 的方案器材配置估算`] }],
    ["basis → FAILED Quote", { assumptions: [`基于 quoteId=${failedQuote} 的方案器材配置估算`] }],
    ["Budget of another project", { projectId: OTHER_PROJECT }],
  ];
  for (const [label, patch] of variants) {
    const route = await routeHelper.resolveProjectTenderRoute({
      projectId: PROJECT,
      latestBudget: { ...structuredClone(b1), ...patch } as { id: string; projectId: string; assumptions: unknown },
    });
    assert(json(route) === json({ kind: "budget-required", reason: "BUDGET_BASIS_INVALID" }), `D. ${label}: no Tender ids (got ${json(route)})`);
  }

  const src = read(PROJECT_PAGE);
  const tenderHrefAt = src.indexOf("href={`/tender?projectId=");
  const tenderHref = src.slice(tenderHrefAt, src.indexOf("className=", tenderHrefAt));
  assert(tenderHrefAt > 0 && /tenderBinding\.quoteId/.test(tenderHref) && /tenderBinding\.budgetId/.test(tenderHref), "D. page builds the Tender URL only from the resolved binding");
  assert(!/quotes\[0\]|budgets\[0\]/.test(tenderHref), "D. Tender URL has no quotes[0] / budgets[0]");
  assert(src.includes("canGenerateTender && tenderBinding ?"), "D. Tender link rendered only for a ready binding");
  assert(src.includes("latestBudget: project.budgets[0]") && src.includes("resolveProjectTenderRoute("), "D. Budget chosen first, Quote derived from it");
  assert(/quoteId: tenderBinding\?\.quoteId,\s*budgetId: tenderBinding\?\.budgetId,/.test(src), "D. locked-Tender upgrade context uses the same binding");
  assert(src.includes("请先为当前方案生成预算") && src.includes("请重新计算预算"), "D. budget guidance shown instead of a Tender URL");
  const helper = read(ROUTE_HELPER);
  assert(helper.includes("readBudgetQuoteBasis(budget.assumptions)") && !/findFirst|orderBy|quotes\[0\]/.test(helper), "D. helper uses the canonical basis reader, no latest-Quote selector");
  console.log("✓ D. missing / empty / malformed basis, unknown / foreign / FAILED Quote, foreign Budget → BUDGET_BASIS_INVALID, no Tender URL built");
}

// ---------------------------------------------------------------------------
// E–H Tender page
// ---------------------------------------------------------------------------

async function checkMissingBudgetNoPost(ids: { q2: string }) {
  const before = generatePosts;
  for (const budgetId of ["", "   "]) {
    const outcome = await client.submitTenderGeneration("/api/tender/generate", { projectId: PROJECT, quoteId: ids.q2, budgetId, organizationId: ORG }, routeFetch);
    assert(!outcome.ok && outcome.code === "BUDGET_ID_REQUIRED" && outcome.message.includes("先生成预算"), `E. budgetId=${json(budgetId)} → BUDGET_ID_REQUIRED 中文提示`);
  }
  const noQuote = await client.submitTenderGeneration("/api/tender/generate", { projectId: PROJECT, quoteId: "", budgetId: "b-x", organizationId: ORG }, routeFetch);
  assert(!noQuote.ok && noQuote.code === "QUOTE_REQUIRED", "E. missing quoteId → QUOTE_REQUIRED");
  assert(generatePosts === before, "E. no POST /api/tender/generate without projectId + quoteId + budgetId");

  const page = read(TENDER_PAGE);
  const handler = page.slice(page.indexOf("async function handleGenerate"), page.indexOf("async function handleDownloadPack"));
  assert(handler.indexOf("missingTenderGenerationContext({ projectId, quoteId, budgetId })") > 0, "E. page guards before generating");
  assert(handler.indexOf("missingTenderGenerationContext(") < handler.indexOf("submitTenderGeneration("), "E. guard precedes the POST");
  assert(page.includes("const missingContext = !projectId || !quoteId || !budgetId;"), "E. generate button hidden without budgetId");
  assert(page.includes("当前方案尚未生成预算，请先生成预算后再生成投标文件。") && page.includes('productHref("/budget"'), "E. 中文提示 + 返回预算入口");
  assert(!page.includes("...(budgetId ? { budgetId } : {})") && !page.includes("alert("), "E. no optional-budgetId POST, no alert");
  console.log("✓ E. Tender page without budgetId → no POST, 中文提示先生成预算 + 返回预算入口");
}

async function checkServerReasons(ids: { q1: string; b1: string; q2: string }) {
  const counts = rowCounts();
  const otherQuote = [...db.quotes.values()].find((q) => q.projectId === OTHER_PROJECT)!.id;
  const otherBudget = await budgetFor(otherQuote, OTHER_PROJECT);
  const failedQuote = await quoteVersion(PROJECT, 9);
  const failedBudget = await budgetFor(failedQuote, PROJECT);
  db.quotes.get(failedQuote)!.status = "FAILED";
  const fixtureCounts = rowCounts();
  assert(fixtureCounts !== counts, "F. fixtures added");

  const cases: Array<[string, { quoteId: string; budgetId: string }, string, string]> = [
    ["Q2 + B1", { quoteId: ids.q2, budgetId: ids.b1 }, "BUDGET_QUOTE_MISMATCH", "预算不是基于当前方案版本计算的，请为当前方案重新计算预算。"],
    ["FAILED Quote", { quoteId: failedQuote, budgetId: failedBudget }, "QUOTE_NOT_READY", "方案尚未就绪，请稍后刷新或重新生成方案。"],
    ["other-project Quote", { quoteId: otherQuote, budgetId: otherBudget }, "QUOTE_PROJECT_MISMATCH", "方案不属于当前项目，请返回项目页重新进入。"],
    ["other-project Budget", { quoteId: ids.q1, budgetId: otherBudget }, "BUDGET_PROJECT_MISMATCH", "预算不属于当前项目，请返回项目页重新进入。"],
  ];
  for (const [label, pair, code, message] of cases) {
    const outcome = await client.submitTenderGeneration("/api/tender/generate", { projectId: PROJECT, ...pair, organizationId: ORG }, routeFetch);
    assert(!outcome.ok && outcome.code === code && outcome.message === message, `F. ${label} → ${code}: ${message} (got ${json(outcome)})`);
    assert(!("tenderId" in outcome), `F. ${label}: no tenderId`);
  }
  const serverMissingBudget = (async () =>
    new Response(json({ ok: false, code: "BUDGET_ID_REQUIRED" }), { status: 400, headers: { "content-type": "application/json" } })) as unknown as typeof fetch;
  const missing = await client.submitTenderGeneration("/api/tender/generate", { projectId: PROJECT, quoteId: ids.q1, budgetId: ids.b1, organizationId: ORG }, serverMissingBudget);
  assert(!missing.ok && missing.message === "当前方案尚未生成预算，请先生成预算后再生成投标文件。", "F. BUDGET_ID_REQUIRED → 中文提示");
  const unknown = (async () => new Response("oops", { status: 500 })) as unknown as typeof fetch;
  const fallback = await client.submitTenderGeneration("/api/tender/generate", { projectId: PROJECT, quoteId: ids.q1, budgetId: ids.b1, organizationId: ORG }, unknown);
  assert(!fallback.ok && fallback.message === client.TENDER_GENERATION_FALLBACK_MESSAGE, "F. unknown failure keeps the generic retry text");
  assert(rowCounts() === fixtureCounts, "F. rejected requests create no Tender");

  const page = read(TENDER_PAGE);
  assert(page.includes("setMessage(outcome.message)") && page.includes("TENDER_BUDGET_REMEDY_CODES.has(errorCode)") && page.includes("返回预算页重新计算"), "F. page shows the server reason and a budget remedy link");
  console.log("✓ F. BUDGET_QUOTE_MISMATCH / QUOTE_NOT_READY / QUOTE_PROJECT_MISMATCH / BUDGET_PROJECT_MISMATCH / BUDGET_ID_REQUIRED → 明确中文原因（real route codes）, no Tender");
}

async function checkSuccessAndDownload(ids: { q2: string; b2: string }) {
  const before = db.tenders.size;
  const outcome = await client.submitTenderGeneration("/api/tender/generate", { projectId: PROJECT, quoteId: ids.q2, budgetId: ids.b2, organizationId: ORG }, routeFetch);
  assert(outcome.ok, `G. Q2 + B2 generates (got ${json(outcome)})`);
  const tenderId = (outcome as { tenderId: string }).tenderId;
  const row = db.tenders.get(tenderId)!;
  assert(db.tenders.size === before + 1 && row.quoteId === ids.q2 && row.budgetId === ids.b2 && row.status === "READY", "G. returned tenderId = persisted READY Tender bound to Q2 + B2");

  const requests: Array<{ url: string; headers: Record<string, string>; body: Record<string, unknown> }> = [];
  const g = globalThis as Record<string, unknown>;
  const savedFetch = g.fetch;
  const savedDocument = g.document;
  let clicked = 0;
  g.fetch = async (url: string, init: RequestInit) => {
    requests.push({ url, headers: init.headers as Record<string, string>, body: JSON.parse(String(init.body)) });
    return new Response(new Blob([Buffer.from("PK\u0003\u0004")]), { status: 200, headers: { "content-type": "application/zip" } });
  };
  g.document = { createElement: () => ({ click: () => (clicked += 1) }) };
  try {
    await download.downloadTenderPack({ projectId: PROJECT, tenderId, organizationId: ORG });
  } finally {
    g.fetch = savedFetch;
    g.document = savedDocument;
  }
  assert(requests.length === 1 && requests[0].url === "/api/pdf/tender/zip" && clicked === 1, "G. one ZIP request, file handed to the browser");
  assert(json(Object.keys(requests[0].body).sort()) === json(["planId", "projectId", "tenderId"]), `G. ZIP body = projectId + tenderId (+ planId alias) (got ${json(requests[0].body)})`);
  assert(requests[0].body.tenderId === tenderId && requests[0].body.projectId === PROJECT && requests[0].headers["x-organization-id"] === ORG, "G. ZIP request carries projectId + tenderId + organizationId");
  assert(!json(requests[0]).includes(ids.q2) && !json(requests[0]).includes(ids.b2), "G. no quoteId / budgetId sent to the ZIP");

  const page = read(TENDER_PAGE);
  const handler = page.slice(page.indexOf("async function handleGenerate"), page.indexOf("async function handleDownloadPack"));
  assert(handler.indexOf("setTenderId(generatedTenderId)") > handler.indexOf("if (!outcome.ok)"), "G. tenderId saved only after a successful outcome");
  assert(page.includes("downloadTenderPack({ projectId, tenderId, organizationId })"), "G. page downloads with projectId + tenderId + organizationId");
  console.log("✓ G. success → tenderId of the persisted Tender saved; ZIP download sends projectId + tenderId + organizationId only");
}

function checkNoPrematureCompletion() {
  const page = read(TENDER_PAGE);
  assert(page.includes("const tenderReady = Boolean(tenderId);") && page.includes("const deliveryComplete = packDownloaded && tenderReady;"), "H. completion derived from a persisted tenderId");
  const completionAt = page.indexOf("正式项目交付路径已完成");
  assert(completionAt > 0 && page.lastIndexOf("{deliveryComplete ? (", completionAt) > page.lastIndexOf(") : null}", completionAt), "H. 交付完成 text only under deliveryComplete");
  const readyAt = page.indexOf("投标文件已就绪");
  assert(page.lastIndexOf("{tenderReady", readyAt) > 0 && readyAt - page.lastIndexOf("{tenderReady", readyAt) < 40, "H. 投标文件已就绪 only when tenderReady");
  assert(/\{tenderReady && projectId \? \(/.test(page), "H. download button only for a persisted Tender");
  const downloadHandler = page.slice(page.indexOf("async function handleDownloadPack"), page.indexOf("const missingContext"));
  assert(downloadHandler.includes("!tenderId") && downloadHandler.indexOf("await downloadTenderPack(") < downloadHandler.indexOf("setPackDownloaded(true)"), "H. packDownloaded set only after a Tender-bound download");
  const handler = page.slice(page.indexOf("async function handleGenerate"), page.indexOf("async function handleDownloadPack"));
  const successAt = handler.indexOf('setMessage("投标文件已生成")');
  assert(successAt > handler.indexOf("setTenderId(generatedTenderId)") && handler.indexOf('setTenderId("")') < handler.indexOf("submitTenderGeneration("), "H. 投标文件已生成 only after the tenderId is stored; reset before each attempt");
  assert(!page.includes("downloadReady"), "H. no independent download-ready flag");
  console.log("✓ H. 投标文件已就绪 / 下载 / 交付完成 shown only after a persisted Tender (tenderId) and a Tender-bound download");
}

// ---------------------------------------------------------------------------
// I. C.3-A / C.3-B functional assertions
// ---------------------------------------------------------------------------

function runVerifier(rel: string) {
  try {
    return { output: execSync(`npx tsx ${rel}`, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }), failed: false };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string };
    return { output: `${e.stdout ?? ""}\n${e.stderr ?? ""}`, failed: true };
  }
}

function checkPriorWorkPackages() {
  const expectations: Array<[string, string[]]> = [
    ["scripts/verify-c3-a-tender-creation-binding.ts", ["A.", "B.", "C.", "D.", "E.", "F.", "G.", "route:", "H.", "source:"]],
    ["scripts/verify-c3-b-tender-zip-binding.ts", ["A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.", "I.", "J.", "source:"]],
  ];
  for (const [rel, sections] of expectations) {
    const { output, failed } = runVerifier(rel);
    const passed = output.split(/\r?\n/).filter((l) => l.startsWith("✓ ")).map((l) => l.slice(2));
    for (const section of sections) {
      assert(passed.some((l) => l.startsWith(section)), `I. ${rel}: functional section ${section} passes`);
    }
    if (failed) {
      const asserts = output.match(/ASSERT: [^\r\n]*/g) ?? [];
      assert(asserts.length === 1 && /scope: unexpected change /.test(asserts[0]), `I. ${rel}: only failure is its frozen scope allowlist (got ${json(asserts)})`);
    }
  }
  console.log("✓ I. C.3-A (A–H, route, source) and C.3-B (A–J, source) functional assertions pass; only their scope allowlists flag the C.3-C files");
}

function checkScope() {
  const lines = (cmd: string) =>
    execSync(cmd, { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  const allowed = new Set([
    "app/api/tender/generate/route.ts",
    "lib/services/tender.service.ts",
    "app/api/pdf/tender/zip/route.ts",
    "components/documents/downloadTenderPack.ts",
    "components/pilot/IntakeArtifactCenter.tsx",
    TENDER_PAGE,
    PROJECT_PAGE,
    ROUTE_HELPER,
    CLIENT_HELPER,
    "scripts/verify-c3-a-tender-creation-binding.ts",
    "scripts/verify-c3-b-tender-zip-binding.ts",
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
    assert(allowed.has(file), `C.3-C scope: unexpected change ${file}`);
  }
  assert(lines("git diff --name-only HEAD -- prisma/schema.prisma lib/pdf lib/services/budget.service.ts lib/services/quote.service.ts").length === 0, "scope: no Prisma schema / PDF / budget / quote service change");
  console.log("✓ scope (C.3 files only; no Prisma / PDF / pricing change)");
}

async function main() {
  const first = await checkStaleQuoteWithoutBudget();
  const b2 = await checkNewPair(first);
  await checkNoBudget();
  await checkInvalidBasis(first);
  await checkMissingBudgetNoPost(first);
  await checkServerReasons(first);
  await checkSuccessAndDownload({ q2: first.q2, b2 });
  checkNoPrematureCompletion();
  checkPriorWorkPackages();
  checkScope();
  console.log("\nverify-c3-c-product-tender-routing: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

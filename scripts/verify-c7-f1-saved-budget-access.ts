/**
 * Product Core v2 — C.7-F1 Saved Budget Access & Price Visibility verifier.
 *
 * Asserts AC-1 … AC-6 without a live DB:
 *  - AC-1 project detail: with saved Budgets the primary Budget entry opens the newest saved Budget;
 *  - AC-2 server-side, organization-scoped, paginated history (no permanent cap, no client read API);
 *  - AC-3 detail shows the persisted quantity / unit range / subtotal / basis / verified status / total,
 *         for detailed, legacy category-total and unrecognized snapshots; 已核实 only with a complete fact;
 *  - AC-4 the PDF request carries the page's budgetId to the existing route;
 *  - AC-5 an independent 重新计算预算 entry to /budget remains;
 *  - AC-6 the Budget count is the real total (not the take:1 include);
 *  - scope: no Schema / migration / Budget calculation / Quote / procurement / PDF rendering / Tender change.
 *
 * Run: npx tsx scripts/verify-c7-f1-saved-budget-access.ts
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
/** Accepted C.7 commit (feat(product): add organization procurement catalog UX). */
const BASE = "138a4c28";
const DIR = "app/(workspace)/projects/[id]";
const PROJECT_PAGE = `${DIR}/page.tsx`;
const HISTORY_PAGE = `${DIR}/budgets/page.tsx`;
const DETAIL_PAGE = `${DIR}/budgets/[budgetId]/page.tsx`;
const VIEW = `${DIR}/budgets/saved-budget-view.ts`;
const PDF_BUTTON = `${DIR}/budgets/[budgetId]/SavedBudgetPdfButton.tsx`;
const SERVICE = "lib/services/saved-budget.service.ts";
const VERIFIER = "scripts/verify-c7-f1-saved-budget-access.ts";
const KNOWN_UNRELATED_DIRTY = new Set([
  "lib/commercial/action-delivery/index.ts",
  "lib/payments/wechatProvider.ts",
  "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql",
  "login-gzip.html",
]);

let passed = 0;
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`ASSERT: ${message}`);
  passed += 1;
}
const out = (line: string) => console.log(line);
const json = (v: unknown) => JSON.stringify(v);
const git = (args: string) => execSync(`git ${args}`, { cwd: ROOT, encoding: "utf8" });
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), "utf8");
const lines = (s: string) => s.split(/\r?\n/).filter(Boolean);
const decode = (s: string) =>
  s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<!-- -->/g, "");

/* ───────── stubs (installed before the service loads) ───────── */
type Call = { model: string; method: string; args: Record<string, unknown> };
const calls: Call[] = [];
const state = {
  org: "org_f1" as string | null,
  canGenerateBudget: true,
  project: { id: "proj_f1", name: "C7-F1 项目" } as { id: string; name: string } | null,
  total: 0,
  rows: [] as Array<Record<string, unknown>>,
  one: null as Record<string, unknown> | null,
};

function stubModule(rel: string, exports: Record<string, unknown>) {
  const filename = require.resolve(path.join(ROOT, rel));
  const mod = new Module(filename);
  mod.filename = filename;
  mod.loaded = true;
  mod.exports = exports;
  require.cache[filename] = mod;
}
const record = (model: string, method: string, result: () => unknown) => async (args: Record<string, unknown> = {}) => {
  calls.push({ model, method, args });
  return result();
};
stubModule("lib/prisma", {
  prisma: {
    project: { findFirst: record("project", "findFirst", () => state.project) },
    budget: {
      count: record("budget", "count", () => state.total),
      findMany: record("budget", "findMany", () => state.rows),
      findFirst: record("budget", "findFirst", () => state.one),
    },
  },
});
stubModule("lib/organization/single-org-context", {
  resolveExactSingleOrganizationIdForUser: async () => state.org,
});
stubModule("lib/billing/subscription/subscription.resolver", {
  resolveOrganizationFeatures: async () => ({ plan: "PRO", status: "ACTIVE", flags: { canGenerateBudget: state.canGenerateBudget }, currentPeriodEnd: null }),
});

/* eslint-disable @typescript-eslint/no-require-imports */
const service = require("../lib/services/saved-budget.service") as typeof import("../lib/services/saved-budget.service");
const view = require("../app/(workspace)/projects/[id]/budgets/saved-budget-view") as typeof import("../app/(workspace)/projects/[id]/budgets/saved-budget-view");
const pdf = require("../app/(workspace)/projects/[id]/budgets/[budgetId]/SavedBudgetPdfButton") as typeof import("../app/(workspace)/projects/[id]/budgets/[budgetId]/SavedBudgetPdfButton");
const priceBasis = require("../app/(product)/budget/price-basis") as typeof import("../app/(product)/budget/price-basis");
const react = require("react") as typeof import("react");
const server = require("react-dom/server") as typeof import("react-dom/server");
/* eslint-enable @typescript-eslint/no-require-imports */

const ORG = "org_f1";
const PROJECT = "proj_f1";
const T200_FACT = { unitPrice: 30000, currency: "CNY", sourceType: "supplier_quote", sourceReference: "Q-T200-001", quotedAt: "2026-10-01", supplier: "华东供应商", taxStatus: "tax_included" };
const row = (extra: Record<string, unknown>) => ({ category: "有氧设备", specLevel: "standard", sourceType: "placeholder", quantity: 2, unitPriceMin: 6000, unitPriceMax: 12000, subtotalMin: 12000, subtotalMax: 24000, ...extra });
const DETAILED = [
  row({ name: "商业级跑步机", quantity: 4, unitPriceMin: 30000, unitPriceMax: 30000, subtotalMin: 120000, subtotalMax: 120000, priceBasis: "VERIFIED", priceFact: T200_FACT }),
  row({ name: "椭圆机", priceBasis: "ESTIMATE", estimateBasis: { source: "organization-price-reference", revision: 3, sourceNote: "华东参考" } }),
  row({ name: "综合训练器", category: "力量设备", priceBasis: "ESTIMATE" }),
  row({ name: "旧明细行（无 priceBasis）" }),
  row({ name: "凭据不完整", unitPriceMin: 8000, unitPriceMax: 8000, subtotalMin: 16000, subtotalMax: 16000, priceBasis: "VERIFIED", priceFact: { ...T200_FACT, unitPrice: 8000, sourceReference: "" } }),
  row({ name: "单价不一致", unitPriceMin: 9000, unitPriceMax: 9000, subtotalMin: 18000, subtotalMax: 18000, priceBasis: "VERIFIED", priceFact: { ...T200_FACT, unitPrice: 9500 } }),
  row({ name: "区间单价", unitPriceMin: 9000, unitPriceMax: 9900, priceBasis: "VERIFIED", priceFact: { ...T200_FACT, unitPrice: 9000 } }),
];
const ASSUMPTIONS = ["基于 quoteId=quote_f1 的方案器材配置估算", "预算档位（设备单价品质）：high", "方案人数：120", "方案面积：300㎡"];
const budgetRow = (id: string, items: unknown, assumptions: unknown = ASSUMPTIONS, createdAt = "2026-10-08T02:00:00.000Z") => ({
  id,
  projectId: PROJECT,
  currency: "CNY",
  totalEstimateMin: 200000,
  totalEstimateMax: 260000,
  items,
  assumptions,
  createdAt: new Date(createdAt),
});

/* ───────── AC-2 / isolation: service ───────── */
async function checkService() {
  const scoped = { projectId: PROJECT, project: { organizationId: ORG } };

  calls.length = 0;
  state.total = 7;
  assert((await service.countProjectBudgets(PROJECT, ORG)) === 7, "AC-6: count returns the real total");
  assert(json(calls) === json([{ model: "budget", method: "count", args: { where: scoped } }]), `isolation: count scoped by projectId + project.organizationId (got ${json(calls)})`);
  calls.length = 0;
  assert((await service.countProjectBudgets(PROJECT, "  ")) === 0 && calls.length === 0, "isolation: empty organization → 0 without a query");

  // AC-2 pagination over every record.
  state.total = 45;
  state.rows = [budgetRow("b45", DETAILED)];
  for (const [requested, expectedPage, expectedSkip] of [[1, 1, 0], [2, 2, 20], [3, 3, 40], [99, 3, 40], [0, 1, 0], [-4, 1, 0], [1.5, 1, 0]] as const) {
    calls.length = 0;
    const page = await service.listProjectBudgets(PROJECT, ORG, requested);
    const findMany = calls.find((c) => c.method === "findMany");
    assert(page.total === 45 && page.pageCount === 3 && page.pageSize === service.SAVED_BUDGET_PAGE_SIZE && page.page === expectedPage, `AC-2: page ${requested} → ${expectedPage}/3 of 45`);
    assert(findMany && json(findMany.args.where) === json(scoped) && findMany.args.skip === expectedSkip && findMany.args.take === 20, `AC-2: page ${requested} reads skip ${expectedSkip} take 20, organization-scoped`);
    assert(json(findMany.args.orderBy) === json([{ createdAt: "desc" }, { id: "desc" }]), "AC-2: newest first, deterministic tie-break");
  }
  assert(service.SAVED_BUDGET_PAGE_SIZE === 20, "AC-2: page size 20");
  state.total = 1000;
  calls.length = 0;
  const last = await service.listProjectBudgets(PROJECT, ORG, 50);
  assert(last.pageCount === 50 && last.page === 50 && calls.find((c) => c.method === "findMany")?.args.skip === 980, "AC-2: no permanent cap — record 981–1000 reachable on page 50");
  state.total = 0;
  calls.length = 0;
  const empty = await service.listProjectBudgets(PROJECT, ORG, 3);
  assert(empty.total === 0 && empty.page === 1 && empty.budgets.length === 0 && !calls.some((c) => c.method === "findMany"), "AC-2: empty history, no list query");

  // Parsed snapshot metadata.
  state.total = 2;
  state.rows = [budgetRow("b2", DETAILED), budgetRow("b1", [{ category: "有氧设备", min: 1, max: 2 }], ["旧版预算"])];
  const listed = await service.listProjectBudgets(PROJECT, ORG, 1);
  assert(listed.budgets[0].quoteId === "quote_f1" && listed.budgets[0].budgetTier === "high" && listed.budgets[0].companySize === 120, "AC-3: quoteId / tier / headcount read from the Budget's own assumptions");
  assert(listed.budgets[1].quoteId === null && listed.budgets[1].budgetTier === null && listed.budgets[1].companySize === null, "AC-3: older assumptions → nulls, no inference");

  // getProjectBudget.
  calls.length = 0;
  state.one = budgetRow("b2", DETAILED);
  const one = await service.getProjectBudget(PROJECT, "b2", ORG);
  assert(one?.id === "b2" && json(calls) === json([{ model: "budget", method: "findFirst", args: { where: { id: "b2", ...scoped }, select: calls[0]?.args.select } }]), "isolation: detail lookup = id + projectId + project.organizationId");
  state.one = null;
  assert((await service.getProjectBudget(PROJECT, "foreign", ORG)) === null, "isolation: foreign / other-project budgetId → null");
  calls.length = 0;
  assert((await service.getProjectBudget(PROJECT, " ", ORG)) === null && calls.length === 0, "isolation: blank budgetId → null without a query");

  // Access: org → project ownership → plan feature.
  state.org = null;
  calls.length = 0;
  assert((await service.resolveSavedBudgetProjectAccess("u1", PROJECT)).kind === "not-found" && calls.length === 0, "isolation: no exact single organization → not-found");
  state.org = ORG;
  state.project = null;
  calls.length = 0;
  assert((await service.resolveSavedBudgetProjectAccess("u1", PROJECT)).kind === "not-found", "isolation: project outside the organization → not-found");
  assert(json(calls[0].args.where) === json({ id: PROJECT, organizationId: ORG }), "isolation: project lookup scoped to the user's organization");
  state.project = { id: PROJECT, name: "C7-F1 项目" };
  state.canGenerateBudget = false;
  calls.length = 0;
  const locked = await service.resolveSavedBudgetProjectAccess("u1", PROJECT);
  assert(locked.kind === "locked" && !calls.some((c) => c.model === "budget"), "PRO: no canGenerateBudget → locked, no Budget read");
  state.canGenerateBudget = true;
  assert(json(await service.resolveSavedBudgetProjectAccess("u1", PROJECT)) === json({ kind: "ok", organizationId: ORG, projectId: PROJECT, projectName: "C7-F1 项目" }), "PRO: canGenerateBudget → ok");
  assert((await service.canViewSavedBudgets("")) === false, "PRO: blank organization never viewable");

  const src = read(SERVICE);
  assert(!/\.(create|createMany|update|updateMany|upsert|delete|deleteMany)\(/.test(src), "read-only: service issues no writes");
  assert(!/calculateBudget|generateBudget|procurementProduct|organizationPriceReference|renderBudgetPdf/.test(src), "snapshot: service never recalculates / re-prices / reads procurement or price references");
  assert(src.includes("features.flags.canGenerateBudget === true") && src.includes("resolveOrganizationFeatures"), "PRO: same plan-feature gate as the Budget PDF route (no quota consumed)");
  out("✓ service: count / paginated list (20 per page, no cap) / detail all scoped by projectId + project.organizationId; access = exact org → owned project → canGenerateBudget; read-only, no re-pricing");
}

/* ───────── AC-3: snapshot presentation ───────── */
function checkView() {
  const v = view.readSavedBudgetItems(DETAILED);
  assert(v.kind === "detailed" && v.rows.length === DETAILED.length && v.panelItems.length === DETAILED.length, "AC-3: detailed snapshot recognized");
  const [t200, ellip, strength, legacyRow, incomplete, mismatch, ranged] = v.rows;
  assert(t200.name === "商业级跑步机" && t200.quantity === 4 && t200.unitPriceMin === 30000 && t200.subtotalMin === 120000, "AC-3: quantity / unit / subtotal from the snapshot");
  assert(t200.verifiedSource === "供应商报价 · Q-T200-001 · 报价日期 2026-10-01 · 供应商 华东供应商 · 含税", `AC-3: complete fact → 已核实 source (got ${t200.verifiedSource})`);
  for (const r of [ellip, strength, legacyRow, incomplete, mismatch, ranged]) assert(r.verifiedSource === null, `AC-3: ${r.name} not 已核实`);
  const kinds = v.panelItems.map((item) => priceBasis.budgetItemPriceBasis(item).kind);
  assert(json(kinds) === json(["VERIFIED", "ORGANIZATION_ESTIMATE", "PLATFORM_ESTIMATE", "PLATFORM_ESTIMATE", "PLATFORM_ESTIMATE", "PLATFORM_ESTIMATE", "PLATFORM_ESTIMATE"]), `AC-3: panel basis (incomplete VERIFIED claims downgraded) (got ${json(kinds)})`);
  assert(v.panelItems.slice(4).every((item) => item.priceBasis === "ESTIMATE" && item.priceFact === undefined), "AC-3: downgraded rows carry no priceFact");
  assert(v.panelItems[3].priceBasis === undefined, "compat: old detailed row without priceBasis stays without one (platform estimate)");

  const panel = decode(server.renderToStaticMarkup(react.createElement(priceBasis.BudgetPriceBasisPanel, { items: v.panelItems })));
  assert(panel.includes("已核实单价：1 项") && panel.includes("组织价目估算：1 项") && panel.includes("平台通用估算：5 项"), "AC-3: BudgetPriceBasisPanel reused with the normalized rows");
  assert(panel.includes("单价 30000 - 30000") && !panel.includes("undefined") && !panel.includes("NaN"), "AC-3: panel renders persisted unit prices only");

  // T200: a later procurement price change cannot reach the snapshot.
  const snapshot = structuredClone(DETAILED);
  const afterProcurementEdit = view.readSavedBudgetItems(snapshot);
  assert(afterProcurementEdit.kind === "detailed" && afterProcurementEdit.rows[0].unitPriceMin === 30000 && view.formatSavedBudgetRange(30000, 30000) === "¥30,000", "snapshot: T200 shows the persisted ¥30,000 (view reads only Budget.items)");

  const legacy = view.readSavedBudgetItems([{ category: "有氧设备", min: 10000, max: 20000 }, { category: "力量设备", min: 5000, max: 8000 }]);
  assert(legacy.kind === "legacy" && legacy.rows.length === 2 && legacy.rows[0].min === 10000, "compat: legacy category totals recognized");
  for (const bad of [[], null, "x", {}, [{ category: "" }], [{ category: "有氧设备", quantity: 0, unitPriceMin: 1, unitPriceMax: 1, subtotalMin: 1, subtotalMax: 1 }], [row({}), { category: "有氧设备", min: 1, max: 2 }], [null]]) {
    assert(view.readSavedBudgetItems(bad).kind === "unrecognized", `compat: ${json(bad).slice(0, 50)} → unrecognized`);
  }
  assert(view.readSavedBudgetItems([row({ name: "", subCategory: "椭圆机" })]).kind === "detailed" && (view.readSavedBudgetItems([row({ name: "", subCategory: "椭圆机" })]) as { rows: Array<{ name: string }> }).rows[0].name === "椭圆机", "compat: name falls back to subCategory then category (as the PDF)");

  assert(view.formatSavedBudgetRange(1200.5, 1800) === "¥1,200.5 – ¥1,800", "format: money range");
  assert(view.savedBudgetTierLabel("high") === "高端（单价偏高）" && view.savedBudgetTierLabel(null) === "未记录", "format: tier label");
  assert(view.formatSavedBudgetTime(new Date("2026-10-08T02:05:00.000Z")).includes("10:05"), "format: Asia/Shanghai time");
  for (const [raw, expected] of [[undefined, 1], ["3", 3], ["0", 1], ["-2", 1], ["abc", 1], [["4", "5"], 4], ["9999999", 1]] as const) {
    assert(view.parseSavedBudgetPage(raw as string | string[] | undefined) === expected, `AC-2: page param ${json(raw)} → ${expected}`);
  }
  assert(view.savedBudgetDetailHref("p 1", "b/1") === "/projects/p%201/budgets/b%2F1" && view.savedBudgetHistoryHref("p1", 2) === "/projects/p1/budgets?page=2" && view.savedBudgetHistoryHref("p1") === "/projects/p1/budgets", "routes: encoded detail / history hrefs");
  assert(view.budgetRecalculateHref("p1", "q1") === "/budget?projectId=p1&quoteId=q1" && view.budgetRecalculateHref("p1", null) === "/budget?projectId=p1", "AC-5: recalculation href targets /budget");
  const viewSrc = read(VIEW);
  assert(!/^import (?!type)[^;]*from "(?!@\/lib\/domain\/tender")/m.test(viewSrc) && !/fetch\(|sessionStorage|localStorage|prisma/.test(viewSrc), "AC-3: view module is pure (domain labels only, no I/O / storage)");
  out("✓ view: detailed / legacy / unrecognized snapshots; 已核实 only with a complete matching fact (PDF rule); panel reused; T200 stays ¥30,000; pure");
}

/* ───────── AC-4: PDF bound to budgetId ───────── */
async function checkPdf() {
  const sent: Array<{ url: string; init: RequestInit }> = [];
  const mock = (status: number, body: unknown, contentType = "application/json", size = 10, throws = false) =>
    (async (url: string, init: RequestInit) => {
      sent.push({ url, init });
      if (throws) throw new Error("ECONNRESET");
      return {
        ok: status >= 200 && status < 300,
        status,
        headers: new Headers({ "content-type": contentType }),
        json: async () => body,
        blob: async () => new Blob([new Uint8Array(size)]),
      } as unknown as Response;
    }) as typeof fetch;
  const input = { organizationId: ORG, projectId: PROJECT, budgetId: "b_old_t200", budgetTier: "high" as const, companySize: 120 };

  const ok = await pdf.requestSavedBudgetPdf(input, mock(200, null, "application/pdf", 2048));
  assert(ok.ok, "AC-4: PDF downloaded");
  assert(sent[0].url === "/api/pdf/tender/budget" && sent[0].init.method === "POST" && sent[0].init.credentials === "include", "AC-4: existing Budget PDF route reused (POST)");
  assert((sent[0].init.headers as Record<string, string>)["x-organization-id"] === ORG, "AC-4: organization header sent");
  assert(json(JSON.parse(String(sent[0].init.body))) === json({ projectId: PROJECT, planId: PROJECT, budgetId: "b_old_t200", budgetTier: "high", companySize: 120 }), "AC-4: body carries this page's budgetId");
  assert(json(pdf.savedBudgetPdfRequestBody({ ...input, budgetTier: null, companySize: null })) === json({ projectId: PROJECT, planId: PROJECT, budgetId: "b_old_t200" }), "AC-4: unknown tier / headcount omitted, budgetId kept");
  assert(pdf.savedBudgetPdfFileName("b_old_t200xyz") === "budget-b_old_t2.pdf", "AC-4: file name derived from budgetId");

  const SECRET = "PrismaClientKnownRequestError internal";
  for (const [status, code, expected] of [[404, "BUDGET_NOT_FOUND", "未找到该预算"], [409, "BUDGET_PROJECT_MISMATCH", "不属于当前项目"], [403, "TENANT_ISOLATION", "不属于你的组织"], [403, "BUDGET_NOT_ENTITLED", "升级专业版"], [429, "RATE_LIMITED", "过于频繁"]] as const) {
    const res = await pdf.requestSavedBudgetPdf(input, mock(status, { error: code, message: SECRET }));
    assert(!res.ok && res.error.includes(expected) && !res.error.includes(SECRET), `AC-4: ${code} → fixed copy`);
  }
  const raw500 = await pdf.requestSavedBudgetPdf(input, mock(500, { error: "INTERNAL_ERROR", message: SECRET }));
  const notPdf = await pdf.requestSavedBudgetPdf(input, mock(200, null, "text/html"));
  const emptyPdf = await pdf.requestSavedBudgetPdf(input, mock(200, null, "application/pdf", 0));
  const net = await pdf.requestSavedBudgetPdf(input, mock(0, null, "", 0, true));
  assert(!raw500.ok && raw500.error === "预算 PDF 下载失败，请稍后重试。", "AC-4: raw 500 → fixed fallback, no server text");
  assert(!notPdf.ok && !emptyPdf.ok && notPdf.error.includes("有效的 PDF"), "AC-4: non-PDF / empty body rejected");
  assert(!net.ok && net.error.includes("检查网络") && !net.error.includes("ECONNRESET"), "AC-4: network error → fixed copy");

  const route = read("app/api/pdf/tender/budget/route.ts");
  assert(route.includes("budgetRow = await prisma.budget.findUnique({ where: { id: requestBudgetId } });") && route.includes('deny(409, "BUDGET_PROJECT_MISMATCH"'), "AC-4: route renders exactly the requested budgetId and checks its project (unchanged)");
  const btnSrc = read(PDF_BUTTON);
  assert(!/sessionStorage|localStorage/.test(btnSrc) && (btnSrc.match(/fetcher\(/g) ?? []).length === 1, "AC-4: one PDF request, no storage");
  out("✓ PDF: POST /api/pdf/tender/budget with { projectId, planId, budgetId (+ tier / headcount) } and x-organization-id; fixed Chinese errors; route binding unchanged");
}

/* ───────── AC-1 / AC-5 / AC-6 / pages ───────── */
function checkPages() {
  const detail = read(DETAIL_PAGE);
  const history = read(HISTORY_PAGE);
  for (const [name, src] of [["detail", detail], ["history", history]] as const) {
    assert(/const user = await getCurrentUser\(\);\s*if \(!user\) redirect\("\/login"\);/.test(src), `${name}: login required`);
    assert(src.includes("await resolveSavedBudgetProjectAccess(user.id, id)") && src.includes('if (access.kind === "not-found") notFound();'), `${name}: organization + project ownership via the service`);
    const lockedAt = src.indexOf('if (access.kind === "locked")');
    const readAt = Math.max(src.indexOf("await getProjectBudget("), src.indexOf("await listProjectBudgets("));
    assert(lockedAt > 0 && readAt > lockedAt && src.slice(lockedAt, readAt).includes("<ProUpgradeContactCta"), `${name}: PRO lock returns before any Budget read`);
    assert(!/sessionStorage|localStorage|fetch\(|"use client"/.test(src), `${name}: server component, no storage / client fetch`);
    assert(src.includes('export const dynamic = "force-dynamic";'), `${name}: dynamic`);
  }
  assert(detail.includes("await getProjectBudget(access.projectId, budgetId, access.organizationId)") && detail.includes("if (!budget) notFound();"), "detail: budget scoped to the owned project + organization, else 404");
  assert(detail.includes("<BudgetPriceBasisPanel items={view.panelItems} />"), "AC-3: detail reuses BudgetPriceBasisPanel");
  for (const s of ["<th className=\"px-3 py-2 font-medium\">数量</th>", "单价区间", "小计", "核实状态", "已核实 · ${row.verifiedSource}", "估算（未核实）", "总预算：", "旧版预算仅保存了品类合计", "明细快照格式无法识别", "之后修改采购库、组织估算价目表或方案不会改变本预算"]) {
    assert(detail.includes(s), `AC-3: detail shows ${s}`);
  }
  assert(detail.includes("budgetId={budget.id}") && detail.includes("<SavedBudgetPdfButton"), "AC-4: PDF button bound to the displayed budget");
  assert(detail.includes("budgetRecalculateHref(access.projectId, budget.quoteId)") && detail.includes("重新计算预算") && detail.includes("savedBudgetHistoryHref(access.projectId)"), "AC-5: detail keeps recalculation + history entries");
  assert(history.includes("listProjectBudgets(access.projectId, access.organizationId, requestedPage)") && history.includes("上一页") && history.includes("下一页") && history.includes("共 ${result.total} 份预算"), "AC-2: history paginates over the real total");
  assert(history.includes("savedBudgetDetailHref(access.projectId, budget.id)") && history.includes("重新计算预算"), "AC-2 / AC-5: per-budget detail link + recalculation entry");
  assert(!/\b50\b/.test(history) && !/take:\s*50/.test(read(SERVICE)), "AC-2: no fixed 50 cap");

  const page = read(PROJECT_PAGE);
  const basePage = git(`show ${BASE}:"${PROJECT_PAGE}"`);
  assert(page.includes("const budgetCount = await countProjectBudgets(project.id, organizationId);"), "AC-6: real count from the scoped service");
  assert(!page.includes("project.budgets.length} 份预算") && (page.match(/已有 \{budgetCount\} 份预算/g) ?? []).length === 2, "AC-6: both Budget count labels use the real total");
  assert(!page.includes("{canGenerateBudget && latestSavedBudget ? ("), "PRO: viewing saved Budgets does not depend on remaining generation quota");
  const savedCardAt = page.indexOf("{savedBudgetsViewable && latestSavedBudget ? (");
  const recalcCardAt = page.indexOf(") : canGenerateBudget ? (");
  const lockedCardAt = page.indexOf(") : (", recalcCardAt);
  assert(savedCardAt > 0 && recalcCardAt > savedCardAt && lockedCardAt > recalcCardAt, "AC-1: saved-Budget card (plan feature) precedes the calculation card and the locked card");
  const savedCard = page.slice(savedCardAt, recalcCardAt);
  assert(savedCard.indexOf("savedBudgetDetailHref(project.id, latestSavedBudget.id)") < savedCard.indexOf("全部历史预算") && savedCard.includes("查看已保存预算"), "AC-1: primary entry opens the newest saved Budget");
  assert(savedCard.includes("savedBudgetHistoryHref(project.id)"), "AC-2: history entry on the saved-Budget card");
  const recalcLinkAt = savedCard.indexOf("href={budgetRecalcHref}");
  assert(recalcLinkAt > 0 && (savedCard.match(/href=\{budgetRecalcHref\}/g) ?? []).length === 1 && savedCard.lastIndexOf("{canGenerateBudget ? (", recalcLinkAt) > 0 && savedCard.indexOf(") : null}", recalcLinkAt) > recalcLinkAt, "AC-5: 重新计算预算 link on the saved card is rendered only when canGenerateBudget");
  assert(savedCard.includes("{canGenerateBudget ? null : (") && savedCard.includes("<ProUpgradeContactCta") && savedCard.includes("budgetPaywall.currentPlan"), "PRO: quota-exhausted saved card keeps the paywall upgrade prompt for recalculation");
  assert(page.includes("const latestSavedBudget = budgetCount > 0 ? project.budgets[0] : undefined;"), "AC-1: newest = getProjectById's createdAt-desc first row");
  assert(page.includes("const savedBudgetsViewable = latestSavedBudget ? await canViewSavedBudgets(organizationId) : false;"), "PRO: saved-Budget entry gated by the plan feature (same as detail page / PDF route)");
  const lockedCard = (src: string, from: number) => src.slice(src.indexOf(") : (", from), src.indexOf("{canGenerateTender && tenderBinding ? (", from));
  const baseRecalcAt = basePage.indexOf("{canGenerateBudget ? (");
  assert(lockedCard(page, recalcCardAt) === lockedCard(basePage, baseRecalcAt) && lockedCard(page, recalcCardAt).includes("ProUpgradeContactCta"), "frozen: no-saved-Budget locked card identical to baseline");

  // Frozen contracts on the project page.
  for (const s of ["/budget?projectId=", "/tender?projectId=", "quoteId=", "context=", "latestBudget: project.budgets[0]", "resolveProjectTenderRoute(", "canGenerateTender && tenderBinding ?", "请先为当前方案生成预算", "请重新计算预算", 'trigger: "tender_generation_click"', 'trigger: "budget_feature_blocked"', "evaluatePaywall", "下一步：计算预算", "TenderEnterpriseUpgradeCta"]) {
    assert(page.includes(s), `frozen: project page keeps ${s}`);
  }
  assert(!/href=["'`]\/dashboard/.test(page), "frozen: no /dashboard href");
  const tenderBlock = (src: string) => src.slice(src.indexOf("{canGenerateTender && tenderBinding ? ("), src.indexOf("</section>", src.indexOf("{canGenerateTender && tenderBinding ? (")));
  assert(tenderBlock(page) === tenderBlock(basePage) && tenderBlock(page).length > 0, "frozen: Tender step identical to baseline");
  const removed = git(`diff -U0 ${BASE} -- "${PROJECT_PAGE}"`).split(/\r?\n/).filter((l) => l.startsWith("-") && !l.startsWith("---")).map((l) => l.slice(1).trim());
  assert(json(removed) === json(["{canGenerateBudget ? (", "<div className=\"text-xs text-zinc-400\">已有 {project.budgets.length} 份预算</div>"]), `scope: project page only replaces the Budget branch head + count label (got ${json(removed)})`);
  out("✓ pages: login → exact org → owned project → PRO lock before reads; detail + paginated history server-rendered; project page opens newest saved Budget, real count, history + recalculation kept; Tender step / frozen strings unchanged");
}

/* ───────── scope ───────── */
function checkScope() {
  const tracked = lines(git(`diff --name-only ${BASE}`)).filter((f) => !KNOWN_UNRELATED_DIRTY.has(f));
  assert(json(tracked) === json([PROJECT_PAGE]), `scope: tracked change vs ${BASE} is only the project page (got ${json(tracked)})`);
  const untracked = lines(git("ls-files --others --exclude-standard")).filter((f) => !KNOWN_UNRELATED_DIRTY.has(f)).sort();
  assert(json(untracked) === json([DETAIL_PAGE, PDF_BUTTON, HISTORY_PAGE, VIEW, SERVICE, VERIFIER].sort()), `scope: new files = 5 approved + verifier (got ${json(untracked)})`);
  assert(!untracked.some((f) => f.startsWith("app/api/") || f.startsWith("prisma/")), "scope: no new API route / migration");
  const frozen = ["prisma", "app/api", "app/(product)", "lib/services/budget.service.ts", "lib/services/quote.service.ts", "lib/services/procurement-product.service.ts", "lib/services/project.service.ts", "lib/services/tender", "lib/services/tender.service.ts", "lib/pdf", "lib/domain", "lib/product-engine", "lib/budget", "scripts", "package.json", "package-lock.json"];
  const touched = lines(git(`diff --name-only ${BASE} -- ${frozen.map((f) => `"${f}"`).join(" ")}`)).filter((f) => !KNOWN_UNRELATED_DIRTY.has(f));
  assert(touched.length === 0, `scope: Schema / API / Budget calc / Quote / procurement / project service / Tender / PDF / domain / PI / frozen verifiers untouched (got ${json(touched)})`);
  out("✓ scope: tracked = project page; new = service + 2 pages + view + PDF button + verifier; no API / Prisma / calculation / Quote / procurement / PDF / Tender change");
}

(async () => {
  try {
    await checkService();
    checkView();
    await checkPdf();
    checkPages();
    checkScope();
    out(`\nC.7-F1 Saved Budget Access & Price Visibility: PASS (${passed} assertions)`);
  } catch (err) {
    console.error(err instanceof Error ? err.stack : err);
    process.exit(1);
  }
})();

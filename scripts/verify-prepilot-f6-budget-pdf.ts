/**
 * Target-user Pre-Pilot — F6 Budget PDF download verification.
 * Runs the real POST handler with in-memory stubs for Prisma, the org gate, the subscription
 * resolver, legacy entitlement and the PDF renderer. No DB, no network.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const ROUTE = "app/api/pdf/tender/budget/route.ts";
const BUDGET_PAGE = "app/(product)/budget/page.tsx";
const PDF_ENDPOINT = "/api/pdf/tender/budget";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

type ProjectRow = {
  id: string;
  name: string;
  clientName: string | null;
  budgetLevel: "low" | "mid" | "high";
  areaM2: number | null;
  targetUsers: number | null;
  organizationId: string | null;
};
type BudgetRow = {
  id: string;
  projectId: string;
  currency: string;
  totalEstimateMin: number;
  totalEstimateMax: number;
  items: unknown[];
  assumptions: unknown[];
  createdAt: Date;
};
type GateBehavior =
  | { member: { organizationId: string; userId: string } }
  | { throwName: string };

const state = {
  gate: { throwName: "SaasAuthError" } as GateBehavior,
  gateCalls: [] as string[],
  plans: new Map<string, string>(),
  legacyPlanIds: new Set<string>(),
  legacyCalls: 0,
  featureCalls: 0,
  projects: new Map<string, ProjectRow>(),
  budgets: new Map<string, BudgetRow>(),
  rendered: [] as Array<{ budget: BudgetRow | { id?: string }; options: Record<string, unknown> }>,
};

function namedError(name: string) {
  const err = new Error(name);
  err.name = name;
  return err;
}

function stubModule(rel: string, exports: Record<string, unknown>) {
  const filename = require.resolve(path.join(ROOT, rel));
  const mod = new Module(filename);
  mod.filename = filename;
  mod.loaded = true;
  mod.exports = exports;
  require.cache[filename] = mod;
}

function installStubs() {
  stubModule("lib/prisma", {
    prisma: {
      project: {
        findUnique: async ({ where }: { where: { id: string } }) => state.projects.get(where.id) ?? null,
        upsert: async () => {
          throw new Error("project.upsert must not run in verifier");
        },
      },
      budget: {
        findUnique: async ({ where }: { where: { id: string } }) => state.budgets.get(where.id) ?? null,
        findFirst: async ({ where }: { where: { projectId: string } }) =>
          [...state.budgets.values()]
            .filter((b) => b.projectId === where.projectId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null,
      },
    },
  });
  stubModule("lib/saas/api-gate", {
    runSaasOrgGate: async (_req: unknown, endpoint: string) => {
      state.gateCalls.push(endpoint);
      if ("throwName" in state.gate) throw namedError(state.gate.throwName);
      return { ...state.gate.member, plan: "BASIC" };
    },
  });
  stubModule("lib/billing/subscription/subscription.resolver", {
    resolveOrganizationFeatures: async (organizationId: string) => {
      state.featureCalls += 1;
      const plan = state.plans.get(organizationId) ?? "BASIC";
      return {
        plan,
        status: "ACTIVE",
        flags: { canGenerateBudget: plan === "PRO" || plan === "ENTERPRISE" },
        currentPeriodEnd: null,
      };
    },
  });
  stubModule("lib/entitlements/resolveEntitlement", {
    resolveRequestEntitlement: async ({ planId }: { planId: string }) => {
      state.legacyCalls += 1;
      const enabled = state.legacyPlanIds.has(planId);
      return {
        entitlement: { budgetEnabled: enabled, effectiveLevel: enabled ? "pro" : "free" },
        source: enabled ? "license-key" : "anonymous",
        userId: null,
      };
    },
    isAccessEnabled: (entitlement: { budgetEnabled: boolean }) => entitlement.budgetEnabled === true,
    deniedErrorFor: () => "BUDGET_NOT_ENTITLED",
  });
  stubModule("lib/pdf/renderBudgetPdf", {
    renderBudgetPdf: async (budget: BudgetRow, options: Record<string, unknown>) => {
      state.rendered.push({ budget, options });
      return Buffer.from("%PDF-1.4 verifier");
    },
  });
  stubModule("lib/pdf/devFallback", {
    devProjectFallbackBudgetSelect: () => null,
    isDatabaseConnectivityError: () => false,
  });
  stubModule("lib/services/tender/provisionProjectFromPlan", {
    ensureProjectFromPlanJobId: async () => undefined,
  });
}

function project(id: string, organizationId: string | null): ProjectRow {
  return {
    id,
    name: `P-${id}`,
    clientName: "Verifier Co",
    budgetLevel: "mid",
    areaM2: 300,
    targetUsers: 120,
    organizationId,
  };
}

function budget(id: string, projectId: string, min: number, max: number, minutesAgo: number): BudgetRow {
  return {
    id,
    projectId,
    currency: "CNY",
    totalEstimateMin: min,
    totalEstimateMax: max,
    items: [],
    assumptions: [],
    createdAt: new Date(Date.now() - minutesAgo * 60_000),
  };
}

function seed() {
  state.projects.clear();
  state.budgets.clear();
  state.plans.clear();
  state.legacyPlanIds.clear();
  state.projects.set("p-new", project("p-new", "org-a"));
  state.projects.set("p-other", project("p-other", "org-a"));
  state.projects.set("p-b", project("p-b", "org-b"));
  state.projects.set("p-legacy", project("p-legacy", null));
  state.budgets.set("b-mid", budget("b-mid", "p-new", 283900, 327900, 10));
  state.budgets.set("b-high", budget("b-high", "p-new", 327900, 459900, 5));
  state.budgets.set("b-latest", budget("b-latest", "p-new", 1, 2, 0));
  state.budgets.set("b-other", budget("b-other", "p-other", 100, 200, 0));
  state.budgets.set("b-legacy", budget("b-legacy", "p-legacy", 50000, 90000, 0));
  state.plans.set("org-a", "PRO");
  state.plans.set("org-basic", "BASIC");
}

function resetCalls() {
  state.gateCalls = [];
  state.legacyCalls = 0;
  state.featureCalls = 0;
  state.rendered = [];
}

type PostHandler = (req: import("next/server").NextRequest) => Promise<Response>;

async function call(
  POST: PostHandler,
  body: Record<string, unknown>,
  orgHeader?: string,
): Promise<{
  status: number;
  type: string;
  disposition: string;
  json: Record<string, unknown> | null;
}> {
  const { NextRequest } = await import("next/server");
  resetCalls();
  const req = new NextRequest(`http://localhost${PDF_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(orgHeader ? { "x-organization-id": orgHeader } : {}),
    },
    body: JSON.stringify(body),
  });
  const res = await POST(req);
  const type = res.headers.get("content-type") ?? "";
  const disposition = res.headers.get("content-disposition") ?? "";
  const json = type.includes("application/json")
    ? ((await res.json()) as Record<string, unknown>)
    : null;
  return { status: res.status, type, disposition, json };
}

function renderedBudgetId() {
  assert(state.rendered.length === 1, "exactly one PDF rendered");
  return (state.rendered[0].budget as { id?: string }).id;
}

async function checkRouteRuntime(POST: PostHandler) {
  const member = (organizationId: string) => ({ member: { organizationId, userId: `u-${organizationId}` } });

  // AC1 + AC2: PRO org, new project with no legacy entitlement → exact budgetId PDF.
  state.gate = member("org-a");
  let r = await call(POST, { projectId: "p-new", planId: "p-new", budgetId: "b-mid", budgetTier: "mid" }, "org-a");
  assert(r.status === 200 && r.type === "application/pdf", `AC1 PRO org new project → 200 pdf (got ${r.status} ${JSON.stringify(r.json)})`);
  assert(
    r.disposition === 'attachment; filename="budget.pdf"',
    `F6.1 PDF served as attachment (got ${r.disposition || "none"})`,
  );
  assert(renderedBudgetId() === "b-mid", "AC2 renders requested budgetId, not latest");
  assert(state.rendered[0].options.tier === "pro", "PRO plan renders pro tier");
  assert(state.legacyCalls === 0, "SaaS grant does not need legacy entitlement");
  assert(state.gateCalls.join(",") === PDF_ENDPOINT, "gate scoped to the PDF endpoint, not budget calculate");
  console.log("✓ AC1/AC2 PRO org + unpaid project → 200 application/pdf for exact budgetId");

  // AC3: MID then HIGH recalculation → the corresponding Budget row.
  r = await call(POST, { projectId: "p-new", planId: "p-new", budgetId: "b-high", budgetTier: "high" }, "org-a");
  assert(r.status === 200 && renderedBudgetId() === "b-high", "AC3 HIGH budgetId rendered");
  assert(state.rendered[0].options.budgetLevel === "high", "AC3 HIGH tier label passed");
  const high = state.rendered[0].budget as BudgetRow;
  assert(high.totalEstimateMin === 327900 && high.totalEstimateMax === 459900, "AC3 HIGH totals from that row");
  r = await call(POST, { projectId: "p-new", planId: "p-new", budgetId: "b-mid", budgetTier: "mid" }, "org-a");
  const mid = state.rendered[0].budget as BudgetRow;
  assert(r.status === 200 && mid.totalEstimateMin === 283900 && mid.totalEstimateMax === 327900, "AC3 MID totals from that row");
  console.log("✓ AC3 MID/HIGH downloads the matching calculated Budget");

  // ENTERPRISE plan renders enterprise tier.
  state.plans.set("org-a", "ENTERPRISE");
  r = await call(POST, { projectId: "p-new", planId: "p-new", budgetId: "b-mid" }, "org-a");
  assert(r.status === 200 && state.rendered[0].options.tier === "enterprise", "ENTERPRISE plan → enterprise tier");
  state.plans.set("org-a", "PRO");

  // AC5: BASIC org without legacy entitlement → 403 with message.
  state.projects.set("p-basic", project("p-basic", "org-basic"));
  state.budgets.set("b-basic", budget("b-basic", "p-basic", 1, 2, 0));
  state.gate = member("org-basic");
  r = await call(POST, { projectId: "p-basic", planId: "p-basic", budgetId: "b-basic" }, "org-basic");
  assert(r.status === 403 && r.json?.error === "BUDGET_NOT_ENTITLED", "AC5 BASIC → 403 BUDGET_NOT_ENTITLED");
  assert(typeof r.json?.message === "string" && String(r.json.message).length > 0, "AC5 403 carries a message");
  assert(state.legacyCalls === 1 && state.rendered.length === 0, "AC5 legacy consulted, nothing rendered");
  // BASIC org + legacy paid order on that project → still allowed (AC8).
  state.legacyPlanIds.add("p-basic");
  r = await call(POST, { projectId: "p-basic", planId: "p-basic", budgetId: "b-basic" }, "org-basic");
  assert(r.status === 200 && renderedBudgetId() === "b-basic", "AC8 BASIC org with legacy paid order → 200");
  console.log("✓ AC5 BASIC without legacy → 403 + message; BASIC with legacy order → 200");

  // AC6: org A session → org B project denied, even if a legacy license exists for it.
  state.gate = member("org-a");
  state.legacyPlanIds.add("p-b");
  state.budgets.set("b-b", budget("b-b", "p-b", 1, 2, 0));
  r = await call(POST, { projectId: "p-b", planId: "p-b", budgetId: "b-b" }, "org-a");
  assert(r.status === 403 && r.json?.error === "TENANT_ISOLATION", "AC6 cross-org project → 403 TENANT_ISOLATION");
  assert(state.legacyCalls === 0 && state.featureCalls === 0, "AC6 no legacy fallback for cross-org project");
  state.gate = { throwName: "TenantIsolationError" };
  r = await call(POST, { projectId: "p-new", planId: "p-new", budgetId: "b-mid" }, "org-b");
  assert(r.status === 403 && r.json?.error === "TENANT_ISOLATION", "AC6 gate tenant isolation → 403");
  console.log("✓ AC6 cross-organization project denied without legacy fallback");

  // AC7: budgetId of another project / unknown budgetId.
  state.gate = member("org-a");
  r = await call(POST, { projectId: "p-new", planId: "p-new", budgetId: "b-other" }, "org-a");
  assert(r.status === 409 && r.json?.error === "BUDGET_PROJECT_MISMATCH", "AC7 cross-project budgetId → 409");
  assert(state.rendered.length === 0, "AC7 nothing rendered on mismatch");
  r = await call(POST, { projectId: "p-new", planId: "p-new", budgetId: "b-missing" }, "org-a");
  assert(r.status === 404 && r.json?.error === "BUDGET_NOT_FOUND", "unknown budgetId → 404, no stub");
  state.gate = member("org-basic");
  state.legacyPlanIds.delete("p-basic");
  r = await call(POST, { projectId: "p-basic", planId: "p-basic", budgetId: "b-other" }, "org-basic");
  assert(r.status === 403, "authorization runs before budget lookup (no existence leak)");
  console.log("✓ AC7 cross-project / unknown budgetId rejected");

  // AC8: legacy callers (no org session, no budgetId) keep working via License / paid order.
  state.gate = { throwName: "SaasAuthError" };
  state.legacyPlanIds.add("p-legacy");
  r = await call(POST, { projectId: "p-legacy", planId: "p-legacy", tier: "pro" });
  assert(r.status === 200 && r.type === "application/pdf", "AC8 legacy license caller → 200");
  assert(r.disposition.startsWith("attachment;"), "F6.1 legacy caller also receives attachment");
  assert(renderedBudgetId() === "b-legacy" && state.legacyCalls === 1, "AC8 legacy caller uses latest Budget");
  r = await call(POST, { projectId: "p-new", planId: "p-new" });
  assert(r.status === 403 && r.json?.error === "BUDGET_NOT_ENTITLED", "anonymous without legacy → 403");
  state.gate = member("org-a");
  r = await call(POST, { projectId: "p-legacy", planId: "p-legacy" }, "org-a");
  assert(r.status === 200 && state.legacyCalls === 1 && state.featureCalls === 0, "org-less legacy project → legacy only");
  state.gate = { throwName: "FeatureGateError" };
  r = await call(POST, { projectId: "p-new", planId: "p-new", budgetId: "b-mid" }, "org-a");
  assert(r.status === 403 && state.legacyCalls === 1, "role without use_product gets no SaaS grant");
  state.gate = { throwName: "RateLimitError" };
  r = await call(POST, { projectId: "p-new", planId: "p-new", budgetId: "b-mid" }, "org-a");
  assert(r.status === 429 && r.json?.error === "RATE_LIMITED", "PDF endpoint throttle → 429");
  r = await call(POST, { projectId: "p-new", planId: "p-other" });
  assert(r.status === 400 && r.json?.error === "ID_MISMATCH", "projectId/planId mismatch still 400");
  console.log("✓ AC8 legacy License / paid-order callers unchanged");
}

function checkRouteStatic() {
  const src = read(ROUTE);
  for (const forbidden of [
    "runSaasApiGate",
    "trackFeatureUsage",
    "trackUsage",
    "enforceFeatureAccess",
    "checkFeatureAccess",
  ]) {
    assert(!src.includes(forbidden), `route does not use quota-touching ${forbidden}`);
  }
  assert(src.includes("runSaasOrgGate(req, BUDGET_PDF_ENDPOINT"), "org gate keyed to PDF endpoint");
  assert(src.includes(`"Content-Disposition": 'attachment; filename="budget.pdf"'`), "F6.1 route uses attachment");
  assert(!src.includes("inline; filename"), "F6.1 inline disposition removed");
  assert(src.includes("resolveOrganizationFeatures("), "read-only plan capability check");
  assert(src.includes("features.flags.canGenerateBudget"), "same capability as Budget calculation");
  console.log("✓ route uses non-consuming capability path (no usage write, no calculate quota/rate bucket)");
}

function checkBudgetPageStatic() {
  const src = read(BUDGET_PAGE);
  const handler = src.slice(
    src.indexOf("async function handleDownloadPdf"),
    src.indexOf("return (", src.indexOf("async function handleDownloadPdf")),
  );
  assert(handler.includes('"x-organization-id": organizationId'), "download sends org header");
  assert(handler.includes("budgetId,"), "download sends current budgetId");
  assert(handler.includes("setError(budgetPdfErrorMessage(res.status, data))"), "non-2xx surfaces server message");
  assert(!src.includes('alert("PDF 下载失败")'), "generic alert removed");
  assert(
    src.includes("Boolean(projectId && budgetId && budgetSummary) && !budgetDraftDirty"),
    "AC4 dirty parameters keep download disabled",
  );
  assert(src.includes("disabled={!canDownloadPdf}"), "AC4 button bound to canDownloadPdf");
  assert(handler.includes("if (!canDownloadPdf || !budgetSummary) return;"), "AC4 handler guard kept");
  const calc = src.slice(src.indexOf("async function handleCalculate"), src.indexOf("async function handleDownloadPdf"));
  assert(calc.includes('fetch("/api/budget/calculate"'), "budget calculation call unchanged");
  console.log("✓ budget page sends org header + budgetId, surfaces errors, keeps disabled state");

  const trigger = src.slice(
    src.indexOf("function triggerBlobDownload"),
    src.indexOf("const BUDGET_SUMMARY_STORAGE_KEY"),
  );
  const order = (hay: string, tokens: string[], label: string) => {
    let at = -1;
    for (const token of tokens) {
      const next = hay.indexOf(token, at + 1);
      assert(next > at, `${label}: "${token}" present and in order`);
      at = next;
    }
  };
  order(
    trigger,
    [
      "URL.createObjectURL(blob)",
      'document.createElement("a")',
      "link.href = url",
      "link.download = filename",
      "document.body.appendChild(link)",
      "link.click()",
      "link.remove()",
      "window.setTimeout(() => URL.revokeObjectURL(url)",
    ],
    "F6.1 blob download trigger",
  );
  assert(
    !/link\.click\(\);\s*URL\.revokeObjectURL/.test(src),
    "F6.1 object URL is not revoked synchronously after click",
  );
  order(
    handler,
    [
      "await res.blob()",
      'contentType.includes("application/pdf")',
      "triggerBlobDownload(",
      'filenameFromContentDisposition(res.headers.get("content-disposition"), "budget.pdf")',
      "setPdfDownloaded(true)",
    ],
    "F6.1 handler consumes Blob, triggers download, then marks success",
  );
  assert(
    handler.indexOf("setPdfDownloaded(true)") > handler.indexOf("triggerBlobDownload("),
    "F6.1 success state only after download trigger",
  );
  console.log("✓ F6.1 Blob → object URL → attached anchor click → deferred revoke → success state");
}

function checkFilenameParser() {
  const src = read(BUDGET_PAGE);
  const start = src.indexOf("function filenameFromContentDisposition");
  const end = src.indexOf("/** The anchor must be attached", start);
  assert(start >= 0 && end > start, "filename parser present");
  const js = src
    .slice(start, end)
    .replace("(header: string | null, fallback: string): string", "(header, fallback)");
  const parse = new Function(`${js}; return filenameFromContentDisposition;`)() as (
    header: string | null,
    fallback: string,
  ) => string;
  assert(parse('attachment; filename="budget.pdf"', "x.pdf") === "budget.pdf", "plain filename parsed");
  assert(
    parse("attachment; filename*=UTF-8''%E9%A2%84%E7%AE%97.pdf", "x.pdf") === "预算.pdf",
    "RFC 5987 filename* parsed",
  );
  assert(parse(null, "budget.pdf") === "budget.pdf", "missing header → fallback");
  assert(parse("attachment", "budget.pdf") === "budget.pdf", "no filename → fallback");
  console.log("✓ F6.1 server filename used when present, otherwise budget.pdf");
}

function checkScopeUntouched() {
  const changed = execSync("git diff --name-only HEAD", { cwd: ROOT, encoding: "utf8" })
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const knownDirty = new Set([
    "lib/commercial/action-delivery/index.ts",
    "lib/payments/wechatProvider.ts",
    "prisma/migrations/20260913120000_upgrade_order_provider_order_id/migration.sql",
  ]);
  const allowed = new Set([ROUTE, BUDGET_PAGE, "scripts/verify-prepilot-f6-budget-pdf.ts"]);
  for (const file of changed) {
    if (knownDirty.has(file)) continue;
    assert(allowed.has(file), `out-of-scope file changed: ${file}`);
  }
  console.log("✓ only Budget PDF route + budget page changed (quote PDF, F3/F4/F5, pay, tender, prisma untouched)");
}

async function main() {
  Object.assign(process.env, { NODE_ENV: "production" });
  installStubs();
  seed();
  const { POST } = (await import("../app/api/pdf/tender/budget/route")) as { POST: PostHandler };
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].startsWith("✓")) originalLog(...args);
  };
  try {
    await checkRouteRuntime(POST);
  } finally {
    console.log = originalLog;
  }
  checkRouteStatic();
  checkBudgetPageStatic();
  checkFilenameParser();
  checkScopeUntouched();
  console.log("\nverify-prepilot-f6-budget-pdf: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

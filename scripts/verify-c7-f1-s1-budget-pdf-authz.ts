/**
 * C.7-F1-S1 Security Hotfix — saved Budget PDF cross-organization authorization.
 *
 * Runs the real POST /api/pdf/tender/budget handler with the real request authentication
 * (`authenticateRequest`: session → x-organization-id → membership) and in-memory stubs for the
 * session user, Prisma, subscription features, legacy entitlement and the PDF renderer.
 * Legacy entitlement is stubbed to ALWAYS grant, reproducing the production condition in which a
 * budgetId request without organization context was served through the legacy fallback.
 *
 * Asserts:
 *  - same-organization PRO member → 200 application/pdf of exactly the stored Budget snapshot;
 *  - cross-organization project / non-member organization header → rejected, nothing rendered;
 *  - missing organization context (no session, no x-organization-id) → 401, legacy never consulted;
 *  - budgetId ↔ projectId mismatch / unknown budgetId → rejected, no latest-Budget or stub fallback;
 *  - BASIC plan (no canGenerateBudget) → 403 even though legacy would grant;
 *  - invalid budgetId values are rejected, not ignored;
 *  - requests without budgetId follow the C.7-F1-S2 rules (see verify-c7-f1-s2-budget-pdf-legacy-authz.ts);
 *  - scope: only the Budget PDF route changes; the saved-Budget PDF button is untouched.
 *
 * Run: npx tsx scripts/verify-c7-f1-s1-budget-pdf-authz.ts
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
/** Production commit at the time of the hotfix (fix(product): restore saved budget access and price visibility). */
const BASE = "29c91158";
const ROUTE = "app/api/pdf/tender/budget/route.ts";
const PDF_BUTTON = "app/(workspace)/projects/[id]/budgets/[budgetId]/SavedBudgetPdfButton.tsx";
const VERIFIER = "scripts/verify-c7-f1-s1-budget-pdf-authz.ts";
const S2_VERIFIER = "scripts/verify-c7-f1-s2-budget-pdf-legacy-authz.ts";
const F6_VERIFIER = "scripts/verify-prepilot-f6-budget-pdf.ts";
const PDF_ENDPOINT = "/api/pdf/tender/budget";
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
const out = (line: string) => process.stdout.write(`${line}\n`);
const json = (v: unknown) => JSON.stringify(v);
const git = (args: string) => execSync(`git ${args}`, { cwd: ROOT, encoding: "utf8" });
const lines = (s: string) => s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

/* ───────── fixtures ───────── */
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

const T200_FACT = { unitPrice: 30000, currency: "CNY", sourceType: "supplier_quote", sourceReference: "Q-T200-001", quotedAt: "2026-10-01" };
const projectRow = (id: string, organizationId: string | null): ProjectRow => ({
  id,
  name: `P-${id}`,
  clientName: "S1 Verifier Co",
  budgetLevel: "mid",
  areaM2: 300,
  targetUsers: 120,
  organizationId,
});
const budgetRow = (id: string, projectId: string, total: number, minutesAgo: number, items: unknown[] = []): BudgetRow => ({
  id,
  projectId,
  currency: "CNY",
  totalEstimateMin: total,
  totalEstimateMax: total,
  items,
  assumptions: ["基于 quoteId=q-s1 的方案器材配置估算", "预算档位（设备单价品质）：mid", "方案人数：120"],
  createdAt: new Date(Date.UTC(2026, 9, 1) - minutesAgo * 60_000),
});

/* ───────── stubs (installed before the route loads) ───────── */
type Call = { what: string; args?: unknown };
const state = {
  user: null as { id: string; email: string; name: string | null } | null,
  members: new Map<string, string>(),
  plans: new Map<string, string>(),
  projects: new Map<string, ProjectRow>(),
  budgets: new Map<string, BudgetRow>(),
  gateThrow: "" as "" | "FeatureGateError" | "RateLimitError",
  calls: [] as Call[],
  rendered: [] as Array<{ budget: unknown; options: Record<string, unknown> }>,
};
const called = (what: string) => state.calls.filter((c) => c.what === what).length;

function stubModule(rel: string, exports: Record<string, unknown>) {
  const filename = require.resolve(path.join(ROOT, rel));
  const mod = new Module(filename);
  mod.filename = filename;
  mod.loaded = true;
  mod.exports = exports;
  require.cache[filename] = mod;
}
function namedError(name: string) {
  const err = new Error(name);
  err.name = name;
  return err;
}

class SaasAuthError extends Error {
  readonly code = "AUTH_REQUIRED" as const;
  constructor(message = "Authentication required") {
    super(message);
    this.name = "SaasAuthError";
  }
}
stubModule("lib/auth/session.service", {
  getSessionUser: async () => state.user,
  SaasAuthError,
});
stubModule("lib/prisma", {
  prisma: {
    organizationMember: {
      findUnique: async ({ where }: { where: { organizationId_userId: { organizationId: string; userId: string } } }) => {
        const { organizationId, userId } = where.organizationId_userId;
        const role = state.members.get(`${userId}@${organizationId}`);
        return role ? { id: `m-${userId}-${organizationId}`, organizationId, userId, role } : null;
      },
    },
    project: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        state.calls.push({ what: "project.findUnique", args: where });
        return state.projects.get(where.id) ?? null;
      },
      upsert: async () => {
        state.calls.push({ what: "project.upsert" });
        throw new Error("project.upsert must not run");
      },
    },
    budget: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        state.calls.push({ what: "budget.findUnique", args: where });
        return state.budgets.get(where.id) ?? null;
      },
      findFirst: async ({ where }: { where: { projectId: string } }) => {
        state.calls.push({ what: "budget.findFirst", args: where });
        return [...state.budgets.values()]
          .filter((b) => b.projectId === where.projectId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null;
      },
    },
  },
});

/* eslint-disable @typescript-eslint/no-require-imports */
const auth = require("../lib/auth/auth.service") as typeof import("../lib/auth/auth.service");
/* eslint-enable @typescript-eslint/no-require-imports */

stubModule("lib/saas/api-gate", {
  runSaasOrgGate: async (req: import("next/server").NextRequest, endpoint: string, body?: Record<string, unknown>) => {
    state.calls.push({ what: "gate", args: { endpoint, body } });
    const ctx = await auth.authenticateRequest(req, body);
    if (state.gateThrow) throw namedError(state.gateThrow);
    return { ...ctx, traceId: "t-s1", plan: "BASIC" };
  },
});
stubModule("lib/billing/subscription/subscription.resolver", {
  resolveOrganizationFeatures: async (organizationId: string) => {
    state.calls.push({ what: "features", args: organizationId });
    const plan = state.plans.get(organizationId) ?? "BASIC";
    return { plan, status: "ACTIVE", flags: { canGenerateBudget: plan === "PRO" || plan === "ENTERPRISE" }, currentPeriodEnd: null };
  },
});
stubModule("lib/entitlements/resolveEntitlement", {
  resolveRequestEntitlement: async () => {
    state.calls.push({ what: "legacy" });
    return { entitlement: { budgetEnabled: true, effectiveLevel: "pro" }, source: "license-key", userId: null };
  },
  isAccessEnabled: (entitlement: { budgetEnabled: boolean }) => entitlement.budgetEnabled === true,
  deniedErrorFor: () => "BUDGET_NOT_ENTITLED",
});
stubModule("lib/pdf/renderBudgetPdf", {
  renderBudgetPdf: async (budget: unknown, options: Record<string, unknown>) => {
    state.rendered.push({ budget, options });
    return Buffer.from("%PDF-1.4 s1-verifier");
  },
});
stubModule("lib/pdf/devFallback", {
  devProjectFallbackBudgetSelect: () => null,
  isDatabaseConnectivityError: () => false,
});
stubModule("lib/services/tender/provisionProjectFromPlan", {
  ensureProjectFromPlanJobId: async () => {
    state.calls.push({ what: "provision" });
  },
});

/* ───────── seed ───────── */
const ORG_A = "org-a";
const ORG_B = "org-b";
const ORG_BASIC = "org-basic";
const USER_A = { id: "u-a", email: "a@s1.test", name: null };
const USER_B = { id: "u-b", email: "b@s1.test", name: null };
const USER_BASIC = { id: "u-basic", email: "basic@s1.test", name: null };
const DETAILED_ITEMS = [
  { category: "有氧设备", name: "商业级跑步机 T200", specLevel: "standard", quantity: 4, unitPriceMin: 30000, unitPriceMax: 30000, subtotalMin: 120000, subtotalMax: 120000, sourceType: "placeholder", priceBasis: "VERIFIED", priceFact: T200_FACT },
  { category: "力量设备", name: "综合训练器", specLevel: "standard", quantity: 2, unitPriceMin: 8000, unitPriceMax: 12000, subtotalMin: 16000, subtotalMax: 24000, sourceType: "placeholder", priceBasis: "ESTIMATE" },
];

function seed() {
  state.members = new Map([
    [`${USER_A.id}@${ORG_A}`, "MEMBER"],
    [`${USER_B.id}@${ORG_B}`, "OWNER"],
    [`${USER_BASIC.id}@${ORG_BASIC}`, "OWNER"],
  ]);
  state.plans = new Map([[ORG_A, "PRO"], [ORG_B, "PRO"], [ORG_BASIC, "BASIC"]]);
  state.projects = new Map([
    ["p-a", projectRow("p-a", ORG_A)],
    ["p-a2", projectRow("p-a2", ORG_A)],
    ["p-b", projectRow("p-b", ORG_B)],
    ["p-basic", projectRow("p-basic", ORG_BASIC)],
    ["p-orgless", projectRow("p-orgless", null)],
  ]);
  state.budgets = new Map([
    ["b-a-old", budgetRow("b-a-old", "p-a", 136000, 60, DETAILED_ITEMS)],
    ["b-a-latest", budgetRow("b-a-latest", "p-a", 999999, 0)],
    ["b-a2", budgetRow("b-a2", "p-a2", 1000, 0)],
    ["b-b", budgetRow("b-b", "p-b", 2000, 0)],
    ["b-basic", budgetRow("b-basic", "p-basic", 3000, 0)],
    ["b-orgless", budgetRow("b-orgless", "p-orgless", 4000, 0)],
  ]);
  state.gateThrow = "";
}

/* ───────── request helper ───────── */
type PostHandler = (req: import("next/server").NextRequest) => Promise<Response>;
type Result = { status: number; type: string; disposition: string; json: Record<string, unknown> | null };

async function call(
  POST: PostHandler,
  user: typeof state.user,
  body: Record<string, unknown>,
  orgHeader?: string,
): Promise<Result> {
  const { NextRequest } = await import("next/server");
  state.user = user;
  state.calls = [];
  state.rendered = [];
  const req = new NextRequest(`http://localhost${PDF_ENDPOINT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(orgHeader ? { "x-organization-id": orgHeader } : {}) },
    body: JSON.stringify(body),
  });
  const res = await POST(req);
  const type = res.headers.get("content-type") ?? "";
  return {
    status: res.status,
    type,
    disposition: res.headers.get("content-disposition") ?? "",
    json: type.includes("application/json") ? ((await res.json()) as Record<string, unknown>) : null,
  };
}
const body = (projectId: string, budgetId?: unknown, extra: Record<string, unknown> = {}) => ({
  projectId,
  planId: projectId,
  ...(budgetId === undefined ? {} : { budgetId }),
  ...extra,
});
function assertNothingServed(r: Result, label: string) {
  assert(state.rendered.length === 0 && r.type.includes("application/json"), `${label}: no PDF rendered`);
  assert(called("legacy") === 0, `${label}: legacy entitlement never consulted`);
  assert(called("budget.findFirst") === 0, `${label}: no latest-Budget fallback`);
  assert(called("provision") === 0 && called("project.upsert") === 0, `${label}: no project provisioning / mock`);
}

/* ───────── AC: same organization PRO ───────── */
async function checkSameOrganization(POST: PostHandler) {
  const snapshot = json(state.budgets.get("b-a-old"));
  const r = await call(POST, USER_A, body("p-a", "b-a-old", { budgetTier: "mid", companySize: 120 }), ORG_A);
  assert(r.status === 200 && r.type === "application/pdf", `same-org PRO → 200 application/pdf (got ${r.status} ${json(r.json)})`);
  assert(r.disposition === 'attachment; filename="budget.pdf"', "same-org PRO → attachment disposition unchanged");
  assert(state.rendered.length === 1, "exactly one PDF rendered");
  const rendered = state.rendered[0];
  assert(rendered.budget === state.budgets.get("b-a-old"), "renders the stored row for the requested historical budgetId (not the latest)");
  assert(json(rendered.budget) === snapshot, "historical snapshot passed to the renderer byte-for-byte (T200 ¥30,000 VERIFIED kept)");
  assert(rendered.options.tier === "pro" && rendered.options.budgetLevel === "mid" && rendered.options.companySize === 120, "PRO tier + request tier / headcount header unchanged");
  assert(called("legacy") === 0 && called("budget.findFirst") === 0, "SaaS grant: no legacy entitlement, no latest-Budget lookup");
  const gate = state.calls.find((c) => c.what === "gate")?.args as { endpoint: string } | undefined;
  assert(gate?.endpoint === PDF_ENDPOINT, "org gate keyed to the PDF endpoint (no Budget calculation quota)");

  state.plans.set(ORG_A, "ENTERPRISE");
  const e = await call(POST, USER_A, body("p-a", "b-a-old"), ORG_A);
  assert(e.status === 200 && state.rendered[0]?.options.tier === "enterprise", "ENTERPRISE plan → enterprise tier");
  state.plans.set(ORG_A, "PRO");
  out("✓ same-org PRO: 200 application/pdf of exactly the requested historical Budget snapshot; no legacy / latest fallback");
}

/* ───────── AC: cross organization ───────── */
async function checkCrossOrganization(POST: PostHandler) {
  let r = await call(POST, USER_B, body("p-a", "b-a-old"), ORG_B);
  assert(r.status === 403 && r.json?.error === "TENANT_ISOLATION", `org B member + org A project/budget → 403 TENANT_ISOLATION (got ${r.status} ${json(r.json)})`);
  assertNothingServed(r, "cross-org project");
  assert(called("budget.findUnique") === 0 && called("features") === 0, "cross-org project: rejected before any Budget read / feature check");

  r = await call(POST, USER_B, body("p-a", "b-a-old"), ORG_A);
  assert(r.status === 401 && r.json?.error === "ORGANIZATION_CONTEXT_REQUIRED", `org B user claiming org A header (not a member) → 401 (got ${r.status} ${json(r.json)})`);
  assertNothingServed(r, "non-member org header");
  assert(called("project.findUnique") === 0, "non-member org header: no project read");

  r = await call(POST, USER_B, body("p-b", "b-a-old"), ORG_B);
  assert(r.status === 409 && r.json?.error === "BUDGET_PROJECT_MISMATCH", "org B own project + org A budgetId → 409, org A Budget not rendered");
  assertNothingServed(r, "own project + foreign budgetId");
  out("✓ cross-org: foreign project → 403, non-member org header → 401, foreign budgetId on own project → 409; never rendered, never legacy");
}

/* ───────── AC: missing organization context (production repro) ───────── */
async function checkMissingOrganizationContext(POST: PostHandler) {
  let r = await call(POST, USER_B, body("p-a", "b-a-old"));
  assert(r.status === 401 && r.json?.error === "ORGANIZATION_CONTEXT_REQUIRED", `production repro: org B session, no x-organization-id, org A ids → 401 (got ${r.status} ${json(r.json)})`);
  assertNothingServed(r, "no org header");
  assert(called("project.findUnique") === 0 && called("budget.findUnique") === 0, "no org header: no project / Budget read");

  r = await call(POST, USER_B, body("p-a", "b-a-old", { organizationId: ORG_A }));
  assert(r.status === 401, "organizationId in body is not accepted as organization context by this route");
  assertNothingServed(r, "body organizationId");

  r = await call(POST, USER_A, body("p-a", "b-a-old"));
  assert(r.status === 401 && r.json?.error === "ORGANIZATION_CONTEXT_REQUIRED", "even the owning org's user needs x-organization-id for a budgetId PDF");
  assertNothingServed(r, "owner without org header");

  r = await call(POST, null, body("p-a", "b-a-old"), ORG_A);
  assert(r.status === 401 && r.json?.error === "ORGANIZATION_CONTEXT_REQUIRED", "anonymous (no session) → 401");
  assertNothingServed(r, "anonymous");

  state.gateThrow = "FeatureGateError";
  r = await call(POST, USER_A, body("p-a", "b-a-old"), ORG_A);
  assert(r.status === 403 && r.json?.error === "ROLE_NOT_PERMITTED", "role without use_product → 403 ROLE_NOT_PERMITTED");
  assertNothingServed(r, "role denied");
  state.gateThrow = "RateLimitError";
  r = await call(POST, USER_A, body("p-a", "b-a-old"), ORG_A);
  assert(r.status === 429 && r.json?.error === "RATE_LIMITED", "PDF endpoint throttle → 429");
  assertNothingServed(r, "rate limited");
  state.gateThrow = "";
  out("✓ missing org context: no header / body-only org / anonymous → 401, role denied → 403, throttled → 429; legacy never consulted");
}

/* ───────── AC: budgetId / projectId mismatch ───────── */
async function checkMismatch(POST: PostHandler) {
  let r = await call(POST, USER_A, body("p-a", "b-a2"), ORG_A);
  assert(r.status === 409 && r.json?.error === "BUDGET_PROJECT_MISMATCH", "same-org budgetId of another project → 409");
  assertNothingServed(r, "same-org mismatch");

  r = await call(POST, USER_A, body("p-a", "b-missing"), ORG_A);
  assert(r.status === 404 && r.json?.error === "BUDGET_NOT_FOUND", "unknown budgetId → 404 (no latest / stub)");
  assertNothingServed(r, "unknown budgetId");

  r = await call(POST, USER_A, body("p-missing", "b-a-old"), ORG_A);
  assert(r.status === 404 && r.json?.error === "PROJECT_NOT_FOUND", "unknown projectId with budgetId → 404, no provisioning");
  assertNothingServed(r, "unknown project");
  assert(called("budget.findUnique") === 0, "unknown project: no Budget read");

  r = await call(POST, USER_A, body("p-orgless", "b-orgless"), ORG_A);
  assert(r.status === 403 && r.json?.error === "TENANT_ISOLATION", "organization-less project + budgetId → 403 (ownership cannot be proven)");
  assertNothingServed(r, "org-less project");

  r = await call(POST, USER_A, { projectId: "p-a", planId: "p-a2", budgetId: "b-a-old" }, ORG_A);
  assert(r.status === 400 && r.json?.error === "ID_MISMATCH", "projectId / planId mismatch still 400");
  out("✓ mismatch: other-project budgetId → 409, unknown budgetId / project → 404, org-less project → 403; no fallback");
}

/* ───────── AC: BASIC plan ───────── */
async function checkBasicPlan(POST: PostHandler) {
  const r = await call(POST, USER_BASIC, body("p-basic", "b-basic"), ORG_BASIC);
  assert(r.status === 403 && r.json?.error === "BUDGET_NOT_ENTITLED", `BASIC org → 403 BUDGET_NOT_ENTITLED (got ${r.status} ${json(r.json)})`);
  assert(typeof r.json?.message === "string" && String(r.json.message).includes("专业版"), "BASIC 403 carries the upgrade message");
  assertNothingServed(r, "BASIC");
  assert(called("budget.findUnique") === 0, "BASIC: rejected before the Budget is read");
  out("✓ BASIC: 403 BUDGET_NOT_ENTITLED even though legacy entitlement would grant; Budget not read");
}

/* ───────── AC: invalid budgetId is rejected, not ignored ───────── */
async function checkInvalidBudgetId(POST: PostHandler) {
  for (const bad of ["", "   ", 123, true, {}, ["b-a-old"]]) {
    const r = await call(POST, USER_B, body("p-a", bad));
    assert(r.status === 400 && r.json?.error === "INVALID_BUDGET_ID", `budgetId ${json(bad)} → 400 INVALID_BUDGET_ID (got ${r.status} ${json(r.json)})`);
    assertNothingServed(r, `budgetId ${json(bad)}`);
    assert(called("gate") === 0 && called("project.findUnique") === 0, `budgetId ${json(bad)}: rejected before auth / reads`);
  }
  out("✓ invalid budgetId (empty / blank / non-string) → 400, never downgraded to the legacy latest-Budget path");
}

/* ───────── requests without budgetId (C.7-F1-S2 rules; full coverage in the S2 verifier) ───────── */
async function checkWithoutBudgetId(POST: PostHandler) {
  let r = await call(POST, null, body("p-orgless"));
  assert(r.status === 401 && r.json?.error === "LEGACY_LOGIN_REQUIRED" && state.rendered.length === 0, "anonymous legacy caller (no budgetId) → 401 even though legacy would grant");

  r = await call(POST, null, body("p-a", null));
  assert(r.status === 401 && r.json?.error === "ORGANIZATION_CONTEXT_REQUIRED" && called("legacy") === 0, "budgetId: null is treated as absent; organization project still needs organization context");

  r = await call(POST, USER_A, body("p-a"), ORG_A);
  assert(r.status === 200 && called("legacy") === 0 && state.rendered[0]?.budget === state.budgets.get("b-a-latest"), "org member without budgetId: SaaS grant, latest Budget");
  r = await call(POST, USER_B, body("p-a"), ORG_B);
  assert(r.status === 403 && r.json?.error === "TENANT_ISOLATION", "org member without budgetId on a foreign project → 403");
  out("✓ without budgetId: organization projects keep the SaaS rule; anonymous legacy callers rejected (C.7-F1-S2)");
}

/* ───────── static + scope ───────── */
function checkStaticAndScope() {
  const src = fs.readFileSync(path.join(ROOT, ROUTE), "utf8");
  for (const forbidden of ["runSaasApiGate", "trackFeatureUsage", "trackUsage", "enforceFeatureAccess", "checkFeatureAccess"]) {
    assert(!src.includes(forbidden), `route does not use quota-touching ${forbidden}`);
  }
  assert(src.includes("runSaasOrgGate(req, BUDGET_PDF_ENDPOINT"), "org gate keyed to the PDF endpoint");
  assert(src.includes("budgetRow = await prisma.budget.findUnique({ where: { id: requestBudgetId } });") && src.includes('deny(409, "BUDGET_PROJECT_MISMATCH"'), "requested budgetId binding + project check kept");
  assert(src.includes("if (requestBudgetId && identity.kind === \"none\")") && src.includes("if (ownerOrganizationId || requestBudgetId) {"), "budgetId requests cannot reach the legacy entitlement fallback");

  const tracked = lines(git(`diff --name-only ${BASE}`)).filter((f) => !KNOWN_UNRELATED_DIRTY.has(f));
  assert(json(tracked) === json([ROUTE, F6_VERIFIER].sort()), `scope: tracked changes vs ${BASE} = Budget PDF route + F6 verifier (got ${json(tracked)})`);
  const untracked = lines(git("ls-files --others --exclude-standard")).filter((f) => !KNOWN_UNRELATED_DIRTY.has(f));
  assert(json(untracked) === json([VERIFIER, S2_VERIFIER].sort()), `scope: new files = S1 + S2 verifiers (got ${json(untracked)})`);
  const guarded = lines(git(`diff --name-only ${BASE} -- "${PDF_BUTTON}" prisma lib "app/(product)" "app/(workspace)"`)).filter((f) => !KNOWN_UNRELATED_DIRTY.has(f));
  assert(guarded.length === 0, `scope: saved-Budget PDF button, Prisma, lib, product / workspace pages untouched (got ${json(guarded)})`);
  out("✓ static / scope: non-consuming gate kept, budgetId binding kept, only the Budget PDF route changed");
}

async function main() {
  Object.assign(process.env, { NODE_ENV: "production" });
  seed();
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { POST } = require("../app/api/pdf/tender/budget/route") as { POST: PostHandler };
  /* eslint-enable @typescript-eslint/no-require-imports */
  const originalLog = console.log;
  console.log = () => undefined;
  try {
    await checkSameOrganization(POST);
    await checkCrossOrganization(POST);
    await checkMissingOrganizationContext(POST);
    await checkMismatch(POST);
    await checkBasicPlan(POST);
    await checkInvalidBudgetId(POST);
    await checkWithoutBudgetId(POST);
  } finally {
    console.log = originalLog;
  }
  checkStaticAndScope();
  out(`\nC.7-F1-S1 Budget PDF authorization: PASS (${passed} assertions)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * C.7-F1-S2 Security Hotfix — Budget PDF without budgetId: organization ownership + linked legacy grants.
 *
 * Runs the real POST /api/pdf/tender/budget handler with the real request authentication
 * (`authenticateRequest`) and the real legacy entitlement chain (`resolveRequestEntitlement` →
 * `getEntitlement`: paid UpgradeOrder / plan-scope / wildcard / bound / header-key License), on
 * in-memory Prisma rows. Only the session user, subscription features, project provisioning and the
 * PDF renderer are stubbed.
 *
 * Asserts:
 *  - projects with an organizationId: identity + membership + ownership + canGenerateBudget, with or
 *    without budgetId; no legacy fallback (cross-org, anonymous, missing header, BASIC);
 *  - organization-less projects / not-yet-provisioned plans: only grants linked to the logged-in user and
 *    scoped to exactly that planId (bound License, presented License key, own paid UpgradeOrder);
 *    anonymous → 401; wildcard License, unbound plan-scope License, someone else's / owner-less paid
 *    UpgradeOrder, pending order, expired License → 403;
 *  - no provisioning / mock / latest-Budget / stub before authorization;
 *  - authorized downloads render the stored Budget snapshot unchanged.
 *
 * Run: npx tsx scripts/verify-c7-f1-s2-budget-pdf-legacy-authz.ts
 */
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
/** Production commit at the time of the hotfix (fix(product): restore saved budget access and price visibility). */
const BASE = "29c91158";
const ROUTE = "app/api/pdf/tender/budget/route.ts";
const F6_VERIFIER = "scripts/verify-prepilot-f6-budget-pdf.ts";
const S1_VERIFIER = "scripts/verify-c7-f1-s1-budget-pdf-authz.ts";
const S2_VERIFIER = "scripts/verify-c7-f1-s2-budget-pdf-legacy-authz.ts";
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
const sha256 = (raw: string) => crypto.createHash("sha256").update(raw.trim()).digest("hex");

/* ───────── rows ───────── */
type User = { id: string; email: string; name: string | null };
type ProjectRow = { id: string; name: string; clientName: string | null; budgetLevel: "low" | "mid" | "high"; areaM2: number | null; targetUsers: number | null; organizationId: string | null };
type BudgetRow = { id: string; projectId: string; currency: string; totalEstimateMin: number; totalEstimateMax: number; items: unknown[]; assumptions: unknown[]; createdAt: Date };
type LicenseRow = { id: string; keyHash: string; planId: string | null; planLevel: string; expiresAt: Date | null; createdAt: Date };
type BindingRow = { userId: string; licenseId: string };
type OrderRow = { id: string; planId: string; userId: string | null; status: string; targetLevel: string; createdAt: Date };

const user = (id: string): User => ({ id, email: `${id}@s2.test`, name: null });
const USER_A = user("u-a");
const USER_B = user("u-b");
const USER_BASIC = user("u-basic");
const USER_LEGACY = user("u-legacy");
const USER_KEY = user("u-key");
const USER_OTHER = user("u-other");
const ORG_A = "org-a";
const ORG_B = "org-b";
const ORG_BASIC = "org-basic";
const WILDCARD_KEY = "lic-s2-wildcard";
const UNBOUND_PLAN_KEY = "lic-s2-unbound-plan";
const OWN_PLAN_KEY = "lic-s2-own-plan";
const T200_FACT = { unitPrice: 30000, currency: "CNY", sourceType: "supplier_quote", sourceReference: "Q-T200-001", quotedAt: "2026-10-01" };
const DETAILED_ITEMS = [
  { category: "有氧设备", name: "商业级跑步机 T200", specLevel: "standard", quantity: 4, unitPriceMin: 30000, unitPriceMax: 30000, subtotalMin: 120000, subtotalMax: 120000, sourceType: "placeholder", priceBasis: "VERIFIED", priceFact: T200_FACT },
  { category: "力量设备", name: "综合训练器", specLevel: "standard", quantity: 2, unitPriceMin: 8000, unitPriceMax: 12000, subtotalMin: 16000, subtotalMax: 24000, sourceType: "placeholder", priceBasis: "ESTIMATE" },
];
const LONG_AGO = new Date(Date.UTC(2026, 0, 1));
const project = (id: string, organizationId: string | null): ProjectRow => ({ id, name: `P-${id}`, clientName: "S2 Verifier Co", budgetLevel: "mid", areaM2: 300, targetUsers: 120, organizationId });
const budget = (id: string, projectId: string, total: number, minutesAgo: number, items: unknown[] = []): BudgetRow => ({
  id, projectId, currency: "CNY", totalEstimateMin: total, totalEstimateMax: total, items,
  assumptions: ["基于 quoteId=q-s2 的方案器材配置估算", "预算档位（设备单价品质）：mid", "方案人数：120"],
  createdAt: new Date(Date.UTC(2026, 9, 1) - minutesAgo * 60_000),
});
const license = (id: string, planId: string | null, rawKey: string, planLevel = "pro", expiresAt: Date | null = null): LicenseRow => ({ id, keyHash: sha256(rawKey), planId, planLevel, expiresAt, createdAt: LONG_AGO });
const order = (id: string, planId: string, userId: string | null, status: string, targetLevel = "pro"): OrderRow => ({ id, planId, userId, status, targetLevel, createdAt: LONG_AGO });

const state = {
  user: null as User | null,
  members: new Map<string, string>(),
  plans: new Map<string, string>(),
  projects: new Map<string, ProjectRow>(),
  budgets: new Map<string, BudgetRow>(),
  licenses: [] as LicenseRow[],
  bindings: [] as BindingRow[],
  orders: [] as OrderRow[],
  calls: [] as string[],
  rendered: [] as Array<{ budget: unknown; options: Record<string, unknown> }>,
};
const called = (what: string) => state.calls.filter((c) => c === what).length;
const legacyQueries = () => state.calls.filter((c) => c.startsWith("upgradeOrder.") || c.startsWith("licenseKey.") || c.startsWith("licenseBinding.")).length;

function seed() {
  state.members = new Map([
    [`${USER_A.id}@${ORG_A}`, "MEMBER"],
    [`${USER_B.id}@${ORG_B}`, "OWNER"],
    [`${USER_BASIC.id}@${ORG_BASIC}`, "OWNER"],
  ]);
  state.plans = new Map([[ORG_A, "PRO"], [ORG_B, "PRO"], [ORG_BASIC, "BASIC"]]);
  state.projects = new Map([
    ["p-a", project("p-a", ORG_A)],
    ["p-b", project("p-b", ORG_B)],
    ["p-basic", project("p-basic", ORG_BASIC)],
    ["p-legacy", project("p-legacy", null)],
    ["p-legacy-key", project("p-legacy-key", null)],
    ["p-legacy-own", project("p-legacy-own", null)],
    ["p-legacy-order", project("p-legacy-order", null)],
    ["p-legacy-wild", project("p-legacy-wild", null)],
    ["p-legacy-exp", project("p-legacy-exp", null)],
  ]);
  state.budgets = new Map([
    ["b-a-old", budget("b-a-old", "p-a", 136000, 60, DETAILED_ITEMS)],
    ["b-a-latest", budget("b-a-latest", "p-a", 222000, 0, DETAILED_ITEMS)],
    ["b-b", budget("b-b", "p-b", 2000, 0)],
    ["b-basic", budget("b-basic", "p-basic", 3000, 0)],
    ["b-legacy-old", budget("b-legacy-old", "p-legacy", 1000, 90)],
    ["b-legacy-latest", budget("b-legacy-latest", "p-legacy", 136000, 5, DETAILED_ITEMS)],
    ["b-legacy-key", budget("b-legacy-key", "p-legacy-key", 4000, 0)],
    ["b-legacy-own", budget("b-legacy-own", "p-legacy-own", 5000, 0)],
    ["b-legacy-order", budget("b-legacy-order", "p-legacy-order", 6000, 0)],
    ["b-legacy-wild", budget("b-legacy-wild", "p-legacy-wild", 7000, 0)],
    ["b-legacy-exp", budget("b-legacy-exp", "p-legacy-exp", 8000, 0)],
  ]);
  state.licenses = [
    license("lic-wildcard", null, WILDCARD_KEY, "enterprise"),
    license("lic-unbound-plan", "p-legacy", UNBOUND_PLAN_KEY),
    license("lic-bound-legacy", "p-legacy", "lic-s2-bound-legacy"),
    license("lic-bound-wild-other", null, "lic-s2-bound-wild-other", "enterprise"),
    license("lic-own-plan-key", "p-legacy-key", OWN_PLAN_KEY),
    license("lic-expired", "p-legacy-exp", "lic-s2-expired", "pro", new Date(Date.UTC(2026, 0, 2))),
    license("lic-a-plan", "p-a", "lic-s2-a-plan", "enterprise"),
  ];
  state.bindings = [
    { userId: USER_LEGACY.id, licenseId: "lic-bound-legacy" },
    { userId: USER_OTHER.id, licenseId: "lic-bound-wild-other" },
    { userId: USER_LEGACY.id, licenseId: "lic-expired" },
    { userId: USER_B.id, licenseId: "lic-a-plan" },
  ];
  state.orders = [
    order("ord-owner-less", "p-legacy-order", null, "paid"),
    order("ord-someone-else", "p-legacy-order", USER_LEGACY.id, "paid", "enterprise"),
    order("ord-own-enterprise", "p-legacy-own", USER_LEGACY.id, "PAID", "enterprise"),
    order("ord-own-pending", "p-legacy-wild", USER_OTHER.id, "pending"),
    order("ord-b-on-a", "p-a", USER_B.id, "paid", "enterprise"),
    order("ord-basic-own", "p-basic", USER_BASIC.id, "paid"),
    order("ord-plan-new", "plan-new", USER_LEGACY.id, "paid"),
  ];
}

/* ───────── stubs (installed before the route loads) ───────── */
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
const licenseSelect = (l: LicenseRow) => ({ id: l.id, planId: l.planId, planLevel: l.planLevel, expiresAt: l.expiresAt, createdAt: l.createdAt });

stubModule("lib/auth/session.service", { getSessionUser: async () => state.user, SaasAuthError });
stubModule("lib/auth/currentUser", { getCurrentUser: async () => state.user });
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
        state.calls.push("project.findUnique");
        return state.projects.get(where.id) ?? null;
      },
      upsert: async () => {
        state.calls.push("project.upsert");
        throw new Error("project.upsert must not run");
      },
    },
    budget: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        state.calls.push("budget.findUnique");
        return state.budgets.get(where.id) ?? null;
      },
      findFirst: async ({ where }: { where: { projectId: string } }) => {
        state.calls.push("budget.findFirst");
        return [...state.budgets.values()]
          .filter((b) => b.projectId === where.projectId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null;
      },
    },
    upgradeOrder: {
      findMany: async ({ where }: { where: { planId: string; userId?: string; id?: { in: string[] } } }) => {
        state.calls.push("upgradeOrder.findMany");
        return state.orders
          .filter((o) => o.planId === where.planId)
          .filter((o) => where.userId === undefined || o.userId === where.userId)
          .filter((o) => where.id === undefined || where.id.in.includes(o.id))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      },
    },
    licenseKey: {
      findMany: async ({ where }: { where: { OR: Array<{ planId: string | null }> } }) => {
        state.calls.push("licenseKey.findMany");
        const planIds = where.OR.map((c) => c.planId);
        return state.licenses.filter((l) => planIds.includes(l.planId)).map(licenseSelect);
      },
      findUnique: async ({ where }: { where: { keyHash: string } }) => {
        state.calls.push("licenseKey.findUnique");
        const hit = state.licenses.find((l) => l.keyHash === where.keyHash);
        return hit ? licenseSelect(hit) : null;
      },
    },
    licenseBinding: {
      findMany: async ({ where }: { where: { userId: string } }) => {
        state.calls.push("licenseBinding.findMany");
        return state.bindings
          .filter((b) => b.userId === where.userId)
          .map((b) => ({ ...b, license: licenseSelect(state.licenses.find((l) => l.id === b.licenseId)!) }));
      },
    },
  },
});

/* eslint-disable @typescript-eslint/no-require-imports */
const auth = require("../lib/auth/auth.service") as typeof import("../lib/auth/auth.service");
/* eslint-enable @typescript-eslint/no-require-imports */

stubModule("lib/saas/api-gate", {
  runSaasOrgGate: async (req: import("next/server").NextRequest, endpoint: string, body?: Record<string, unknown>) => {
    state.calls.push("gate");
    const ctx = await auth.authenticateRequest(req, body);
    if (endpoint !== PDF_ENDPOINT) throw namedError("UnexpectedEndpoint");
    return { ...ctx, traceId: "t-s2", plan: "BASIC" };
  },
});
stubModule("lib/billing/subscription/subscription.resolver", {
  resolveOrganizationFeatures: async (organizationId: string) => {
    state.calls.push("features");
    const plan = state.plans.get(organizationId) ?? "BASIC";
    return { plan, status: "ACTIVE", flags: { canGenerateBudget: plan === "PRO" || plan === "ENTERPRISE" }, currentPeriodEnd: null };
  },
});
stubModule("lib/pdf/renderBudgetPdf", {
  renderBudgetPdf: async (b: unknown, options: Record<string, unknown>) => {
    state.rendered.push({ budget: b, options });
    return Buffer.from("%PDF-1.4 s2-verifier");
  },
});
stubModule("lib/pdf/devFallback", {
  devProjectFallbackBudgetSelect: () => null,
  isDatabaseConnectivityError: () => false,
});
stubModule("lib/services/tender/provisionProjectFromPlan", {
  ensureProjectFromPlanJobId: async (planJobId: string) => {
    state.calls.push("provision");
    if (planJobId === "plan-new") state.projects.set(planJobId, project(planJobId, null));
  },
});

/* ───────── request helper ───────── */
type PostHandler = (req: import("next/server").NextRequest) => Promise<Response>;
type Result = { status: number; type: string; json: Record<string, unknown> | null };

async function call(
  POST: PostHandler,
  as: User | null,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): Promise<Result> {
  const { NextRequest } = await import("next/server");
  state.user = as;
  state.calls = [];
  state.rendered = [];
  const req = new NextRequest(`http://localhost${PDF_ENDPOINT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const res = await POST(req);
  const type = res.headers.get("content-type") ?? "";
  return { status: res.status, type, json: type.includes("application/json") ? ((await res.json()) as Record<string, unknown>) : null };
}
const ids = (projectId: string, extra: Record<string, unknown> = {}) => ({ projectId, planId: projectId, ...extra });
const org = (organizationId: string) => ({ "x-organization-id": organizationId });
const key = (raw: string) => ({ "x-license-key": raw });
function assertDenied(r: Result, status: number, error: string, label: string) {
  assert(r.status === status && r.json?.error === error, `${label} → ${status} ${error} (got ${r.status} ${json(r.json)})`);
  assert(state.rendered.length === 0, `${label}: no PDF rendered`);
  assert(called("budget.findFirst") === 0 && called("budget.findUnique") === 0, `${label}: no Budget read`);
  assert(called("provision") === 0 && called("project.upsert") === 0, `${label}: no project provisioning / mock`);
}
function assertRendered(r: Result, budgetId: string, tier: string, label: string) {
  assert(r.status === 200 && r.type === "application/pdf", `${label} → 200 application/pdf (got ${r.status} ${json(r.json)})`);
  assert(state.rendered.length === 1, `${label}: exactly one PDF rendered`);
  const stored = state.budgets.get(budgetId);
  assert(state.rendered[0].budget === stored, `${label}: renders stored Budget ${budgetId}`);
  assert(state.rendered[0].options.tier === tier, `${label}: tier ${tier} (got ${String(state.rendered[0].options.tier)})`);
}

/* ───────── organization projects without budgetId ───────── */
async function checkOrganizationProjects(POST: PostHandler) {
  let r = await call(POST, USER_B, ids("p-a"), org(ORG_B));
  assertDenied(r, 403, "TENANT_ISOLATION", "cross-org (org B member, org B header) → org A project, no budgetId");
  assert(legacyQueries() === 0 && called("features") === 0, "cross-org: no legacy entitlement query, no feature check");

  r = await call(POST, USER_B, ids("p-a"), { ...key(WILDCARD_KEY) });
  assertDenied(r, 401, "ORGANIZATION_CONTEXT_REQUIRED", "S2 production repro: org B session, no header, org A project (B has bound + paid grants for it, wildcard key presented)");
  assert(legacyQueries() === 0, "S2 repro: legacy License / UpgradeOrder never consulted for an organization project");

  r = await call(POST, USER_B, ids("p-a"), org(ORG_A));
  assertDenied(r, 401, "ORGANIZATION_CONTEXT_REQUIRED", "org B user claiming org A header (not a member)");

  r = await call(POST, null, ids("p-a"), { ...org(ORG_A), ...key(WILDCARD_KEY) });
  assertDenied(r, 401, "ORGANIZATION_CONTEXT_REQUIRED", "anonymous → organization project (wildcard key presented)");
  assert(legacyQueries() === 0, "anonymous organization project: no legacy query");

  r = await call(POST, USER_A, ids("p-a"));
  assertDenied(r, 401, "ORGANIZATION_CONTEXT_REQUIRED", "owning org member without x-organization-id");

  r = await call(POST, USER_BASIC, ids("p-basic"), org(ORG_BASIC));
  assertDenied(r, 403, "BUDGET_NOT_ENTITLED", "BASIC org own project without budgetId (own paid legacy order exists)");
  assert(legacyQueries() === 0, "BASIC organization project: no legacy fallback");

  const latest = json(state.budgets.get("b-a-latest"));
  r = await call(POST, USER_A, ids("p-a"), org(ORG_A));
  assertRendered(r, "b-a-latest", "pro", "same-org PRO without budgetId");
  assert(json(state.rendered[0].budget) === latest && legacyQueries() === 0, "same-org PRO: latest Budget snapshot unchanged, no legacy query");

  const old = json(state.budgets.get("b-a-old"));
  r = await call(POST, USER_A, ids("p-a", { budgetId: "b-a-old" }), org(ORG_A));
  assertRendered(r, "b-a-old", "pro", "same-org PRO with historical budgetId");
  assert(json(state.rendered[0].budget) === old, "same-org PRO: historical snapshot (T200 ¥30,000 VERIFIED) unchanged");
  out("✓ organization projects: cross-org / no header / non-member / anonymous / BASIC rejected without legacy; same-org PRO renders the stored snapshot");
}

/* ───────── organization-less legacy projects ───────── */
async function checkLegacyProjects(POST: PostHandler) {
  let r = await call(POST, null, ids("p-legacy"), key(UNBOUND_PLAN_KEY));
  assertDenied(r, 401, "LEGACY_LOGIN_REQUIRED", "anonymous → legacy project (valid plan key presented)");
  r = await call(POST, null, ids("p-legacy-wild"));
  assertDenied(r, 401, "LEGACY_LOGIN_REQUIRED", "anonymous → legacy project covered by a wildcard License");

  r = await call(POST, USER_OTHER, ids("p-legacy-wild"));
  assertDenied(r, 403, "BUDGET_NOT_ENTITLED", "wildcard License (unbound plan-scope + other user's bound wildcard)");
  r = await call(POST, USER_OTHER, ids("p-legacy-wild"), key(WILDCARD_KEY));
  assertDenied(r, 403, "BUDGET_NOT_ENTITLED", "wildcard License key presented by a logged-in user");
  r = await call(POST, USER_OTHER, ids("p-legacy"));
  assertDenied(r, 403, "BUDGET_NOT_ENTITLED", "unbound plan-scope License for exactly this plan (not linked to the user)");
  r = await call(POST, USER_OTHER, ids("p-legacy-order"));
  assertDenied(r, 403, "BUDGET_NOT_ENTITLED", "paid UpgradeOrders on the plan by nobody / someone else");
  r = await call(POST, USER_OTHER, ids("p-legacy-wild"));
  assertDenied(r, 403, "BUDGET_NOT_ENTITLED", "own pending (unpaid) UpgradeOrder");
  r = await call(POST, USER_LEGACY, ids("p-legacy-exp"));
  assertDenied(r, 403, "BUDGET_NOT_ENTITLED", "own bound but expired License");
  r = await call(POST, USER_A, ids("p-legacy"), org(ORG_A));
  assertDenied(r, 403, "BUDGET_NOT_ENTITLED", "organization membership does not grant an organization-less project");

  const legacyLatest = json(state.budgets.get("b-legacy-latest"));
  r = await call(POST, USER_LEGACY, ids("p-legacy"));
  assertRendered(r, "b-legacy-latest", "pro", "own bound License scoped to the plan");
  assert(json(state.rendered[0].budget) === legacyLatest, "legacy: latest Budget snapshot passed unchanged");

  r = await call(POST, USER_KEY, ids("p-legacy-key"), key(OWN_PLAN_KEY));
  assertRendered(r, "b-legacy-key", "pro", "logged-in user presenting the plan's own License key");
  r = await call(POST, null, ids("p-legacy-key"), key(OWN_PLAN_KEY));
  assertDenied(r, 401, "LEGACY_LOGIN_REQUIRED", "same License key without login");

  r = await call(POST, USER_LEGACY, ids("p-legacy-own"));
  assertRendered(r, "b-legacy-own", "enterprise", "own paid ENTERPRISE UpgradeOrder on the plan");
  r = await call(POST, USER_LEGACY, ids("p-legacy-order"));
  assertRendered(r, "b-legacy-order", "enterprise", "own paid UpgradeOrder among other paid orders");
  out("✓ legacy projects: anonymous → 401; wildcard / unbound plan-scope / others' or owner-less paid orders / pending / expired → 403; own bound License, own key, own paid order → stored snapshot");
}

/* ───────── provisioning / fallback only after authorization ───────── */
async function checkNoBypass(POST: PostHandler) {
  let r = await call(POST, USER_OTHER, ids("plan-new"));
  assertDenied(r, 403, "BUDGET_NOT_ENTITLED", "unknown plan without a linked grant");
  assert(!state.projects.has("plan-new"), "unauthorized request did not provision a project");
  r = await call(POST, null, ids("plan-new"));
  assertDenied(r, 401, "LEGACY_LOGIN_REQUIRED", "anonymous unknown plan");

  r = await call(POST, USER_LEGACY, ids("plan-new"));
  assert(r.status === 200 && called("provision") === 1 && state.rendered.length === 1, "linked plan owner: provisioning runs only after authorization");
  const stub = state.rendered[0].budget as { items?: Array<{ sourceType?: string }> };
  assert(stub.items?.every((i) => i.sourceType === "placeholder") === true, "freshly provisioned plan without Budget rows → placeholder stub (no other project's data)");
  state.projects.delete("plan-new");

  r = await call(POST, USER_A, ids("p-legacy", { budgetId: "b-legacy-latest" }), org(ORG_A));
  assertDenied(r, 403, "TENANT_ISOLATION", "budgetId on an organization-less project (S1 rule kept)");
  r = await call(POST, USER_LEGACY, ids("p-legacy", { budgetId: "b-legacy-latest" }));
  assertDenied(r, 401, "ORGANIZATION_CONTEXT_REQUIRED", "budgetId request by a legacy grant holder still needs organization context (S1 rule kept)");
  out("✓ no bypass: no provisioning / latest Budget / stub before authorization; S1 budgetId rules unchanged");
}

/* ───────── static + scope ───────── */
function checkStaticAndScope() {
  const src = fs.readFileSync(path.join(ROOT, ROUTE), "utf8");
  assert(!src.includes("isAccessEnabled") && !src.includes("normalizeUserTier(entitlement.effectiveLevel)"), "route no longer grants from the aggregated legacy snapshot");
  assert(src.includes("async function resolveLinkedLegacyAccess(") && src.includes('candidate.source !== "binding" && candidate.source !== "header-key"') && src.includes("where: { id: { in: paidOrderIds }, planId, userId }"), "legacy grants limited to the user's bound License / presented key / own paid order");
  assert(src.includes("if (ownerOrganizationId || requestBudgetId) {"), "organization projects and budgetId requests share the strict SaaS path");
  const authAt = src.indexOf("const legacy = await resolveLinkedLegacyAccess(");
  assert(authAt > 0 && authAt < src.indexOf("await ensureProjectFromPlanJobId(") && authAt < src.indexOf("prisma.budget.findFirst(") && authAt < src.indexOf("prisma.project.upsert("), "authorization precedes provisioning, latest-Budget read and dev mock");
  for (const forbidden of ["runSaasApiGate", "trackFeatureUsage", "trackUsage", "enforceFeatureAccess", "checkFeatureAccess"]) {
    assert(!src.includes(forbidden), `route does not use quota-touching ${forbidden}`);
  }

  const tracked = lines(git(`diff --name-only ${BASE}`)).filter((f) => !KNOWN_UNRELATED_DIRTY.has(f));
  assert(json(tracked) === json([ROUTE, F6_VERIFIER].sort()), `scope: tracked changes vs ${BASE} = Budget PDF route + F6 verifier (got ${json(tracked)})`);
  const untracked = lines(git("ls-files --others --exclude-standard")).filter((f) => !KNOWN_UNRELATED_DIRTY.has(f));
  assert(json(untracked) === json([S1_VERIFIER, S2_VERIFIER].sort()), `scope: new files = S1 + S2 verifiers (got ${json(untracked)})`);
  out("✓ static / scope: linked-legacy rule in place, authorization before any data fallback, only route + verifiers changed");
}

async function main() {
  Object.assign(process.env, { NODE_ENV: "production" });
  seed();
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { POST } = require("../app/api/pdf/tender/budget/route") as { POST: PostHandler };
  /* eslint-enable @typescript-eslint/no-require-imports */
  const originalLog = console.log;
  const originalWarn = console.warn;
  console.log = () => undefined;
  console.warn = () => undefined;
  try {
    await checkOrganizationProjects(POST);
    await checkLegacyProjects(POST);
    await checkNoBypass(POST);
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
  }
  checkStaticAndScope();
  out(`\nC.7-F1-S2 Budget PDF organization + linked legacy authorization: PASS (${passed} assertions)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

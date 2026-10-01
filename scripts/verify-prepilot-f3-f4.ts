/**
 * Target-user Pre-Pilot Correction Cycle 1 — F3 (duplicate PRO purchase safety)
 * and F4 (cross-project isolation) verification. No DB, no network.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  clearStoredQuoteIdForProject,
  mergeProductContext,
  PRODUCT_CONTEXT_STORAGE_KEY,
  QUOTE_BY_PROJECT_STORAGE_KEY,
  readStoredQuoteIdForProject,
  resolveClientProductContext,
  writeStoredProductContext,
} from "../app/(product)/commercial-context";
import {
  evaluateProPurchaseEligibility,
  type ProPurchaseEligibilityDeps,
} from "../lib/commercial/proPurchaseEligibility";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function withMockSessionStorage<T>(fn: () => T): T {
  const store = new Map<string, string>();
  const memory = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  };
  const priorWindow = globalThis.window;
  globalThis.window = { sessionStorage: memory } as unknown as Window & typeof globalThis.window;
  try {
    return fn();
  } finally {
    if (priorWindow === undefined) {
      Reflect.deleteProperty(globalThis, "window");
    } else {
      globalThis.window = priorWindow;
    }
  }
}

function deps(overrides: Partial<ProPurchaseEligibilityDeps> = {}): ProPurchaseEligibilityDeps {
  return {
    getCurrentUserId: async () => "u1",
    resolveOrganizationId: async () => "org1",
    getProjectOrganizationId: async () => "org1",
    getCurrentPlan: async () => "BASIC",
    ...overrides,
  };
}

const boom = async (): Promise<never> => {
  throw new Error("lookup failed");
};

async function checkEligibilityDecisionTable() {
  const basic = await evaluateProPurchaseEligibility({ projectId: "p1" }, deps());
  assert(basic.ok === true && basic.userId === "u1" && basic.organizationId === "org1", "BASIC eligible");

  for (const plan of ["PRO", "ENTERPRISE", "pro", " enterprise "]) {
    const r = await evaluateProPurchaseEligibility({}, deps({ getCurrentPlan: async () => plan }));
    assert(!r.ok && r.status === 409 && r.code === "ALREADY_ENTITLED", `${plan} → 409 ALREADY_ENTITLED`);
  }

  const unknownPlan = await evaluateProPurchaseEligibility({}, deps({ getCurrentPlan: async () => "" }));
  assert(!unknownPlan.ok && unknownPlan.status === 503, "unknown plan fails closed (503)");

  const failures: Array<[string, Partial<ProPurchaseEligibilityDeps>]> = [
    ["user lookup", { getCurrentUserId: boom }],
    ["org lookup", { resolveOrganizationId: boom }],
    ["project lookup", { getProjectOrganizationId: boom }],
    ["plan lookup", { getCurrentPlan: boom }],
  ];
  for (const [label, override] of failures) {
    const r = await evaluateProPurchaseEligibility({ projectId: "p1" }, deps(override));
    assert(
      !r.ok && r.status === 503 && r.code === "ENTITLEMENT_UNAVAILABLE",
      `${label} failure → 503 ENTITLEMENT_UNAVAILABLE`,
    );
  }

  const anon = await evaluateProPurchaseEligibility({}, deps({ getCurrentUserId: async () => null }));
  assert(!anon.ok && anon.status === 401 && anon.code === "AUTH_REQUIRED", "no session → 401");

  const noOrg = await evaluateProPurchaseEligibility({}, deps({ resolveOrganizationId: async () => null }));
  assert(!noOrg.ok && noOrg.status === 403 && noOrg.code === "ORGANIZATION_REQUIRED", "no org → 403");

  const foreignProject = await evaluateProPurchaseEligibility(
    { projectId: "p-other" },
    deps({ getProjectOrganizationId: async () => "org-other" }),
  );
  assert(
    !foreignProject.ok && foreignProject.status === 404 && foreignProject.code === "PROJECT_NOT_FOUND",
    "foreign project → 404",
  );
  const missingProject = await evaluateProPurchaseEligibility(
    { projectId: "p-missing" },
    deps({ getProjectOrganizationId: async () => null }),
  );
  assert(!missingProject.ok && missingProject.status === 404, "missing project → 404");

  const otherUserOrder = await evaluateProPurchaseEligibility({ orderUserId: "u-other" }, deps());
  assert(
    !otherUserOrder.ok && otherUserOrder.status === 403 && otherUserOrder.code === "ORDER_USER_MISMATCH",
    "order owned by another user → 403",
  );
  const ownOrder = await evaluateProPurchaseEligibility({ orderUserId: "u1" }, deps());
  assert(ownOrder.ok === true, "own legacy order on BASIC is payable");

  let planLookedUp = false;
  await evaluateProPurchaseEligibility(
    { projectId: "p-other" },
    deps({
      getProjectOrganizationId: async () => "org-other",
      getCurrentPlan: async () => {
        planLookedUp = true;
        return "BASIC";
      },
    }),
  );
  assert(!planLookedUp, "plan not resolved for a foreign project");
  console.log("✓ F3 eligibility decision table");
}

function checkPayRoutesUseGuard() {
  const createOrder = read("app/api/pay/create-order/route.ts");
  assert(createOrder.includes("resolveProPurchaseEligibility({ projectId })"), "create-order calls guard");
  assert(createOrder.includes("eligibility.status"), "create-order returns guard status");
  assert(createOrder.includes("proUserId"), "create-order uses session userId for PRO");

  const startPayment = read("app/api/pay/start-payment/route.ts");
  assert(startPayment.includes("resolveProPurchaseEligibility"), "start-payment calls guard");
  assert(startPayment.includes("orderUserId: order.userId"), "start-payment checks order owner");
  const guardIdx = startPayment.indexOf("resolveProPurchaseEligibility({");
  const providerIdx = startPayment.indexOf("getPaymentProvider()");
  assert(guardIdx > 0 && providerIdx > guardIdx, "start-payment guard runs before payment provider");

  const legacy = read("app/api/upgrade/create-order/route.ts");
  assert(!legacy.includes("proPurchaseEligibility"), "/api/upgrade/create-order untouched");

  const cta = read("app/(product)/ProUpgradePaymentCta.tsx");
  assert(cta.includes('"already_entitled"'), "CTA has already_entitled phase");
  assert(cta.includes("createData.code === ALREADY_ENTITLED_CODE"), "CTA stops on create-order 409");
  assert(cta.includes("startData.code === ALREADY_ENTITLED_CODE"), "CTA stops on start-payment 409");
  assert(cta.includes("onAlreadyEntitled"), "CTA exposes onAlreadyEntitled");
  console.log("✓ F3 pay routes + CTA wiring");
}

function checkQuoteEntitlementTriState() {
  const src = read("app/(product)/quote/page.tsx");
  assert(
    src.includes('type BudgetEntitlementState = "loading" | "entitled" | "upgradeable" | "error"'),
    "quote has tri-state entitlement",
  );
  assert(!src.includes("canGenerateBudget, setCanGenerateBudget"), "boolean budget flag removed");
  assert(src.includes('useState<BudgetEntitlementState>("loading")'), "entitlement starts loading");
  assert(
    src.includes('budgetEntitlement === "upgradeable" && hasProjectId'),
    "top pay gate requires upgradeable",
  );
  assert(src.includes('if (plan === "BASIC") return "upgradeable"'), "only BASIC is upgradeable");
  assert(src.includes('budgetEntitlement !== "upgradeable" ?'), "inline CTA gated on upgradeable");
  assert(
    src.includes('pdfDownloaded && budgetEntitlement === "upgradeable"'),
    "post-PDF CTA gated on upgradeable",
  );
  assert(src.includes("套餐权限确认失败") && src.includes("重试"), "error state shows retry");
  const ctaCount = src.split("<ProUpgradePaymentCta").length - 1;
  const alreadyCount = src.split("onAlreadyEntitled={refreshBudgetEntitlement}").length - 1;
  assert(ctaCount === 3 && alreadyCount === ctaCount, "every quote CTA handles already-entitled");
  console.log("✓ F3 quote entitlement tri-state");
}

function checkMergeDropsCrossProjectIds() {
  const crossed = mergeProductContext(
    { organizationId: "o1", projectId: "OLD", quoteId: "q-old", budgetId: "b-old" },
    { projectId: "NEW" },
  );
  assert(crossed.projectId === "NEW", "overlay project wins");
  assert(crossed.quoteId === undefined, "old quoteId dropped on project change");
  assert(crossed.budgetId === undefined, "old budgetId dropped on project change");
  assert(crossed.organizationId === "o1", "organization kept");

  const same = mergeProductContext(
    { projectId: "P", quoteId: "q1", budgetId: "b1" },
    { projectId: "P" },
  );
  assert(same.quoteId === "q1" && same.budgetId === "b1", "same project keeps ids");

  const explicit = mergeProductContext(
    { projectId: "OLD", quoteId: "q-old" },
    { projectId: "NEW", quoteId: "q-new" },
  );
  assert(explicit.quoteId === "q-new", "explicit overlay quote kept");

  withMockSessionStorage(() => {
    writeStoredProductContext(
      { organizationId: "o1", projectId: "OLD", quoteId: "q-old", budgetId: "b-old" },
      { mode: "replace" },
    );
    const ctx = resolveClientProductContext("projectId=NEW");
    assert(ctx.projectId === "NEW" && !ctx.quoteId && !ctx.budgetId, "/quote?projectId=NEW does not restore OLD ids");
    const stored = JSON.parse(window.sessionStorage.getItem(PRODUCT_CONTEXT_STORAGE_KEY) ?? "{}");
    assert(!stored.quoteId && !stored.budgetId, "stored context no longer carries OLD ids");

    window.sessionStorage.setItem(
      QUOTE_BY_PROJECT_STORAGE_KEY,
      JSON.stringify({ NEW: "q-bad", OTHER: "q-other" }),
    );
    clearStoredQuoteIdForProject("NEW", "q-unrelated");
    assert(readStoredQuoteIdForProject("NEW") === "q-bad", "clear skips when quote differs");
    clearStoredQuoteIdForProject("NEW", "q-bad");
    assert(readStoredQuoteIdForProject("NEW") === "", "clear removes mismatched mapping");
    assert(readStoredQuoteIdForProject("OTHER") === "q-other", "clear keeps other projects");
  });
  console.log("✓ F4 commercial-context isolation");
}

function checkServerProjectBinding() {
  const svc = read("lib/services/quote.service.ts");
  assert(svc.includes("export class QuoteProjectMismatchError"), "mismatch error exported");
  assert(svc.includes("export function assertQuoteBelongsToProject"), "project binding helper exported");
  assert(
    /loadReadyQuoteForTenant\([\s\S]*?assertResourceBelongsToTenant[\s\S]*?assertQuoteBelongsToProject/.test(svc),
    "PI loader checks tenant then project",
  );

  const pi = read("app/api/quote/product-intelligence/route.ts");
  assert(pi.includes('searchParams.get("projectId")'), "PI GET reads projectId");
  assert(pi.includes("body?.projectId"), "PI POST reads projectId");
  assert(pi.includes("缺少 quoteId 或 projectId"), "PI requires projectId");
  assert(
    pi.includes("err instanceof QuoteProjectMismatchError") && pi.includes("status: 409"),
    "PI maps mismatch → 409",
  );

  const budgetSvc = read("lib/services/budget.service.ts");
  assert(budgetSvc.includes("projectId?: string"), "budget projectId optional");
  assert(budgetSvc.includes("assertQuoteBelongsToProject(quote, input.projectId"), "budget verifies quote project");

  const budgetRoute = read("app/api/budget/calculate/route.ts");
  assert(budgetRoute.includes("body?.projectId"), "budget route reads projectId");
  assert(
    budgetRoute.includes("err instanceof QuoteProjectMismatchError") && budgetRoute.includes("status: 409"),
    "budget route maps mismatch → 409",
  );
  assert(budgetRoute.includes("projectId: result.budget.projectId"), "budget response contract kept");
  console.log("✓ F4 server project binding");
}

async function checkAssertQuoteBelongsToProject() {
  process.env.DATABASE_URL ??= "postgresql://verify:verify@127.0.0.1:5432/verify";
  const { assertQuoteBelongsToProject, QuoteProjectMismatchError } = await import(
    "../lib/services/quote.service"
  );
  const quote = { projectId: "A", project: { organizationId: "org1" } };
  assertQuoteBelongsToProject(quote, "A", "org1");
  const throwsMismatch = (fn: () => void) => {
    try {
      fn();
      return false;
    } catch (err) {
      return err instanceof QuoteProjectMismatchError && err.code === "QUOTE_PROJECT_MISMATCH";
    }
  };
  assert(throwsMismatch(() => assertQuoteBelongsToProject(quote, "B", "org1")), "projectId=B + quote of A rejected");
  assert(throwsMismatch(() => assertQuoteBelongsToProject(quote, "", "org1")), "empty projectId rejected");
  assert(throwsMismatch(() => assertQuoteBelongsToProject(quote, "A", "org2")), "other org rejected");
  console.log("✓ F4 assertQuoteBelongsToProject runtime");
}

function checkClientProjectScoping() {
  const quote = read("app/(product)/quote/page.tsx");
  assert(quote.includes("function resetProjectScopedState"), "quote has resetProjectScopedState");
  assert(quote.includes("projectChanged || !resolvedQuoteId"), "reset on project change / no quote");
  for (const setter of [
    "setQuoteId(\"\")",
    "setProposal(null)",
    "setProjectIntake(null)",
    "setPiView(null)",
    "setQuoteHistory([])",
    "setClarifyItems(null)",
    "setRevisionNotes(\"\")",
    "setPdfDownloaded(false)",
  ]) {
    const body = quote.slice(
      quote.indexOf("function resetProjectScopedState"),
      quote.indexOf("function discardMismatchedQuote"),
    );
    assert(body.includes(setter), `reset clears ${setter}`);
  }
  assert(!quote.includes("?? intake"), "no fallback to previous project's intake");
  assert(quote.includes("&projectId=${encodeURIComponent(pid)}"), "PI GET sends projectId");
  assert(quote.includes("projectId: currentProjectId,"), "PI POST sends projectId");
  assert(
    quote.includes('{ organizationId: nextOrganizationId, projectId: nextProjectId },\n      { mode: "replace" }'),
    "mismatch rewrites stored context with replace",
  );
  assert(quote.includes("不会带入这些选择"), "F5 temporary truthful revision confirm");

  const budget = read("app/(product)/budget/page.tsx");
  assert(budget.includes("projectId: ownedProjectId,\n          companySize"), "budget calculate sends projectId");
  assert(budget.includes('data.code === "QUOTE_PROJECT_MISMATCH"'), "budget handles mismatch");
  assert(budget.includes("请从项目页重新进入预算"), "budget tells user to re-enter from project page");
  console.log("✓ F4 client project scoping");
}

function checkF5StructuralNotImplemented() {
  const quote = read("app/(product)/quote/page.tsx");
  for (const token of ["currentStep", "carriedSelections"]) {
    assert(!quote.includes(token), `F5 token absent: ${token}`);
  }
  console.log("✓ F5 structural work absent");
}

function checkProtectedFilesUntouched() {
  const changed = execSync("git diff --name-only HEAD", { cwd: ROOT, encoding: "utf8" })
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const forbidden = [
    /^prisma\/schema/,
    /tender/i,
    /^app\/api\/upgrade\//,
    /^lib\/payments\/(?!wechatProvider\.ts$)/,
    /^app\/api\/pay\/(?!create-order|start-payment)/,
    /^lib\/billing\//,
    /^lib\/auth\//,
  ];
  for (const file of changed) {
    for (const re of forbidden) {
      assert(!re.test(file), `protected file changed: ${file}`);
    }
  }
  console.log("✓ protected files untouched");
}

async function main() {
  await checkEligibilityDecisionTable();
  checkPayRoutesUseGuard();
  checkQuoteEntitlementTriState();
  checkMergeDropsCrossProjectIds();
  checkServerProjectBinding();
  await checkAssertQuoteBelongsToProject();
  checkClientProjectScoping();
  checkF5StructuralNotImplemented();
  checkProtectedFilesUntouched();
  console.log("\nverify-prepilot-f3-f4: ALL PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

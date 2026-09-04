import fs from "node:fs";
import path from "node:path";

import {
  buildProductContextSearch,
  companyNameFromProject,
  mergeProductContext,
  parseProductContextSearch,
  pickOwnedProjectId,
  productHref,
} from "../app/(product)/commercial-context";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkHelper() {
  const parsed = parseProductContextSearch(
    "projectId=p1&quoteId=q1&budgetId=b1&organizationId=o1&junk=x",
  );
  assert(parsed.projectId === "p1", "parse projectId");
  assert(parsed.quoteId === "q1", "parse quoteId");
  assert(parsed.budgetId === "b1", "parse budgetId");
  assert(parsed.organizationId === "o1", "parse organizationId");

  const href = productHref("/budget", { projectId: "p1", quoteId: "q1" });
  assert(href === "/budget?projectId=p1&quoteId=q1", `budget href ${href}`);
  assert(
    productHref("/tender", { projectId: "p1", quoteId: "q1", budgetId: "b1" }).includes(
      "budgetId=b1",
    ),
    "tender href carries budgetId",
  );

  const merged = mergeProductContext({ projectId: "keep", quoteId: "old" }, { quoteId: "new" });
  assert(merged.projectId === "keep", "merge keeps project");
  assert(merged.quoteId === "new", "merge overlays quote");

  const owned = ["owned-a", "owned-b"];
  assert(pickOwnedProjectId("owned-b", owned) === "owned-b", "accept owned project");
  assert(pickOwnedProjectId("foreign", owned) === "", "reject foreign project");
  assert(pickOwnedProjectId(undefined, owned) === "", "do not fall back to first project");
  assert(companyNameFromProject({ name: "N", clientName: "C" }) === "C", "prefer clientName");
  assert(companyNameFromProject({ name: "N", clientName: null }) === "N", "fallback name");
  assert(buildProductContextSearch({ projectId: " p1 " }) === "projectId=p1", "trim ids");
  console.log("✓ commercial context helper");
}

function checkCommercialContextMerge() {
  const src = read("app/(product)/commercial-context.ts");
  assert(src.includes("readStoredQuoteIdForProject"), "exported quote-by-project reader");
  assert(
    src.includes("mergeProductContext(readStoredProductContext()"),
    "writeStoredProductContext merges with existing session by default",
  );
  assert(src.includes("QUOTE_BY_PROJECT_STORAGE_KEY"), "quote-by-project storage key");
  console.log("✓ commercial context session merge");
}

function checkQuotePage() {
  const src = read("app/(product)/quote/page.tsx");
  assert(src.includes("useSearchParams"), "quote consumes search params");
  assert(src.includes("pickOwnedProjectId"), "quote verifies owned project");
  assert(src.includes('productHref("/budget"'), "quote navigates to budget");
  assert(src.includes("quoteId: nextQuoteId"), "quote carries quoteId");
  assert(!src.includes("list.projects?.[0]"), "quote does not bind org first project");
  assert(
    src.includes("readStoredQuoteIdForProject"),
    "quote uses shared quote-by-project helper",
  );
  assert(
    !src.includes("function readStoredQuoteIdForProject"),
    "quote does not duplicate quote-by-project helper",
  );
  assert(src.includes("!quoteId ?"), "quote hides generate when quoteId exists");
  console.log("✓ quote page context");
}

function checkBudgetPage() {
  const src = read("app/(product)/budget/page.tsx");
  assert(src.includes("useSearchParams"), "budget consumes search params");
  assert(!src.includes('placeholder="Quote ID"'), "budget has no manual quoteId input");
  assert(!src.includes("resolveOrgProjectId"), "budget does not use org first project helper");
  assert(src.includes("data.projectId"), "budget PDF/context uses quote.projectId from API");
  assert(src.includes("pickOwnedProjectId"), "budget verifies owned project");
  assert(
    src.includes("readStoredQuoteIdForProject"),
    "budget uses shared quote-by-project helper",
  );
  assert(
    !src.includes("function readStoredQuoteIdForProject"),
    "budget does not duplicate quote-by-project helper",
  );
  assert(src.includes("fromCtx"), "budget prefers ctx organizationId before /api/auth/me");
  assert(
    src.includes("fromCtx || (await resolveOrganizationId())"),
    "budget orgId = fromCtx || me",
  );
  const hydrateStart = src.indexOf("async function hydrate()");
  const calculateStart = src.indexOf("async function handleCalculate()");
  assert(hydrateStart > 0 && calculateStart > hydrateStart, "budget hydrate + calculate present");
  const hydrate = src.slice(hydrateStart, calculateStart);
  const readyIdx = hydrate.indexOf("setContextReady(true)");
  const entitleIdx = hydrate.indexOf("loadTenderClientEntitlement");
  assert(readyIdx > 0 && entitleIdx > 0, "budget hydrate sets contextReady and loads entitlement");
  assert(
    readyIdx < entitleIdx,
    "budget setContextReady before entitlement (hydrate readiness)",
  );
  console.log("✓ budget page context");
}

function checkTenderPage() {
  const src = read("app/(product)/tender/page.tsx");
  assert(src.includes("useSearchParams"), "tender consumes search params");
  assert(src.includes("x-organization-id"), "tender sends org header");
  assert(!src.includes('placeholder="Project ID"'), "tender has no manual projectId input");
  assert(!src.includes('placeholder="Quote ID"'), "tender has no manual quoteId input");
  assert(src.includes("budgetId"), "tender consumes budgetId");
  console.log("✓ tender page context");
}

function checkWorkspaceHandoff() {
  const detail = read("app/(workspace)/projects/[id]/page.tsx");
  assert(detail.includes("/budget?projectId="), "project detail passes projectId to budget");
  assert(detail.includes("/tender?projectId="), "project detail passes projectId to tender");
  assert(detail.includes("quoteId="), "project detail passes quoteId when present");

  const list = read("app/(workspace)/projects/ProjectsPageClient.tsx");
  assert(list.includes("x-organization-id"), "projects list uses org header");
  assert(list.includes("/api/auth/me"), "projects list resolves org from session");
  assert(list.includes("listLoading"), "projects list loading state");
  assert(list.includes("searchQuery"), "projects list search state");
  assert(list.includes("项目加载中..."), "projects list loading label");
  assert(list.includes("搜索项目或企业名称"), "projects list search placeholder");
  console.log("✓ workspace handoff");
}

function checkNav() {
  const layout = read("app/(product)/layout.tsx");
  const nav = read("app/(product)/ProductCommercialNav.tsx");
  assert(layout.includes("ProductCommercialNav"), "product layout uses context nav");
  assert(nav.includes("productHref(\"/quote\""), "nav preserves quote context");
  assert(nav.includes("productHref(\"/budget\""), "nav preserves budget context");
  assert(nav.includes("productHref(\"/tender\""), "nav preserves tender context");
  console.log("✓ top navigation context");
}

function checkServerOwnership() {
  const budget = read("lib/services/budget.service.ts");
  const tender = read("lib/services/tender.service.ts");
  const budgetApi = read("app/api/budget/calculate/route.ts");
  assert(budget.includes("assertResourceBelongsToTenant"), "budget service tenant check");
  assert(tender.includes("assertResourceBelongsToTenant"), "tender service tenant check");
  assert(tender.includes("quote.projectId !== project.id"), "tender quote/project bind");
  assert(budgetApi.includes("projectId: result.budget.projectId"), "budget API returns quote.projectId");
  console.log("✓ server ownership checks");
}

function main() {
  checkHelper();
  checkCommercialContextMerge();
  checkQuotePage();
  checkBudgetPage();
  checkTenderPage();
  checkWorkspaceHandoff();
  checkNav();
  checkServerOwnership();
  console.log("\n✓ product commercial context — ALL CHECKS PASSED");
}

main();

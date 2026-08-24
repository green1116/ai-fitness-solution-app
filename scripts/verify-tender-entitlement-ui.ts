import fs from "node:fs";
import path from "node:path";

import { PLAN_FEATURE_MATRIX } from "../lib/feature-flags/feature.service";
import {
  buildTenderUpgradeHref,
  TENDER_RECOMMENDED_PLAN,
} from "../app/(product)/tender-entitlement";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function checkMatrixUnchanged() {
  assert(PLAN_FEATURE_MATRIX.BASIC.canGenerateTender === false, "BASIC no tender");
  assert(PLAN_FEATURE_MATRIX.PRO.canGenerateTender === false, "PRO no tender");
  assert(PLAN_FEATURE_MATRIX.ENTERPRISE.canGenerateTender === true, "ENTERPRISE tender");
  assert(TENDER_RECOMMENDED_PLAN === "ENTERPRISE", "upgrade target ENTERPRISE");
  assert(
    !read("app/(product)/tender-entitlement.ts").includes("TENDER_UPGRADE_HREF"),
    "no TENDER_UPGRADE_HREF dashboard fallback",
  );
  assert(
    buildTenderUpgradeHref(
      { organizationId: "org1", projectId: "p1", quoteId: "q1" },
      { authenticated: true, currentPath: "/budget" },
    ).startsWith("/budget?"),
    "auth upgrade stays on customer path",
  );
  assert(
    !buildTenderUpgradeHref(
      { organizationId: "org1", projectId: "p1", quoteId: "q1" },
      { authenticated: true, currentPath: "/budget" },
    ).includes("/dashboard/enterprise"),
    "auth upgrade avoids internal dashboard route",
  );
  assert(
    buildTenderUpgradeHref({ projectId: "p1" }, { authenticated: false }).includes("/register?plan=ENTERPRISE"),
    "guest upgrade keeps register fallback",
  );
  console.log("✓ PLAN_FEATURE_MATRIX unchanged");
}

function checkTenderPage() {
  const src = read("app/(product)/tender/page.tsx");
  assert(src.includes("/api/billing/subscription") || src.includes("loadTenderClientEntitlement"), "loads subscription entitlement");
  assert(src.includes("canGenerateTender"), "checks canGenerateTender");
  assert(src.includes("if (!entitlement?.canGenerateTender)"), "blocks generate without entitlement");
  assert(src.includes("loadTenderClientEntitlement(organizationId, {"), "rechecks before generate");
  assert(src.includes("tender_generation_click") || src.includes("loadTenderClientEntitlement"), "reuses paywall path");
  console.log("✓ tender page entitlement gate");
}

function checkNav() {
  const src = read("app/(product)/ProductCommercialNav.tsx");
  assert(src.includes("canGenerateTender"), "nav checks tender flag");
  assert(src.includes("TenderEnterpriseUpgradeCta"), "nav shows upgrade CTA");
  assert(src.includes("标书 Tender（锁定）"), "nav locks tender");
  assert(src.includes("productHref"), "nav preserves commercial context");
  assert(!src.includes('href="/dashboard"'), "nav console is not /dashboard");
  console.log("✓ product nav lock");
}

function checkProjectDetail() {
  const src = read("app/(workspace)/projects/[id]/page.tsx");
  assert(src.includes('trigger: "tender_generation_click"'), "project uses paywall trigger");
  assert(src.includes("evaluatePaywall"), "project reuses paywall.engine");
  assert(src.includes("生成标书（锁定）"), "project locks generate card");
  assert(src.includes("TenderEnterpriseUpgradeCta"), "project upgrade CTA");
  console.log("✓ project detail lock");
}

function checkPaywallReuse() {
  const client = read("app/(product)/tender-entitlement-client.ts");
  assert(client.includes("/api/billing/subscription"), "client loads billing subscription");
  assert(client.includes("/api/growth/paywall"), "client reuses growth paywall API");
  assert(client.includes("tender_generation_click"), "client uses tender_generation_click");
  const engine = read("lib/growth/conversion/paywall.engine.ts");
  assert(engine.includes("canGenerateTender: \"ENTERPRISE\""), "engine recommends ENTERPRISE");
  console.log("✓ paywall engine reuse");
}

function checkApiUntouched() {
  const api = read("app/api/tender/generate/route.ts");
  assert(api.includes('runSaasApiGate(req, "canGenerateTender"'), "tender API gate unchanged");
  console.log("✓ tender API not rewritten");
}

function checkBudgetUx() {
  const src = read("app/(product)/budget/page.tsx");
  assert(!src.includes("setResult(JSON.stringify"), "budget does not render raw JSON");
  assert(!src.includes("<pre"), "budget customer UI has no raw debug pre");
  assert(src.includes("预算已生成，可直接下载 PDF"), "budget shows customer summary");
  assert(src.includes("继续到 Tender 需要 Enterprise"), "budget uses enterprise upgrade wording");
  console.log("✓ budget customer UX");
}

function checkQuoteUx() {
  const src = read("app/(product)/quote/page.tsx");
  assert(src.includes("const [contextReady, setContextReady]"), "quote waits for context");
  assert(src.includes("加载项目上下文"), "quote hides company input while resolving");
  console.log("✓ quote context UX");
}

function hasDashboardTarget(src: string) {
  return /["'`]\/dashboard(?:\/[^"'`\s]*)?["'`]/.test(src) || src.includes("/dashboard/enterprise");
}

function checkNoInternalDashboardCta() {
  const files = [
    "app/(product)/TenderEnterpriseUpgradeCta.tsx",
    "app/(product)/tender-entitlement.ts",
    "app/(product)/tender-entitlement-client.ts",
    "app/(product)/ProductCommercialNav.tsx",
    "app/(product)/budget/page.tsx",
    "app/(product)/tender/page.tsx",
    "app/(workspace)/projects/[id]/page.tsx",
  ];
  for (const file of files) {
    const src = read(file);
    assert(!hasDashboardTarget(src), `${file} never targets /dashboard*`);
  }
  const cta = read("app/(product)/TenderEnterpriseUpgradeCta.tsx");
  assert(cta.includes("href: string"), "CTA href is required");
  assert(!cta.includes("href ="), "CTA has no default href");
  const authHref = buildTenderUpgradeHref(
    { organizationId: "org1", projectId: "p1", quoteId: "q1" },
    { authenticated: true, currentPath: "/budget" },
  );
  const guestHref = buildTenderUpgradeHref({ projectId: "p1" }, { authenticated: false });
  assert(!authHref.includes("/dashboard"), "auth CTA href is not /dashboard*");
  assert(!guestHref.includes("/dashboard"), "guest CTA href is not /dashboard*");
  console.log("✓ no internal dashboard CTA");
}

function main() {
  checkMatrixUnchanged();
  checkTenderPage();
  checkNav();
  checkProjectDetail();
  checkPaywallReuse();
  checkApiUntouched();
  checkBudgetUx();
  checkQuoteUx();
  checkNoInternalDashboardCta();
  console.log("\n✓ tender entitlement UI — ALL CHECKS PASSED");
}

main();

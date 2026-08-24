import fs from "node:fs";
import path from "node:path";

import { PLAN_FEATURE_MATRIX } from "../lib/feature-flags/feature.service";
import { TENDER_RECOMMENDED_PLAN, TENDER_UPGRADE_HREF } from "../app/(product)/tender-entitlement";

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
  assert(TENDER_UPGRADE_HREF.includes("plan=ENTERPRISE"), "upgrade href enterprise");
  console.log("✓ PLAN_FEATURE_MATRIX unchanged");
}

function checkTenderPage() {
  const src = read("app/(product)/tender/page.tsx");
  assert(src.includes("/api/billing/subscription") || src.includes("loadTenderClientEntitlement"), "loads subscription entitlement");
  assert(src.includes("canGenerateTender"), "checks canGenerateTender");
  assert(src.includes("if (!entitlement?.canGenerateTender)"), "blocks generate without entitlement");
  assert(src.includes("loadTenderClientEntitlement(organizationId)"), "rechecks before generate");
  assert(src.includes("tender_generation_click") || src.includes("loadTenderClientEntitlement"), "reuses paywall path");
  console.log("✓ tender page entitlement gate");
}

function checkNav() {
  const src = read("app/(product)/ProductCommercialNav.tsx");
  assert(src.includes("canGenerateTender"), "nav checks tender flag");
  assert(src.includes("TenderEnterpriseUpgradeCta"), "nav shows upgrade CTA");
  assert(src.includes("标书 Tender（锁定）"), "nav locks tender");
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

function main() {
  checkMatrixUnchanged();
  checkTenderPage();
  checkNav();
  checkProjectDetail();
  checkPaywallReuse();
  checkApiUntouched();
  console.log("\n✓ tender entitlement UI — ALL CHECKS PASSED");
}

main();

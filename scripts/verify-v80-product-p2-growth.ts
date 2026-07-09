/**
 * V80 PRODUCT P2 — Growth & Sales Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  CONVERSION_TRIGGERS,
  EXPANSION_PATHS,
  ENTERPRISE_GTM_MOTIONS,
  SALES_FUNNEL_STAGES,
  V80_PRODUCT_GROWTH_VERSION,
  assertGrowthPass,
  buildGrowth,
  formatGrowthSummary,
  getExpansionFromPlan,
  getTriggersByPlan,
  isConversionTriggersComplete,
  isEnterpriseGtmComplete,
  isExpansionEngineComplete,
  isSalesFunnelComplete,
  runGrowth,
} from "../lib/product/v80/growth.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-product-p2-growth";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/product/v80/growth.types.ts",
    "lib/product/v80/growth.funnel.spec.ts",
    "lib/product/v80/growth.conversion.spec.ts",
    "lib/product/v80/growth.gtm.spec.ts",
    "lib/product/v80/growth.expansion.spec.ts",
    "lib/product/v80/growth.builder.ts",
    "lib/product/v80/growth.entry.ts",
    "docs/V80-PRODUCT-P2-GROWTH.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ growth module structure");
}

function testSpecs() {
  check(SALES_FUNNEL_STAGES.length === 5, "5 funnel stages");
  check(CONVERSION_TRIGGERS.length === 7, "7 conversion triggers");
  check(ENTERPRISE_GTM_MOTIONS.length === 6, "6 GTM motions");
  check(EXPANSION_PATHS.length === 5, "5 expansion paths");
  check(isSalesFunnelComplete(), "funnel complete");
  check(isConversionTriggersComplete(), "triggers complete");
  check(isEnterpriseGtmComplete(), "gtm complete");
  check(isExpansionEngineComplete(), "expansion complete");

  check(getTriggersByPlan("PRO").length >= 4, "PRO triggers");
  check(getExpansionFromPlan("BASIC").length >= 2, "BASIC expansion paths");

  console.log("✓ funnel, conversion, GTM & expansion specs");
}

function testReport() {
  const ready = buildGrowth({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_PRODUCT_GROWTH_VERSION, "version");
  check(ready.productizationReady, "P1 ready");
  check(ready.manifest.growthComplete, "growth complete");
  check(ready.growthReady, "growth ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertGrowthPass(ready);

  check(runGrowth({ deploymentId: DEPLOYMENT_ID }).growthReady, "run ready");

  console.log("✓ growth report");
  console.log(formatGrowthSummary(ready));
  console.log("\n✅ V80 PRODUCT P2 Growth — verify PASS");
}

function main() {
  console.log("V80 PRODUCT P2 Growth & Sales Verification\n");
  checkModuleStructure();
  testSpecs();
  testReport();
}

main();

/**
 * V80 PRODUCT P1 — Productization Mapping Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  PRODUCT_JOURNEY_FLOWS,
  PRODUCT_MODULE_PACKS,
  PRODUCT_ONBOARDING_FLOW,
  PRODUCT_PACKAGING_TIERS,
  PRODUCT_PRICING_TIERS,
  V80_PRODUCT_PRODUCTIZATION_VERSION,
  assertProductizationPass,
  buildProductization,
  formatProductizationSummary,
  getJourneyByKey,
  getPackagingByPlan,
  getPricingByPlan,
  isProductJourneyMapComplete,
  isProductOnboardingComplete,
  isProductPackagingComplete,
  isProductPricingComplete,
  runProductization,
} from "../lib/product/v80/productization.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-product-p1-productization";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/product/v80/productization.types.ts",
    "lib/product/v80/product.packaging.spec.ts",
    "lib/product/v80/product.journey.spec.ts",
    "lib/product/v80/product.pricing.spec.ts",
    "lib/product/v80/product.onboarding.spec.ts",
    "lib/product/v80/productization.builder.ts",
    "lib/product/v80/productization.entry.ts",
    "docs/V80-PRODUCT-P1-PRODUCTIZATION.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ productization module structure");
}

function testSpecs() {
  check(PRODUCT_PACKAGING_TIERS.length === 3, "3 packaging tiers");
  check(PRODUCT_MODULE_PACKS.length === 8, "8 module packs");
  check(PRODUCT_JOURNEY_FLOWS.length === 4, "4 journeys");
  check(PRODUCT_PRICING_TIERS.length === 3, "3 pricing tiers");
  check(PRODUCT_ONBOARDING_FLOW.length === 6, "6 onboarding steps");
  check(isProductPackagingComplete(), "packaging complete");
  check(isProductJourneyMapComplete(), "journeys complete");
  check(isProductPricingComplete(), "pricing complete");
  check(isProductOnboardingComplete(), "onboarding complete");

  check(getPackagingByPlan("PRO")?.marketName === "FitScale", "PRO packaging");
  check(getJourneyByKey("budget-planning")?.workflowRef === "APP-WFL-003", "budget journey");
  check(getPricingByPlan("BASIC")?.monthlyPriceUsd === 49, "BASIC price");

  console.log("✓ packaging, journeys, pricing & onboarding specs");
}

function testReport() {
  const ready = buildProductization({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_PRODUCT_PRODUCTIZATION_VERSION, "version");
  check(ready.codeReleaseReady, "code release ready");
  check(ready.manifest.productizationComplete, "productization complete");
  check(ready.productizationReady, "productization ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertProductizationPass(ready);

  const run = runProductization({ deploymentId: DEPLOYMENT_ID });
  check(run.productizationReady, "run ready");

  console.log("✓ productization report");
  console.log(formatProductizationSummary(ready));
  console.log("\n✅ V80 PRODUCT P1 Productization — verify PASS");
}

function main() {
  console.log("V80 PRODUCT P1 Productization Mapping Verification\n");
  checkModuleStructure();
  testSpecs();
  testReport();
}

main();

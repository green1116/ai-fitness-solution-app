/**
 * V80 POST-LAUNCH P1 — Revenue activation verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  FIRST_CUSTOMER_REVENUE_PATH,
  HIGH_CONVERSION_ENTRY_POINTS,
  PRICING_PRESSURE_POINTS,
  REVENUE_ACTIVATION_LOOP,
  V80_POSTLAUNCH_REVENUE_VERSION,
  assertRevenueActivationPass,
  buildRevenueActivation,
  formatRevenueSummary,
  isFirstCustomerRevenuePathComplete,
  isHighConversionEntryPointsComplete,
  isPricingPressureComplete,
  isRevenueLoopComplete,
  runRevenueActivation,
} from "../lib/postlaunch/v80/revenue.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-postlaunch-p1-revenue";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/postlaunch/v80/revenue.types.ts",
    "lib/postlaunch/v80/revenue.loop.spec.ts",
    "lib/postlaunch/v80/revenue.entrypoints.spec.ts",
    "lib/postlaunch/v80/revenue.first-customer.spec.ts",
    "lib/postlaunch/v80/revenue.pricing-pressure.spec.ts",
    "lib/postlaunch/v80/revenue.builder.ts",
    "lib/postlaunch/v80/revenue.entry.ts",
    "docs/V80-POST-LAUNCH-P1-REVENUE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ revenue module structure");
}

function testSpecs() {
  check(REVENUE_ACTIVATION_LOOP.length === 10, "10 loop stages");
  check(HIGH_CONVERSION_ENTRY_POINTS.length === 7, "7 entry points");
  check(FIRST_CUSTOMER_REVENUE_PATH.length === 8, "8 first-customer steps");
  check(PRICING_PRESSURE_POINTS.length === 8, "8 pricing pressure points");
  check(isRevenueLoopComplete(), "activation loop");
  check(isHighConversionEntryPointsComplete(), "entry points");
  check(isFirstCustomerRevenuePathComplete(), "first customer path");
  check(isPricingPressureComplete(), "pricing pressure");
  console.log("✓ loop, entrypoints, first-customer & pricing specs");
}

function testReport() {
  const ready = buildRevenueActivation({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_POSTLAUNCH_REVENUE_VERSION, "version");
  check(ready.cutoverReady, "cutover ready");
  check(ready.growthReady, "growth ready");
  check(ready.manifest.revenueActivationComplete, "revenue activation complete");
  check(ready.revenueReady, "revenue ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertRevenueActivationPass(ready);
  check(runRevenueActivation({ deploymentId: DEPLOYMENT_ID }).revenueReady, "run ready");

  console.log("✓ revenue activation report");
  console.log(formatRevenueSummary(ready));
  console.log("\n✅ V80 POST-LAUNCH P1 Revenue Activation — verify PASS");
}

function main() {
  console.log("V80 POST-LAUNCH P1 Revenue Activation Verification\n");
  checkModuleStructure();
  testSpecs();
  testReport();
}

main();

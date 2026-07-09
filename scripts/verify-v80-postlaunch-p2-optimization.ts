/**
 * V80 POST-LAUNCH P2 — Revenue optimization verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  CONVERSION_RATE_TUNING,
  ENTERPRISE_SALES_ACCELERATION,
  PRICING_YIELD_OPTIMIZATION,
  REVENUE_LEAK_DETECTION,
  V80_POSTLAUNCH_OPTIMIZATION_VERSION,
  assertRevenueOptimizationPass,
  buildRevenueOptimization,
  formatOptimizationSummary,
  isConversionRateTuningComplete,
  isEnterpriseSalesAccelerationComplete,
  isPricingYieldOptimizationComplete,
  isRevenueLeakDetectionComplete,
  runRevenueOptimization,
} from "../lib/postlaunch/v80/optimization.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-postlaunch-p2-optimization";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/postlaunch/v80/optimization.types.ts",
    "lib/postlaunch/v80/optimization.conversion.spec.ts",
    "lib/postlaunch/v80/optimization.enterprise.spec.ts",
    "lib/postlaunch/v80/optimization.pricing-yield.spec.ts",
    "lib/postlaunch/v80/optimization.leak-detection.spec.ts",
    "lib/postlaunch/v80/optimization.builder.ts",
    "lib/postlaunch/v80/optimization.entry.ts",
    "docs/V80-POST-LAUNCH-P2-OPTIMIZATION.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ optimization module structure");
}

function testSpecs() {
  check(CONVERSION_RATE_TUNING.length === 7, "7 conversion tunings");
  check(ENTERPRISE_SALES_ACCELERATION.length === 7, "7 enterprise accelerations");
  check(PRICING_YIELD_OPTIMIZATION.length === 8, "8 pricing yield opts");
  check(REVENUE_LEAK_DETECTION.length === 8, "8 leak points");
  check(isConversionRateTuningComplete(), "conversion tuning");
  check(isEnterpriseSalesAccelerationComplete(), "enterprise acceleration");
  check(isPricingYieldOptimizationComplete(), "pricing yield");
  check(isRevenueLeakDetectionComplete(), "leak detection");
  console.log("✓ conversion, enterprise, yield & leak specs");
}

function testReport() {
  const ready = buildRevenueOptimization({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_POSTLAUNCH_OPTIMIZATION_VERSION, "version");
  check(ready.revenueReady, "P1 revenue ready");
  check(ready.manifest.optimizationComplete, "optimization complete");
  check(ready.optimizationReady, "optimization ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertRevenueOptimizationPass(ready);
  check(runRevenueOptimization({ deploymentId: DEPLOYMENT_ID }).optimizationReady, "run ready");

  console.log("✓ revenue optimization report");
  console.log(formatOptimizationSummary(ready));
  console.log("\n✅ V80 POST-LAUNCH P2 Revenue Optimization — verify PASS");
}

function main() {
  console.log("V80 POST-LAUNCH P2 Revenue Optimization Verification\n");
  checkModuleStructure();
  testSpecs();
  testReport();
}

main();

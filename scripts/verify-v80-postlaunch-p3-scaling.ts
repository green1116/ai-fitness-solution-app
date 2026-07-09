/**
 * V80 POST-LAUNCH P3 — Revenue scaling verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  CHANNEL_SCALING_SYSTEM,
  ENTERPRISE_EXPANSION_MODEL,
  REVENUE_COMPOUNDING_LOOPS,
  SALES_AUTOMATION_ENGINE,
  V80_POSTLAUNCH_SCALING_VERSION,
  assertRevenueScalingPass,
  buildRevenueScaling,
  formatScalingSummary,
  isChannelScalingSystemComplete,
  isEnterpriseExpansionModelComplete,
  isRevenueCompoundingLoopsComplete,
  isSalesAutomationEngineComplete,
  runRevenueScaling,
} from "../lib/postlaunch/v80/scaling.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-postlaunch-p3-scaling";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/postlaunch/v80/scaling.types.ts",
    "lib/postlaunch/v80/scaling.compounding.spec.ts",
    "lib/postlaunch/v80/scaling.channels.spec.ts",
    "lib/postlaunch/v80/scaling.sales-automation.spec.ts",
    "lib/postlaunch/v80/scaling.enterprise-expansion.spec.ts",
    "lib/postlaunch/v80/scaling.builder.ts",
    "lib/postlaunch/v80/scaling.entry.ts",
    "docs/V80-POST-LAUNCH-P3-SCALING.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ scaling module structure");
}

function testSpecs() {
  check(REVENUE_COMPOUNDING_LOOPS.length === 8, "8 compounding loops");
  check(CHANNEL_SCALING_SYSTEM.length === 8, "8 channel systems");
  check(SALES_AUTOMATION_ENGINE.length === 8, "8 sales automation steps");
  check(ENTERPRISE_EXPANSION_MODEL.length === 8, "8 enterprise expansions");
  check(isRevenueCompoundingLoopsComplete(), "compounding loops");
  check(isChannelScalingSystemComplete(), "channel scaling");
  check(isSalesAutomationEngineComplete(), "sales automation");
  check(isEnterpriseExpansionModelComplete(), "enterprise expansion");
  console.log("✓ compounding, channels, automation & expansion specs");
}

function testReport() {
  const ready = buildRevenueScaling({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_POSTLAUNCH_SCALING_VERSION, "version");
  check(ready.optimizationReady, "P2 optimization ready");
  check(ready.manifest.scalingComplete, "scaling complete");
  check(ready.scalingReady, "scaling ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertRevenueScalingPass(ready);
  check(runRevenueScaling({ deploymentId: DEPLOYMENT_ID }).scalingReady, "run ready");

  console.log("✓ revenue scaling report");
  console.log(formatScalingSummary(ready));
  console.log("\n✅ V80 POST-LAUNCH P3 Revenue Scaling — verify PASS");
}

function main() {
  console.log("V80 POST-LAUNCH P3 Revenue Scaling Verification\n");
  checkModuleStructure();
  testSpecs();
  testReport();
}

main();

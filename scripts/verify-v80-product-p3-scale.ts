/**
 * V80 PRODUCT P3 — Scale & Market Domination Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  CHANNEL_SCALING_MODELS,
  GROWTH_FLYWHEEL,
  MARKET_DOMINANCE_PILLARS,
  ENTERPRISE_REPLICATION_MODELS,
  V80_PRODUCT_SCALE_VERSION,
  assertScalePass,
  buildScale,
  formatScaleSummary,
  getChannelsByType,
  isChannelScalingComplete,
  isEnterpriseReplicationComplete,
  isGrowthFlywheelComplete,
  isMarketDominanceComplete,
  runScale,
} from "../lib/product/v80/scale.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-product-p3-scale";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/product/v80/scale.types.ts",
    "lib/product/v80/scale.dominance.spec.ts",
    "lib/product/v80/scale.channel.spec.ts",
    "lib/product/v80/scale.replication.spec.ts",
    "lib/product/v80/scale.flywheel.spec.ts",
    "lib/product/v80/scale.builder.ts",
    "lib/product/v80/scale.entry.ts",
    "docs/V80-PRODUCT-P3-SCALE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ scale module structure");
}

function testSpecs() {
  check(MARKET_DOMINANCE_PILLARS.length === 6, "6 dominance pillars");
  check(CHANNEL_SCALING_MODELS.length === 8, "8 channel models");
  check(ENTERPRISE_REPLICATION_MODELS.length === 6, "6 replication models");
  check(GROWTH_FLYWHEEL.length === 5, "5 flywheel stages");
  check(isMarketDominanceComplete(), "dominance complete");
  check(isChannelScalingComplete(), "channels complete");
  check(isEnterpriseReplicationComplete(), "replication complete");
  check(isGrowthFlywheelComplete(), "flywheel complete");
  check(getChannelsByType("tender").length === 2, "tender channel");
  console.log("✓ dominance, channels, replication & flywheel specs");
}

function testReport() {
  const ready = buildScale({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_PRODUCT_SCALE_VERSION, "version");
  check(ready.growthReady, "P2 ready");
  check(ready.manifest.scaleComplete, "scale complete");
  check(ready.scaleReady, "scale ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertScalePass(ready);
  check(runScale({ deploymentId: DEPLOYMENT_ID }).scaleReady, "run ready");

  console.log("✓ scale report");
  console.log(formatScaleSummary(ready));
  console.log("\n✅ V80 PRODUCT P3 Scale — verify PASS");
}

function main() {
  console.log("V80 PRODUCT P3 Scale & Market Domination Verification\n");
  checkModuleStructure();
  testSpecs();
  testReport();
}

main();

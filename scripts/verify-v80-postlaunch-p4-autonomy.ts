/**
 * V80 POST-LAUNCH P4 — Autonomous growth verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  AUTONOMOUS_EXPANSION_ENGINE,
  AUTONOMOUS_LEAD_GENERATION,
  CLOSED_LOOP_GROWTH_FLYWHEEL,
  SELF_GENERATING_SALES_MOTION,
  V80_POSTLAUNCH_AUTONOMY_VERSION,
  assertAutonomousGrowthPass,
  buildAutonomousGrowth,
  formatAutonomySummary,
  isAutonomousExpansionEngineComplete,
  isAutonomousLeadGenerationComplete,
  isClosedLoopGrowthFlywheelComplete,
  isSelfGeneratingSalesMotionComplete,
  runAutonomousGrowth,
} from "../lib/postlaunch/v80/autonomy.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-postlaunch-p4-autonomy";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/postlaunch/v80/autonomy.types.ts",
    "lib/postlaunch/v80/autonomy.lead-generation.spec.ts",
    "lib/postlaunch/v80/autonomy.sales-motion.spec.ts",
    "lib/postlaunch/v80/autonomy.expansion-engine.spec.ts",
    "lib/postlaunch/v80/autonomy.flywheel.spec.ts",
    "lib/postlaunch/v80/autonomy.builder.ts",
    "lib/postlaunch/v80/autonomy.entry.ts",
    "docs/V80-POST-LAUNCH-P4-AUTONOMY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ autonomy module structure");
}

function testSpecs() {
  check(AUTONOMOUS_LEAD_GENERATION.length === 8, "8 lead signals");
  check(SELF_GENERATING_SALES_MOTION.length === 8, "8 sales motion steps");
  check(AUTONOMOUS_EXPANSION_ENGINE.length === 8, "8 expansion rules");
  check(CLOSED_LOOP_GROWTH_FLYWHEEL.length === 8, "8 flywheel stages");
  check(isAutonomousLeadGenerationComplete(), "lead generation");
  check(isSelfGeneratingSalesMotionComplete(), "sales motion");
  check(isAutonomousExpansionEngineComplete(), "expansion engine");
  check(isClosedLoopGrowthFlywheelComplete(), "closed-loop flywheel");
  check(AUTONOMOUS_LEAD_GENERATION.every((s) => s.humanRequired === false), "zero human lead init");
  console.log("✓ lead, sales, expansion & flywheel specs");
}

function testReport() {
  const ready = buildAutonomousGrowth({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_POSTLAUNCH_AUTONOMY_VERSION, "version");
  check(ready.scalingReady, "P3 scaling ready");
  check(ready.manifest.autonomyComplete, "autonomy complete");
  check(ready.autonomyReady, "autonomy ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertAutonomousGrowthPass(ready);
  check(runAutonomousGrowth({ deploymentId: DEPLOYMENT_ID }).autonomyReady, "run ready");

  console.log("✓ autonomous growth report");
  console.log(formatAutonomySummary(ready));
  console.log("\n✅ V80 POST-LAUNCH P4 Autonomous Growth — verify PASS");
}

function main() {
  console.log("V80 POST-LAUNCH P4 Autonomous Growth Verification\n");
  checkModuleStructure();
  testSpecs();
  testReport();
}

main();

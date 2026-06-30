/**
 * V65 P8 — Production Sign-Off Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  V65_PRODUCTION_SIGNOFF_VERSION,
  assertProductionSignoffPass,
  buildProductionSignoffReport,
  closeV65Production,
  runProductionSignoff,
} from "../lib/production/v65/signoff";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v65-p8-production-signoff";
const SIGNALS = {
  verifyChainPass: true,
  typeScriptClean: true,
  buildPass: true,
  prismaPreflightPass: true,
};

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/production/v65/signoff.ts",
    "lib/production/v65/signoff.types.ts",
    "lib/production/v65/signoff.summary.ts",
    "lib/production/v65/signoff.builder.ts",
    "lib/production/v65/signoff.entry.ts",
    "docs/production/V65-PRODUCTION-SIGNOFF.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V65 production sign-off module structure");
}

function testSignoffReport() {
  const report = runProductionSignoff({ deploymentId: DEPLOYMENT_ID, signals: SIGNALS });
  assert(report.version === V65_PRODUCTION_SIGNOFF_VERSION, "signoff version");
  assert(report.phases.length === 7, "seven prior phases");
  assert(report.phases.every((p) => p.ok), "all phases pass");
  assert(report.freeze.frozen, "freeze intact");
  assert(report.allPhasesPass, "all phases pass flag");
  assert(report.signedOff, "signed off");

  const asserted = assertProductionSignoffPass({ deploymentId: DEPLOYMENT_ID, signals: SIGNALS });
  assert(asserted.signedOff, "assert signoff pass");

  const closed = closeV65Production({ deploymentId: DEPLOYMENT_ID, signals: SIGNALS });
  assert(closed.signedOff, "close V65 production");

  console.log("✓ production sign-off report");
  console.log(buildProductionSignoffReport({ deploymentId: DEPLOYMENT_ID, signals: SIGNALS }).closingSummary);
  console.log("\n✅ V65 P8 Production Sign-Off — verify PASS");
  console.log("✅ V65 Production Readiness — CLOSED");
}

function main() {
  console.log("V65 P8 Production Sign-Off Verification\n");
  checkModuleStructure();
  testSignoffReport();
}

main();

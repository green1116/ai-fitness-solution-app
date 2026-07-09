/**
 * V80 REAL EXEC P2 — First deal closing verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  CLOSING_SCRIPT,
  DEMO_FLOW_30MIN,
  FIRST_CONTACT_SCRIPT,
  OBJECTION_HANDLING,
  V80_REALEXEC_CLOSING_VERSION,
  assertFirstDealClosingPass,
  buildFirstDealClosing,
  formatClosingSummary,
  isClosingScriptComplete,
  isDemoFlowComplete,
  isFirstContactScriptComplete,
  isObjectionHandlingComplete,
  runFirstDealClosing,
} from "../lib/realexec/v80/closing.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-realexec-p2-closing";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/realexec/v80/closing.types.ts",
    "lib/realexec/v80/closing.first-contact.spec.ts",
    "lib/realexec/v80/closing.demo-flow.spec.ts",
    "lib/realexec/v80/closing.objections.spec.ts",
    "lib/realexec/v80/closing.close-script.spec.ts",
    "lib/realexec/v80/closing.builder.ts",
    "lib/realexec/v80/closing.entry.ts",
    "docs/V80-REAL-EXEC-P2-CLOSING.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ closing module structure");
}

function testSpecs() {
  check(FIRST_CONTACT_SCRIPT.length === 6, "6 contact scripts");
  check(DEMO_FLOW_30MIN.length === 8, "8 demo steps");
  check(OBJECTION_HANDLING.length === 8, "8 objection responses");
  check(CLOSING_SCRIPT.length === 8, "8 closing beats");
  check(isFirstContactScriptComplete(), "first contact");
  check(isDemoFlowComplete(), "demo flow");
  check(isObjectionHandlingComplete(), "objections");
  check(isClosingScriptComplete(), "closing script");
  console.log("✓ contact, demo, objections & closing specs");
}

function testReport() {
  const ready = buildFirstDealClosing({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_REALEXEC_CLOSING_VERSION, "version");
  check(ready.executionReady, "GTM P2 execution ready");
  check(ready.manifest.closingComplete, "closing complete");
  check(ready.closingReady, "closing ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertFirstDealClosingPass(ready);
  check(runFirstDealClosing({ deploymentId: DEPLOYMENT_ID }).closingReady, "run ready");

  console.log("✓ first deal closing report");
  console.log(formatClosingSummary(ready));
  console.log("\n✅ V80 REAL EXEC P2 First Deal Closing — verify PASS");
}

function main() {
  console.log("V80 REAL EXEC P2 First Deal Closing Verification\n");
  checkModuleStructure();
  testSpecs();
  testReport();
}

main();

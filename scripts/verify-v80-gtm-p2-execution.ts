/**
 * V80 GTM P2 — First revenue execution verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  FIRST_DEAL_EXECUTION_FLOW,
  FIRST_DEAL_OFFER_PACK,
  REVENUE_CAPTURE_MECHANISM,
  SALES_EXECUTION_SCRIPT,
  V80_GTM_EXECUTION_VERSION,
  assertFirstRevenueExecutionPass,
  buildFirstRevenueExecution,
  formatExecutionSummary,
  isFirstDealExecutionFlowComplete,
  isFirstDealOfferPackComplete,
  isRevenueCaptureMechanismComplete,
  isSalesExecutionScriptComplete,
  runFirstRevenueExecution,
} from "../lib/gtm/v80/execution.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-gtm-p2-execution";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/gtm/v80/execution.types.ts",
    "lib/gtm/v80/execution.deal-flow.spec.ts",
    "lib/gtm/v80/execution.offer-pack.spec.ts",
    "lib/gtm/v80/execution.sales-script.spec.ts",
    "lib/gtm/v80/execution.revenue-capture.spec.ts",
    "lib/gtm/v80/execution.builder.ts",
    "lib/gtm/v80/execution.entry.ts",
    "docs/V80-GTM-P2-EXECUTION.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ execution module structure");
}

function testSpecs() {
  check(FIRST_DEAL_EXECUTION_FLOW.length === 10, "10 deal steps");
  check(FIRST_DEAL_OFFER_PACK.length === 6, "6 offer pack items");
  check(SALES_EXECUTION_SCRIPT.length === 8, "8 script beats");
  check(REVENUE_CAPTURE_MECHANISM.length === 8, "8 capture points");
  check(isFirstDealExecutionFlowComplete(), "deal flow");
  check(isFirstDealOfferPackComplete(), "offer pack");
  check(isSalesExecutionScriptComplete(), "sales script");
  check(isRevenueCaptureMechanismComplete(), "revenue capture");
  console.log("✓ deal flow, offer, script & capture specs");
}

function testReport() {
  const ready = buildFirstRevenueExecution({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_GTM_EXECUTION_VERSION, "version");
  check(ready.activationReady, "GTM P1 activation ready");
  check(ready.manifest.executionComplete, "execution complete");
  check(ready.executionReady, "execution ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertFirstRevenueExecutionPass(ready);
  check(runFirstRevenueExecution({ deploymentId: DEPLOYMENT_ID }).executionReady, "run ready");

  console.log("✓ first revenue execution report");
  console.log(formatExecutionSummary(ready));
  console.log("\n✅ V80 GTM P2 First Revenue Execution — verify PASS");
}

function main() {
  console.log("V80 GTM P2 First Revenue Execution Verification\n");
  checkModuleStructure();
  testSpecs();
  testReport();
}

main();

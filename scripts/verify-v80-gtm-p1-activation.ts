/**
 * V80 GTM P1 — Real customer activation verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  FIRST_CUSTOMER_ACQUISITION,
  GTM_ENTRY_POINTS,
  INITIAL_SALES_MOTION,
  REVENUE_VALIDATION_LOOP,
  V80_GTM_ACTIVATION_VERSION,
  assertCustomerActivationPass,
  buildCustomerActivation,
  formatActivationSummary,
  isFirstCustomerAcquisitionComplete,
  isGtmEntryPointsComplete,
  isInitialSalesMotionComplete,
  isRevenueValidationLoopComplete,
  runCustomerActivation,
} from "../lib/gtm/v80/activation.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-gtm-p1-activation";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/gtm/v80/activation.types.ts",
    "lib/gtm/v80/activation.first-customer.spec.ts",
    "lib/gtm/v80/activation.sales-motion.spec.ts",
    "lib/gtm/v80/activation.validation-loop.spec.ts",
    "lib/gtm/v80/activation.entry-channel.spec.ts",
    "lib/gtm/v80/activation.builder.ts",
    "lib/gtm/v80/activation.entry.ts",
    "docs/V80-GTM-P1-ACTIVATION.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ activation module structure");
}

function testSpecs() {
  check(FIRST_CUSTOMER_ACQUISITION.length === 6, "6 first-customer targets");
  check(INITIAL_SALES_MOTION.length === 6, "6 sales motion priorities");
  check(REVENUE_VALIDATION_LOOP.length === 8, "8 validation steps");
  check(GTM_ENTRY_POINTS.length === 4, "4 entry points");
  check(isFirstCustomerAcquisitionComplete(), "first customer strategy");
  check(isInitialSalesMotionComplete(), "sales motion");
  check(isRevenueValidationLoopComplete(), "validation loop");
  check(isGtmEntryPointsComplete(), "gtm entry points");
  check(INITIAL_SALES_MOTION[0]!.channel === "tender", "tender-first priority");
  check(GTM_ENTRY_POINTS[0]!.conversionProbability === "highest", "highest entry");
  console.log("✓ first-customer, motion, validation & entry specs");
}

function testReport() {
  const ready = buildCustomerActivation({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_GTM_ACTIVATION_VERSION, "version");
  check(ready.autonomyReady, "P4 autonomy ready");
  check(ready.manifest.activationComplete, "activation complete");
  check(ready.activationReady, "activation ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertCustomerActivationPass(ready);
  check(runCustomerActivation({ deploymentId: DEPLOYMENT_ID }).activationReady, "run ready");

  console.log("✓ customer activation report");
  console.log(formatActivationSummary(ready));
  console.log("\n✅ V80 GTM P1 Real Customer Activation — verify PASS");
}

function main() {
  console.log("V80 GTM P1 Real Customer Activation Verification\n");
  checkModuleStructure();
  testSpecs();
  testReport();
}

main();

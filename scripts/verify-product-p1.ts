/**
 * Product P1 — Customer Onboarding verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../lib/commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../lib/launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../lib/operations/o5/freeze/freeze.lock";
import {
  ACTIVATION_STATES,
  CHECKLIST_ITEM_STATUSES,
  INTAKE_CHANNELS,
  ONBOARDING_STATUSES,
  ONBOARDING_STEPS,
  P1_MANAGER_STATUSES,
  P1_READINESS_VERDICTS,
  PRODUCT_P1_CUSTOMER_ONBOARDING_BASE,
  PRODUCT_P1_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  PRODUCT_P1_CUSTOMER_ONBOARDING_ID,
  PRODUCT_P1_CUSTOMER_ONBOARDING_VERSION,
  PRODUCT_P1_ONBOARDING_FREEZE_VERSION,
  WORKSPACE_STATUSES,
} from "../lib/product/p1/onboarding/onboarding.constants";
import {
  assertProductP1ReleaseGatePass,
  checkProductP1ReleaseGate,
} from "../lib/product/p1/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/p1/onboarding/onboarding.constants.ts",
    "lib/product/p1/onboarding/onboarding.types.ts",
    "lib/product/p1/onboarding/onboarding.registry.ts",
    "lib/product/p1/onboarding/onboarding.workflow.ts",
    "lib/product/p1/onboarding/onboarding.readiness.ts",
    "lib/product/p1/customer/customer.profile.ts",
    "lib/product/p1/customer/customer.intake.ts",
    "lib/product/p1/workspace/workspace.setup.ts",
    "lib/product/p1/checklist/checklist.tracker.ts",
    "lib/product/p1/activation/activation.state.ts",
    "lib/product/p1/onboarding.manager.ts",
    "lib/product/p1/verify/product.release.gate.ts",
    "lib/product/p1/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_P1_CUSTOMER_ONBOARDING_ID ===
      "enterprise-product-p1-customer-onboarding-v1",
    "p1 customer onboarding id",
  );
  check(
    PRODUCT_P1_CUSTOMER_ONBOARDING_VERSION === "product-p1-1",
    "p1 customer onboarding version",
  );
  check(
    PRODUCT_P1_CUSTOMER_ONBOARDING_FREEZE_VERSION ===
      "product-p1-customer-onboarding-freeze-1",
    "p1 customer onboarding freeze",
  );
  check(
    PRODUCT_P1_CUSTOMER_ONBOARDING_BASE === ENTERPRISE_OPERATIONS_COMPLETE_ID,
    "p1 base = operations complete",
  );
  check(
    PRODUCT_P1_ONBOARDING_FREEZE_VERSION ===
      "product-p1-customer-onboarding-freeze-1",
    "p1 freeze tag",
  );
  check(
    ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
      "enterprise-launch-readiness-complete-v1",
    "launch readiness complete preserved",
  );
  check(
    ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
      "enterprise-commercialization-complete-v1",
    "commercialization complete preserved",
  );
  check(
    ENTERPRISE_EVOLUTION_COMPLETE_ID === "enterprise-evolution-complete-v1",
    "evolution complete preserved",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete preserved",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(ONBOARDING_STATUSES.length === 5, "onboarding statuses");
  check(ONBOARDING_STEPS.length === 6, "onboarding steps");
  check(INTAKE_CHANNELS.length === 4, "intake channels");
  check(WORKSPACE_STATUSES.length === 4, "workspace statuses");
  check(CHECKLIST_ITEM_STATUSES.length === 4, "checklist item statuses");
  check(ACTIVATION_STATES.length === 4, "activation states");
  check(P1_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(P1_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductP1ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductP1ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product P1 Customer Onboarding ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

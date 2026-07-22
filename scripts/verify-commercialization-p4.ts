/**
 * Commercialization P4 — Customer Onboarding Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import { COMMERCIALIZATION_SALES_FOUNDATION_ID } from "../lib/commercialization/p1/sales/sales.constants";
import { COMMERCIALIZATION_PRODUCT_PACKAGING_ID } from "../lib/commercialization/p2/tier/tier.constants";
import {
  COMMERCIALIZATION_P3_PRICING_FREEZE_VERSION,
  COMMERCIALIZATION_PRICING_CONTRACT_ID,
} from "../lib/commercialization/p3/pricing/pricing.constants";
import {
  ACCOUNT_STATUSES,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID,
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_VERSION,
  COMMERCIALIZATION_P4_ONBOARDING_FREEZE_VERSION,
  HANDOFF_STATUSES,
  INTAKE_CHANNELS,
  ONBOARDING_MANAGER_STATUSES,
  ONBOARDING_READINESS_VERDICTS,
  ONBOARDING_STATUSES,
  ONBOARDING_STEPS,
  REQUIREMENT_PRIORITIES,
  WORKSPACE_STATUSES,
} from "../lib/commercialization/p4/onboarding/onboarding.constants";
import {
  assertCommercializationP4ReleaseGatePass,
  checkCommercializationP4ReleaseGate,
} from "../lib/commercialization/p4/verify/commercialization.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/commercialization/p4/account/account.types.ts",
    "lib/commercialization/p4/account/account.registry.ts",
    "lib/commercialization/p4/account/account.lifecycle.ts",
    "lib/commercialization/p4/onboarding/onboarding.constants.ts",
    "lib/commercialization/p4/onboarding/onboarding.types.ts",
    "lib/commercialization/p4/onboarding/onboarding.registry.ts",
    "lib/commercialization/p4/onboarding/onboarding.workflow.ts",
    "lib/commercialization/p4/workspace/workspace.types.ts",
    "lib/commercialization/p4/workspace/workspace.registry.ts",
    "lib/commercialization/p4/workspace/workspace.setup.ts",
    "lib/commercialization/p4/customer/customer.types.ts",
    "lib/commercialization/p4/customer/customer.profile.ts",
    "lib/commercialization/p4/customer/customer.requirements.ts",
    "lib/commercialization/p4/customer/customer.intake.ts",
    "lib/commercialization/p4/delivery/delivery.types.ts",
    "lib/commercialization/p4/delivery/delivery.handoff.ts",
    "lib/commercialization/p4/delivery/delivery.readiness.ts",
    "lib/commercialization/p4/onboarding.manager.ts",
    "lib/commercialization/p4/verify/commercialization.release.gate.ts",
    "lib/commercialization/p4/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID ===
      "enterprise-commercialization-p4-customer-onboarding-foundation-v1",
    "customer onboarding id",
  );
  check(
    COMMERCIALIZATION_CUSTOMER_ONBOARDING_VERSION === "commercialization-p4-1",
    "customer onboarding version",
  );
  check(
    COMMERCIALIZATION_CUSTOMER_ONBOARDING_FREEZE_VERSION ===
      "commercialization-customer-onboarding-foundation-freeze-1",
    "customer onboarding freeze",
  );
  check(
    COMMERCIALIZATION_CUSTOMER_ONBOARDING_BASE ===
      COMMERCIALIZATION_PRICING_CONTRACT_ID,
    "onboarding base = p3 pricing-contract",
  );
  check(
    COMMERCIALIZATION_PRICING_CONTRACT_ID ===
      "enterprise-commercialization-p3-pricing-contract-foundation-v1",
    "p3 freeze preserved",
  );
  check(
    COMMERCIALIZATION_P3_PRICING_FREEZE_VERSION ===
      "commercialization-p3-pricing-contract-foundation-freeze-1",
    "p3 freeze tag preserved",
  );
  check(
    COMMERCIALIZATION_PRODUCT_PACKAGING_ID ===
      "enterprise-commercialization-p2-product-packaging-foundation-v1",
    "p2 freeze preserved",
  );
  check(
    COMMERCIALIZATION_SALES_FOUNDATION_ID ===
      "enterprise-commercialization-p1-sales-foundation-v1",
    "p1 freeze preserved",
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
    COMMERCIALIZATION_P4_ONBOARDING_FREEZE_VERSION ===
      "commercialization-p4-customer-onboarding-foundation-freeze-1",
    "p4 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(ACCOUNT_STATUSES.length === 5, "account statuses");
  check(ONBOARDING_STATUSES.length === 5, "onboarding statuses");
  check(ONBOARDING_STEPS.length === 5, "onboarding steps");
  check(WORKSPACE_STATUSES.length === 4, "workspace statuses");
  check(INTAKE_CHANNELS.length === 4, "intake channels");
  check(REQUIREMENT_PRIORITIES.length === 4, "requirement priorities");
  check(HANDOFF_STATUSES.length === 4, "handoff statuses");
  check(ONBOARDING_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(ONBOARDING_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkCommercializationP4ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertCommercializationP4ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Commercialization P4 Customer Onboarding Foundation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

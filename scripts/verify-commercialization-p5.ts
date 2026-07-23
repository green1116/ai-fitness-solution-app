/**
 * Commercialization P5 — Delivery Operations Foundation verification
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
import { COMMERCIALIZATION_PRICING_CONTRACT_ID } from "../lib/commercialization/p3/pricing/pricing.constants";
import {
  COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID,
  COMMERCIALIZATION_P4_ONBOARDING_FREEZE_VERSION,
} from "../lib/commercialization/p4/onboarding/onboarding.constants";
import {
  ACCEPTANCE_VERDICTS,
  ARTIFACT_KINDS,
  ARTIFACT_STATUSES,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_FREEZE_VERSION,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_ID,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_VERSION,
  COMMERCIALIZATION_P5_DELIVERY_FREEZE_VERSION,
  DELIVERY_OPS_MANAGER_STATUSES,
  DELIVERY_OPS_READINESS_VERDICTS,
  DELIVERY_PHASES,
  DELIVERY_STATUSES,
  EXECUTION_STATUSES,
  PROJECT_STATUSES,
  QUALITY_CHECK_KINDS,
} from "../lib/commercialization/p5/delivery/delivery.constants";
import {
  assertCommercializationP5ReleaseGatePass,
  checkCommercializationP5ReleaseGate,
} from "../lib/commercialization/p5/verify/commercialization.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/commercialization/p5/project/project.types.ts",
    "lib/commercialization/p5/project/project.registry.ts",
    "lib/commercialization/p5/project/project.lifecycle.ts",
    "lib/commercialization/p5/delivery/delivery.constants.ts",
    "lib/commercialization/p5/delivery/delivery.types.ts",
    "lib/commercialization/p5/delivery/delivery.registry.ts",
    "lib/commercialization/p5/delivery/delivery.workflow.ts",
    "lib/commercialization/p5/execution/execution.types.ts",
    "lib/commercialization/p5/execution/execution.runner.ts",
    "lib/commercialization/p5/execution/execution.status.ts",
    "lib/commercialization/p5/artifact/artifact.types.ts",
    "lib/commercialization/p5/artifact/artifact.registry.ts",
    "lib/commercialization/p5/artifact/artifact.tracking.ts",
    "lib/commercialization/p5/quality/quality.types.ts",
    "lib/commercialization/p5/quality/quality.checks.ts",
    "lib/commercialization/p5/quality/quality.acceptance.ts",
    "lib/commercialization/p5/quality/quality.readiness.ts",
    "lib/commercialization/p5/delivery.manager.ts",
    "lib/commercialization/p5/verify/commercialization.release.gate.ts",
    "lib/commercialization/p5/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    COMMERCIALIZATION_DELIVERY_OPERATIONS_ID ===
      "enterprise-commercialization-p5-delivery-operations-foundation-v1",
    "delivery-ops id",
  );
  check(
    COMMERCIALIZATION_DELIVERY_OPERATIONS_VERSION === "commercialization-p5-1",
    "delivery-ops version",
  );
  check(
    COMMERCIALIZATION_DELIVERY_OPERATIONS_FREEZE_VERSION ===
      "commercialization-delivery-operations-foundation-freeze-1",
    "delivery-ops freeze",
  );
  check(
    COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE ===
      COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID,
    "delivery-ops base = p4 onboarding",
  );
  check(
    COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID ===
      "enterprise-commercialization-p4-customer-onboarding-foundation-v1",
    "p4 freeze preserved",
  );
  check(
    COMMERCIALIZATION_P4_ONBOARDING_FREEZE_VERSION ===
      "commercialization-p4-customer-onboarding-foundation-freeze-1",
    "p4 freeze tag preserved",
  );
  check(
    COMMERCIALIZATION_PRICING_CONTRACT_ID ===
      "enterprise-commercialization-p3-pricing-contract-foundation-v1",
    "p3 freeze preserved",
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
    COMMERCIALIZATION_P5_DELIVERY_FREEZE_VERSION ===
      "commercialization-p5-delivery-operations-foundation-freeze-1",
    "p5 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(PROJECT_STATUSES.length === 5, "project statuses");
  check(DELIVERY_STATUSES.length === 5, "delivery statuses");
  check(DELIVERY_PHASES.length === 5, "delivery phases");
  check(EXECUTION_STATUSES.length === 5, "execution statuses");
  check(ARTIFACT_KINDS.length === 5, "artifact kinds");
  check(ARTIFACT_STATUSES.length === 4, "artifact statuses");
  check(QUALITY_CHECK_KINDS.length === 4, "quality check kinds");
  check(ACCEPTANCE_VERDICTS.length === 3, "acceptance verdicts");
  check(DELIVERY_OPS_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(DELIVERY_OPS_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkCommercializationP5ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertCommercializationP5ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Commercialization P5 Delivery Operations Foundation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

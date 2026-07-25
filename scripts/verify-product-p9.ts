/**
 * Product P9 — Customer Success verification
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
import { PRODUCT_P8_TENDER_DELIVERY_ID } from "../lib/product/p8/tender/tender.constants";
import {
  EXPANSION_STATUSES,
  FEEDBACK_KINDS,
  HEALTH_STATUSES,
  P9_MANAGER_STATUSES,
  P9_READINESS_VERDICTS,
  PRODUCT_P9_CUSTOMER_SUCCESS_BASE,
  PRODUCT_P9_CUSTOMER_SUCCESS_FREEZE_VERSION,
  PRODUCT_P9_CUSTOMER_SUCCESS_ID,
  PRODUCT_P9_CUSTOMER_SUCCESS_VERSION,
  PRODUCT_P9_SUCCESS_FREEZE_VERSION,
  RENEWAL_STATUSES,
  SATISFACTION_LEVELS,
  SUCCESS_PLAN_STATUSES,
  USAGE_TRENDS,
} from "../lib/product/p9/customer-health/health.constants";
import {
  assertProductP9ReleaseGatePass,
  checkProductP9ReleaseGate,
} from "../lib/product/p9/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/p9/customer-health/health.constants.ts",
    "lib/product/p9/customer-health/health.types.ts",
    "lib/product/p9/customer-health/health.registry.ts",
    "lib/product/p9/customer-health/health.readiness.ts",
    "lib/product/p9/usage/usage.types.ts",
    "lib/product/p9/usage/usage.registry.ts",
    "lib/product/p9/feedback/feedback.types.ts",
    "lib/product/p9/feedback/feedback.registry.ts",
    "lib/product/p9/satisfaction/satisfaction.types.ts",
    "lib/product/p9/satisfaction/satisfaction.registry.ts",
    "lib/product/p9/success-plan/plan.types.ts",
    "lib/product/p9/success-plan/plan.registry.ts",
    "lib/product/p9/renewal/renewal.types.ts",
    "lib/product/p9/renewal/renewal.registry.ts",
    "lib/product/p9/expansion/expansion.types.ts",
    "lib/product/p9/expansion/expansion.registry.ts",
    "lib/product/p9/customer-success.manager.ts",
    "lib/product/p9/verify/product.release.gate.ts",
    "lib/product/p9/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_P9_CUSTOMER_SUCCESS_ID ===
      "enterprise-product-p9-customer-success-v1",
    "p9 customer success id",
  );
  check(
    PRODUCT_P9_CUSTOMER_SUCCESS_VERSION === "product-p9-1",
    "p9 customer success version",
  );
  check(
    PRODUCT_P9_CUSTOMER_SUCCESS_FREEZE_VERSION ===
      "product-p9-customer-success-freeze-1",
    "p9 customer success freeze",
  );
  check(
    PRODUCT_P9_CUSTOMER_SUCCESS_BASE === PRODUCT_P8_TENDER_DELIVERY_ID,
    "p9 base = p8 tender delivery",
  );
  check(
    PRODUCT_P9_SUCCESS_FREEZE_VERSION ===
      "product-p9-customer-success-freeze-1",
    "p9 freeze tag",
  );
  check(
    ENTERPRISE_OPERATIONS_COMPLETE_ID === "enterprise-operations-complete-v1",
    "operations complete preserved",
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
  check(HEALTH_STATUSES.length === 5, "health statuses");
  check(USAGE_TRENDS.length === 5, "usage trends");
  check(FEEDBACK_KINDS.length === 5, "feedback kinds");
  check(SATISFACTION_LEVELS.length === 5, "satisfaction levels");
  check(SUCCESS_PLAN_STATUSES.length === 5, "success plan statuses");
  check(RENEWAL_STATUSES.length === 5, "renewal statuses");
  check(EXPANSION_STATUSES.length === 5, "expansion statuses");
  check(P9_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(P9_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductP9ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductP9ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product P9 Customer Success ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

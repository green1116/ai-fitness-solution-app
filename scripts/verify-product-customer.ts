/**
 * Product Customer — Customer Foundation verification
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
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../lib/product/complete/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../lib/product/auth/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_BILLING_BASELINE_ID } from "../lib/product/billing-baseline/freeze/freeze.lock";
import { PRODUCT_BILLING_AUDIT_ID } from "../lib/product/billing-audit/traceability/traceability.constants";
import { PRODUCT_BILLING_FOUNDATION_ID } from "../lib/product/billing/foundation/foundation.constants";
import {
  CUSTOMER_KINDS,
  CUSTOMER_MANAGER_STATUSES,
  CUSTOMER_READINESS_VERDICTS,
  CUSTOMER_SEGMENTS,
  CUSTOMER_STATUSES,
  PRODUCT_CUSTOMER_FOUNDATION_BASE,
  PRODUCT_CUSTOMER_FOUNDATION_FREEZE_VERSION,
  PRODUCT_CUSTOMER_FOUNDATION_ID,
  PRODUCT_CUSTOMER_FOUNDATION_VERSION,
  PRODUCT_CUSTOMER_FREEZE_VERSION,
  RELATIONSHIP_KINDS,
} from "../lib/product/customer/foundation/foundation.constants";
import {
  assertProductCustomerReleaseGatePass,
  checkProductCustomerReleaseGate,
} from "../lib/product/customer/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/customer/foundation/foundation.constants.ts",
    "lib/product/customer/foundation/foundation.types.ts",
    "lib/product/customer/foundation/foundation.readiness.ts",
    "lib/product/customer/profile/profile.types.ts",
    "lib/product/customer/profile/profile.registry.ts",
    "lib/product/customer/relationship/relationship.types.ts",
    "lib/product/customer/relationship/relationship.registry.ts",
    "lib/product/customer/segment/segment.types.ts",
    "lib/product/customer/segment/segment.registry.ts",
    "lib/product/customer/lifecycle/lifecycle.types.ts",
    "lib/product/customer/lifecycle/lifecycle.registry.ts",
    "lib/product/customer/customer.manager.ts",
    "lib/product/customer/verify/product.release.gate.ts",
    "lib/product/customer/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_CUSTOMER_FOUNDATION_ID ===
      "enterprise-product-customer-foundation-v1",
    "customer foundation id",
  );
  check(
    PRODUCT_CUSTOMER_FOUNDATION_VERSION === "product-customer-1",
    "customer foundation version",
  );
  check(
    PRODUCT_CUSTOMER_FOUNDATION_FREEZE_VERSION ===
      "product-customer-foundation-freeze-1",
    "customer foundation freeze",
  );
  check(
    PRODUCT_CUSTOMER_FOUNDATION_BASE ===
      ENTERPRISE_PRODUCT_BILLING_BASELINE_ID,
    "customer base = billing baseline",
  );
  check(
    PRODUCT_CUSTOMER_FREEZE_VERSION ===
      "product-customer-foundation-freeze-1",
    "customer freeze tag",
  );
  check(
    ENTERPRISE_PRODUCT_BILLING_BASELINE_ID ===
      "enterprise-product-billing-baseline-v1",
    "billing baseline preserved",
  );
  check(
    PRODUCT_BILLING_AUDIT_ID === "enterprise-product-billing-audit-v1",
    "billing audit preserved",
  );
  check(
    PRODUCT_BILLING_FOUNDATION_ID ===
      "enterprise-product-billing-foundation-v1",
    "billing foundation preserved",
  );
  check(
    ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
      "enterprise-product-auth-baseline-v1",
    "auth baseline preserved",
  );
  check(
    ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1",
    "product complete preserved",
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
  check(CUSTOMER_KINDS.length === 3, "customer kinds");
  check(CUSTOMER_STATUSES.length === 4, "customer statuses");
  check(CUSTOMER_SEGMENTS.length === 3, "customer segments");
  check(RELATIONSHIP_KINDS.length === 3, "relationship kinds");
  check(CUSTOMER_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(CUSTOMER_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductCustomerReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductCustomerReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Customer Foundation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

/**
 * Product Customer — Governance Freeze verification
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
import { PRODUCT_CRM_AUDIT_ID } from "../lib/product/crm-audit/traceability/traceability.constants";
import { PRODUCT_CUSTOMER_ACTIVITY_ID } from "../lib/product/customer-activity/activity/activity.constants";
import { PRODUCT_CUSTOMER_FOUNDATION_ID } from "../lib/product/customer/foundation/foundation.constants";
import { PRODUCT_CUSTOMER_INSIGHT_ID } from "../lib/product/customer-insight/insight/insight.constants";
import { PRODUCT_CUSTOMER_PROFILE_ID } from "../lib/product/customer-profile/profile/profile.constants";
import { PRODUCT_ORGANIZATION_MANAGEMENT_ID } from "../lib/product/organization/management/management.constants";
import { PRODUCT_RELATIONSHIP_MANAGEMENT_ID } from "../lib/product/relationship/management/management.constants";
import {
  ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID,
  isProductCustomerFreezeLockIntact,
  PRODUCT_CUSTOMER_BASELINE_FREEZE_BASE,
  PRODUCT_CUSTOMER_BASELINE_FREEZE_VERSION,
  PRODUCT_CUSTOMER_BASELINE_ID,
  PRODUCT_CUSTOMER_COMPONENT_LOCK,
  PRODUCT_CUSTOMER_FREEZE_LOCK,
} from "../lib/product/customer-baseline/freeze/freeze.lock";
import {
  assertProductCustomerBaselineReleaseGatePass,
  checkProductCustomerBaselineReleaseGate,
} from "../lib/product/customer-baseline/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/customer-baseline/freeze/freeze.lock.ts",
    "lib/product/customer-baseline/verify/product.release.gate.ts",
    "lib/product/customer-baseline/index.ts",
    "lib/product/customer/index.ts",
    "lib/product/organization/index.ts",
    "lib/product/customer-profile/index.ts",
    "lib/product/relationship/index.ts",
    "lib/product/customer-activity/index.ts",
    "lib/product/customer-insight/index.ts",
    "lib/product/crm-audit/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_CUSTOMER_BASELINE_ID ===
      "enterprise-product-customer-baseline-v1",
    "customer baseline id",
  );
  check(
    ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID === PRODUCT_CUSTOMER_BASELINE_ID,
    "customer baseline alias",
  );
  check(
    PRODUCT_CUSTOMER_BASELINE_FREEZE_VERSION ===
      "product-customer-baseline-freeze-1",
    "customer freeze version",
  );
  check(
    PRODUCT_CUSTOMER_BASELINE_FREEZE_BASE === PRODUCT_CRM_AUDIT_ID,
    "customer freeze base = crm audit",
  );
  check(
    isProductCustomerFreezeLockIntact(PRODUCT_CUSTOMER_FREEZE_LOCK),
    "customer freeze lock intact",
  );
  check(PRODUCT_CUSTOMER_COMPONENT_LOCK.length === 8, "customer components");
  check(
    PRODUCT_CUSTOMER_FOUNDATION_ID ===
      "enterprise-product-customer-foundation-v1",
    "customer foundation preserved",
  );
  check(
    PRODUCT_ORGANIZATION_MANAGEMENT_ID ===
      "enterprise-product-organization-management-v1",
    "organization preserved",
  );
  check(
    PRODUCT_CUSTOMER_PROFILE_ID ===
      "enterprise-product-customer-profile-v1",
    "customer profile preserved",
  );
  check(
    PRODUCT_RELATIONSHIP_MANAGEMENT_ID ===
      "enterprise-product-relationship-management-v1",
    "relationship preserved",
  );
  check(
    PRODUCT_CUSTOMER_ACTIVITY_ID ===
      "enterprise-product-customer-activity-v1",
    "customer activity preserved",
  );
  check(
    PRODUCT_CUSTOMER_INSIGHT_ID ===
      "enterprise-product-customer-insight-v1",
    "customer insight preserved",
  );
  check(
    PRODUCT_CRM_AUDIT_ID === "enterprise-product-crm-audit-v1",
    "crm audit preserved",
  );
  check(
    ENTERPRISE_PRODUCT_BILLING_BASELINE_ID ===
      "enterprise-product-billing-baseline-v1",
    "billing baseline preserved",
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
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductCustomerBaselineReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductCustomerBaselineReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Customer Governance Freeze ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

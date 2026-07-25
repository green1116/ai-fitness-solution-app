/**
 * Product Customer Profile — verification
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
import { PRODUCT_CUSTOMER_FOUNDATION_ID } from "../lib/product/customer/foundation/foundation.constants";
import { PRODUCT_ORGANIZATION_MANAGEMENT_ID } from "../lib/product/organization/management/management.constants";
import {
  ATTRIBUTE_KINDS,
  CONTACT_KINDS,
  CUSTOMER_PROFILE_MANAGER_STATUSES,
  CUSTOMER_PROFILE_READINESS_VERDICTS,
  PREFERENCE_KINDS,
  PRODUCT_CUSTOMER_PROFILE_BASE,
  PRODUCT_CUSTOMER_PROFILE_FREEZE_VERSION,
  PRODUCT_CUSTOMER_PROFILE_ID,
  PRODUCT_CUSTOMER_PROFILE_LAYER_FREEZE_VERSION,
  PRODUCT_CUSTOMER_PROFILE_VERSION,
  PROFILE_STATUSES,
} from "../lib/product/customer-profile/profile/profile.constants";
import {
  assertProductCustomerProfileReleaseGatePass,
  checkProductCustomerProfileReleaseGate,
} from "../lib/product/customer-profile/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/customer-profile/profile/profile.constants.ts",
    "lib/product/customer-profile/profile/profile.types.ts",
    "lib/product/customer-profile/profile/profile.readiness.ts",
    "lib/product/customer-profile/identity/identity.types.ts",
    "lib/product/customer-profile/identity/identity.registry.ts",
    "lib/product/customer-profile/contact/contact.types.ts",
    "lib/product/customer-profile/contact/contact.registry.ts",
    "lib/product/customer-profile/preference/preference.types.ts",
    "lib/product/customer-profile/preference/preference.registry.ts",
    "lib/product/customer-profile/attribute/attribute.types.ts",
    "lib/product/customer-profile/attribute/attribute.registry.ts",
    "lib/product/customer-profile/customer-profile.manager.ts",
    "lib/product/customer-profile/verify/product.release.gate.ts",
    "lib/product/customer-profile/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_CUSTOMER_PROFILE_ID ===
      "enterprise-product-customer-profile-v1",
    "customer profile id",
  );
  check(
    PRODUCT_CUSTOMER_PROFILE_VERSION === "product-customer-profile-1",
    "customer profile version",
  );
  check(
    PRODUCT_CUSTOMER_PROFILE_FREEZE_VERSION ===
      "product-customer-profile-freeze-1",
    "customer profile freeze",
  );
  check(
    PRODUCT_CUSTOMER_PROFILE_BASE === PRODUCT_ORGANIZATION_MANAGEMENT_ID,
    "customer profile base = organization management",
  );
  check(
    PRODUCT_CUSTOMER_PROFILE_LAYER_FREEZE_VERSION ===
      "product-customer-profile-freeze-1",
    "customer profile layer freeze",
  );
  check(
    PRODUCT_ORGANIZATION_MANAGEMENT_ID ===
      "enterprise-product-organization-management-v1",
    "organization management preserved",
  );
  check(
    PRODUCT_CUSTOMER_FOUNDATION_ID ===
      "enterprise-product-customer-foundation-v1",
    "customer foundation preserved",
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
  check(PROFILE_STATUSES.length === 3, "profile statuses");
  check(CONTACT_KINDS.length === 3, "contact kinds");
  check(PREFERENCE_KINDS.length === 3, "preference kinds");
  check(ATTRIBUTE_KINDS.length === 3, "attribute kinds");
  check(CUSTOMER_PROFILE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(CUSTOMER_PROFILE_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductCustomerProfileReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductCustomerProfileReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Customer Profile ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

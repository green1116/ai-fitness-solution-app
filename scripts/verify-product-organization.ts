/**
 * Product Organization — Organization Management verification
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
import {
  HIERARCHY_KINDS,
  MEMBERSHIP_STATUSES,
  ORG_KINDS,
  ORG_ROLES,
  ORG_STATUSES,
  ORGANIZATION_MANAGER_STATUSES,
  ORGANIZATION_READINESS_VERDICTS,
  PRODUCT_ORGANIZATION_FREEZE_VERSION,
  PRODUCT_ORGANIZATION_MANAGEMENT_BASE,
  PRODUCT_ORGANIZATION_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_ORGANIZATION_MANAGEMENT_ID,
  PRODUCT_ORGANIZATION_MANAGEMENT_VERSION,
} from "../lib/product/organization/management/management.constants";
import {
  assertProductOrganizationReleaseGatePass,
  checkProductOrganizationReleaseGate,
} from "../lib/product/organization/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/organization/management/management.constants.ts",
    "lib/product/organization/management/management.types.ts",
    "lib/product/organization/management/management.readiness.ts",
    "lib/product/organization/unit/unit.types.ts",
    "lib/product/organization/unit/unit.registry.ts",
    "lib/product/organization/membership/membership.types.ts",
    "lib/product/organization/membership/membership.registry.ts",
    "lib/product/organization/hierarchy/hierarchy.types.ts",
    "lib/product/organization/hierarchy/hierarchy.registry.ts",
    "lib/product/organization/role/role.types.ts",
    "lib/product/organization/role/role.registry.ts",
    "lib/product/organization/organization.manager.ts",
    "lib/product/organization/verify/product.release.gate.ts",
    "lib/product/organization/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_ORGANIZATION_MANAGEMENT_ID ===
      "enterprise-product-organization-management-v1",
    "organization management id",
  );
  check(
    PRODUCT_ORGANIZATION_MANAGEMENT_VERSION === "product-organization-1",
    "organization management version",
  );
  check(
    PRODUCT_ORGANIZATION_MANAGEMENT_FREEZE_VERSION ===
      "product-organization-management-freeze-1",
    "organization management freeze",
  );
  check(
    PRODUCT_ORGANIZATION_MANAGEMENT_BASE === PRODUCT_CUSTOMER_FOUNDATION_ID,
    "organization base = customer foundation",
  );
  check(
    PRODUCT_ORGANIZATION_FREEZE_VERSION ===
      "product-organization-management-freeze-1",
    "organization freeze tag",
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
  check(ORG_KINDS.length === 3, "org kinds");
  check(ORG_STATUSES.length === 3, "org statuses");
  check(MEMBERSHIP_STATUSES.length === 3, "membership statuses");
  check(ORG_ROLES.length === 3, "org roles");
  check(HIERARCHY_KINDS.length === 2, "hierarchy kinds");
  check(ORGANIZATION_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(ORGANIZATION_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductOrganizationReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductOrganizationReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Organization Management ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

/**
 * Product Relationship — Relationship Management verification
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
import { PRODUCT_CUSTOMER_PROFILE_ID } from "../lib/product/customer-profile/profile/profile.constants";
import { PRODUCT_ORGANIZATION_MANAGEMENT_ID } from "../lib/product/organization/management/management.constants";
import {
  CLASSIFICATION_TIERS,
  PARTY_ROLES,
  PRODUCT_RELATIONSHIP_FREEZE_VERSION,
  PRODUCT_RELATIONSHIP_MANAGEMENT_BASE,
  PRODUCT_RELATIONSHIP_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_RELATIONSHIP_MANAGEMENT_ID,
  PRODUCT_RELATIONSHIP_MANAGEMENT_VERSION,
  RELATIONSHIP_KINDS,
  RELATIONSHIP_MANAGER_STATUSES,
  RELATIONSHIP_READINESS_VERDICTS,
  RELATIONSHIP_STATUSES,
} from "../lib/product/relationship/management/management.constants";
import {
  assertProductRelationshipReleaseGatePass,
  checkProductRelationshipReleaseGate,
} from "../lib/product/relationship/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/relationship/management/management.constants.ts",
    "lib/product/relationship/management/management.types.ts",
    "lib/product/relationship/management/management.readiness.ts",
    "lib/product/relationship/bond/bond.types.ts",
    "lib/product/relationship/bond/bond.registry.ts",
    "lib/product/relationship/party/party.types.ts",
    "lib/product/relationship/party/party.registry.ts",
    "lib/product/relationship/classification/classification.types.ts",
    "lib/product/relationship/classification/classification.registry.ts",
    "lib/product/relationship/lifecycle/lifecycle.types.ts",
    "lib/product/relationship/lifecycle/lifecycle.registry.ts",
    "lib/product/relationship/relationship.manager.ts",
    "lib/product/relationship/verify/product.release.gate.ts",
    "lib/product/relationship/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_RELATIONSHIP_MANAGEMENT_ID ===
      "enterprise-product-relationship-management-v1",
    "relationship management id",
  );
  check(
    PRODUCT_RELATIONSHIP_MANAGEMENT_VERSION === "product-relationship-1",
    "relationship management version",
  );
  check(
    PRODUCT_RELATIONSHIP_MANAGEMENT_FREEZE_VERSION ===
      "product-relationship-management-freeze-1",
    "relationship management freeze",
  );
  check(
    PRODUCT_RELATIONSHIP_MANAGEMENT_BASE === PRODUCT_CUSTOMER_PROFILE_ID,
    "relationship base = customer profile",
  );
  check(
    PRODUCT_RELATIONSHIP_FREEZE_VERSION ===
      "product-relationship-management-freeze-1",
    "relationship freeze tag",
  );
  check(
    PRODUCT_CUSTOMER_PROFILE_ID ===
      "enterprise-product-customer-profile-v1",
    "customer profile preserved",
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
  check(RELATIONSHIP_KINDS.length === 3, "relationship kinds");
  check(RELATIONSHIP_STATUSES.length === 4, "relationship statuses");
  check(PARTY_ROLES.length === 3, "party roles");
  check(CLASSIFICATION_TIERS.length === 3, "classification tiers");
  check(RELATIONSHIP_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(RELATIONSHIP_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductRelationshipReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductRelationshipReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Relationship Management ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

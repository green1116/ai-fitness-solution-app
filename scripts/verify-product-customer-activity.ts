/**
 * Product Customer Activity — verification
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
import { PRODUCT_RELATIONSHIP_MANAGEMENT_ID } from "../lib/product/relationship/management/management.constants";
import {
  ACTIVITY_EVENT_KINDS,
  ACTIVITY_SESSION_STATUSES,
  CUSTOMER_ACTIVITY_MANAGER_STATUSES,
  CUSTOMER_ACTIVITY_READINESS_VERDICTS,
  ENGAGEMENT_LEVELS,
  PRODUCT_CUSTOMER_ACTIVITY_BASE,
  PRODUCT_CUSTOMER_ACTIVITY_FREEZE_VERSION,
  PRODUCT_CUSTOMER_ACTIVITY_ID,
  PRODUCT_CUSTOMER_ACTIVITY_LAYER_FREEZE_VERSION,
  PRODUCT_CUSTOMER_ACTIVITY_VERSION,
  TIMELINE_ENTRY_KINDS,
} from "../lib/product/customer-activity/activity/activity.constants";
import {
  assertProductCustomerActivityReleaseGatePass,
  checkProductCustomerActivityReleaseGate,
} from "../lib/product/customer-activity/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/customer-activity/activity/activity.constants.ts",
    "lib/product/customer-activity/activity/activity.types.ts",
    "lib/product/customer-activity/activity/activity.readiness.ts",
    "lib/product/customer-activity/event/event.types.ts",
    "lib/product/customer-activity/event/event.registry.ts",
    "lib/product/customer-activity/session/session.types.ts",
    "lib/product/customer-activity/session/session.registry.ts",
    "lib/product/customer-activity/engagement/engagement.types.ts",
    "lib/product/customer-activity/engagement/engagement.registry.ts",
    "lib/product/customer-activity/timeline/timeline.types.ts",
    "lib/product/customer-activity/timeline/timeline.registry.ts",
    "lib/product/customer-activity/customer-activity.manager.ts",
    "lib/product/customer-activity/verify/product.release.gate.ts",
    "lib/product/customer-activity/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_CUSTOMER_ACTIVITY_ID ===
      "enterprise-product-customer-activity-v1",
    "customer activity id",
  );
  check(
    PRODUCT_CUSTOMER_ACTIVITY_VERSION === "product-customer-activity-1",
    "customer activity version",
  );
  check(
    PRODUCT_CUSTOMER_ACTIVITY_FREEZE_VERSION ===
      "product-customer-activity-freeze-1",
    "customer activity freeze",
  );
  check(
    PRODUCT_CUSTOMER_ACTIVITY_BASE === PRODUCT_RELATIONSHIP_MANAGEMENT_ID,
    "customer activity base = relationship management",
  );
  check(
    PRODUCT_CUSTOMER_ACTIVITY_LAYER_FREEZE_VERSION ===
      "product-customer-activity-freeze-1",
    "customer activity layer freeze",
  );
  check(
    PRODUCT_RELATIONSHIP_MANAGEMENT_ID ===
      "enterprise-product-relationship-management-v1",
    "relationship management preserved",
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
  check(ACTIVITY_EVENT_KINDS.length === 4, "activity event kinds");
  check(ACTIVITY_SESSION_STATUSES.length === 3, "session statuses");
  check(ENGAGEMENT_LEVELS.length === 3, "engagement levels");
  check(TIMELINE_ENTRY_KINDS.length === 3, "timeline entry kinds");
  check(CUSTOMER_ACTIVITY_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(CUSTOMER_ACTIVITY_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductCustomerActivityReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductCustomerActivityReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Customer Activity ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

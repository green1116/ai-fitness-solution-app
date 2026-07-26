/**
 * Product Notification — Governance Freeze verification (M06-P8)
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
import { ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID } from "../lib/product/customer-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID } from "../lib/product/analytics-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID } from "../lib/product/admin-baseline/freeze/freeze.lock";
import { PRODUCT_CHANNEL_MANAGEMENT_ID } from "../lib/product/channel/management/management.constants";
import { PRODUCT_DELIVERY_ENGINE_ID } from "../lib/product/delivery/management/management.constants";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../lib/product/notification/foundation/foundation.constants";
import { PRODUCT_NOTIFICATION_AUDIT_ID } from "../lib/product/notification-audit/management/management.constants";
import { PRODUCT_TEMPLATE_MANAGEMENT_ID } from "../lib/product/notification-template/management/management.constants";
import { PRODUCT_PREFERENCE_MANAGEMENT_ID } from "../lib/product/preference/management/management.constants";
import { PRODUCT_ROUTING_ENGINE_ID } from "../lib/product/routing/management/management.constants";
import {
  ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID,
  isProductNotificationFreezeLockIntact,
  PRODUCT_NOTIFICATION_BASELINE_FREEZE_BASE,
  PRODUCT_NOTIFICATION_BASELINE_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_BASELINE_ID,
  PRODUCT_NOTIFICATION_COMPONENT_LOCK,
  PRODUCT_NOTIFICATION_FREEZE_LOCK,
} from "../lib/product/notification-baseline/freeze/freeze.lock";
import {
  isProductNotificationImmutableManifestIntact,
  PRODUCT_NOTIFICATION_IMMUTABLE_MANIFEST,
} from "../lib/product/notification-baseline/freeze/immutable.manifest";
import {
  isProductNotificationRollbackSnapshotIntact,
  PRODUCT_NOTIFICATION_ROLLBACK_SNAPSHOT,
} from "../lib/product/notification-baseline/freeze/rollback.snapshot";
import {
  assertProductNotificationBaselineReleaseGatePass,
  checkProductNotificationBaselineReleaseGate,
} from "../lib/product/notification-baseline/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/notification-baseline/freeze/freeze.lock.ts",
    "lib/product/notification-baseline/freeze/immutable.manifest.ts",
    "lib/product/notification-baseline/freeze/rollback.snapshot.ts",
    "lib/product/notification-baseline/verify/product.release.gate.ts",
    "lib/product/notification-baseline/index.ts",
    "lib/product/notification/index.ts",
    "lib/product/notification-template/index.ts",
    "lib/product/channel/index.ts",
    "lib/product/delivery/index.ts",
    "lib/product/preference/index.ts",
    "lib/product/routing/index.ts",
    "lib/product/notification-audit/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_NOTIFICATION_BASELINE_ID ===
      "enterprise-product-notification-baseline-v1",
    "notification baseline id",
  );
  check(
    ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID ===
      PRODUCT_NOTIFICATION_BASELINE_ID,
    "notification baseline alias",
  );
  check(
    PRODUCT_NOTIFICATION_BASELINE_FREEZE_VERSION ===
      "product-notification-baseline-freeze-1",
    "notification freeze version",
  );
  check(
    PRODUCT_NOTIFICATION_BASELINE_FREEZE_BASE === PRODUCT_NOTIFICATION_AUDIT_ID,
    "freeze base = notification audit",
  );
  check(
    PRODUCT_NOTIFICATION_FOUNDATION_ID ===
      "enterprise-product-notification-foundation-v1",
    "foundation preserved",
  );
  check(
    PRODUCT_TEMPLATE_MANAGEMENT_ID ===
      "enterprise-product-template-management-v1",
    "template preserved",
  );
  check(
    PRODUCT_CHANNEL_MANAGEMENT_ID ===
      "enterprise-product-channel-management-v1",
    "channel preserved",
  );
  check(
    PRODUCT_DELIVERY_ENGINE_ID === "enterprise-product-delivery-engine-v1",
    "delivery preserved",
  );
  check(
    PRODUCT_PREFERENCE_MANAGEMENT_ID ===
      "enterprise-product-preference-management-v1",
    "preference preserved",
  );
  check(
    PRODUCT_ROUTING_ENGINE_ID === "enterprise-product-routing-engine-v1",
    "routing preserved",
  );
  check(
    PRODUCT_NOTIFICATION_AUDIT_ID ===
      "enterprise-product-notification-audit-v1",
    "audit preserved",
  );
  check(
    ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID ===
      "enterprise-product-admin-baseline-v1",
    "admin baseline preserved",
  );
  check(
    ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID ===
      "enterprise-product-analytics-baseline-v1",
    "analytics baseline preserved",
  );
  check(
    ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID ===
      "enterprise-product-customer-baseline-v1",
    "customer baseline preserved",
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
    "launch readiness preserved",
  );
  check(
    ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
      "enterprise-commercialization-complete-v1",
    "commercialization preserved",
  );
  check(
    ENTERPRISE_EVOLUTION_COMPLETE_ID === "enterprise-evolution-complete-v1",
    "evolution preserved",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete preserved",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 preserved",
  );
  check(PRODUCT_NOTIFICATION_COMPONENT_LOCK.length === 8, "components");
  check(isProductNotificationFreezeLockIntact(), "freeze lock intact");
  check(
    isProductNotificationImmutableManifestIntact(
      PRODUCT_NOTIFICATION_IMMUTABLE_MANIFEST,
    ),
    "immutable manifest intact",
  );
  check(
    isProductNotificationRollbackSnapshotIntact(
      PRODUCT_NOTIFICATION_ROLLBACK_SNAPSHOT,
    ),
    "rollback snapshot intact",
  );
  check(PRODUCT_NOTIFICATION_FREEZE_LOCK.readOnly === true, "read-only");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductNotificationBaselineReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductNotificationBaselineReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Notification Governance Freeze (M06-P8) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

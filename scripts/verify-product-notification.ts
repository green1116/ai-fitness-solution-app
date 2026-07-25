/**
 * Product Notification — Notification Foundation verification
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
import { PRODUCT_ADMIN_AUDIT_ID } from "../lib/product/admin-audit/traceability/traceability.constants";
import { PRODUCT_ADMIN_FOUNDATION_ID } from "../lib/product/admin/foundation/foundation.constants";
import {
  NOTIFICATION_CHANNEL_KINDS,
  NOTIFICATION_CHANNEL_STATUSES,
  NOTIFICATION_DELIVERY_STATUSES,
  NOTIFICATION_MANAGER_STATUSES,
  NOTIFICATION_MESSAGE_PRIORITIES,
  NOTIFICATION_READINESS_VERDICTS,
  NOTIFICATION_TEMPLATE_KINDS,
  PRODUCT_NOTIFICATION_FOUNDATION_BASE,
  PRODUCT_NOTIFICATION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_FOUNDATION_ID,
  PRODUCT_NOTIFICATION_FOUNDATION_VERSION,
  PRODUCT_NOTIFICATION_FREEZE_VERSION,
} from "../lib/product/notification/foundation/foundation.constants";
import {
  assertProductNotificationReleaseGatePass,
  checkProductNotificationReleaseGate,
} from "../lib/product/notification/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/notification/foundation/foundation.constants.ts",
    "lib/product/notification/foundation/foundation.types.ts",
    "lib/product/notification/foundation/foundation.readiness.ts",
    "lib/product/notification/channel/channel.types.ts",
    "lib/product/notification/channel/channel.registry.ts",
    "lib/product/notification/template/template.types.ts",
    "lib/product/notification/template/template.registry.ts",
    "lib/product/notification/message/message.types.ts",
    "lib/product/notification/message/message.registry.ts",
    "lib/product/notification/delivery/delivery.types.ts",
    "lib/product/notification/delivery/delivery.registry.ts",
    "lib/product/notification/notification.manager.ts",
    "lib/product/notification/verify/product.release.gate.ts",
    "lib/product/notification/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_NOTIFICATION_FOUNDATION_ID ===
      "enterprise-product-notification-foundation-v1",
    "notification foundation id",
  );
  check(
    PRODUCT_NOTIFICATION_FOUNDATION_VERSION === "product-notification-1",
    "notification foundation version",
  );
  check(
    PRODUCT_NOTIFICATION_FOUNDATION_FREEZE_VERSION ===
      "product-notification-foundation-freeze-1",
    "notification foundation freeze",
  );
  check(
    PRODUCT_NOTIFICATION_FOUNDATION_BASE ===
      ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID,
    "notification base = admin baseline",
  );
  check(
    PRODUCT_NOTIFICATION_FREEZE_VERSION ===
      "product-notification-foundation-freeze-1",
    "notification freeze tag",
  );
  check(
    ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID ===
      "enterprise-product-admin-baseline-v1",
    "admin baseline preserved",
  );
  check(
    PRODUCT_ADMIN_AUDIT_ID === "enterprise-product-admin-audit-v1",
    "admin audit preserved",
  );
  check(
    PRODUCT_ADMIN_FOUNDATION_ID ===
      "enterprise-product-admin-foundation-v1",
    "admin foundation preserved",
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
  check(NOTIFICATION_CHANNEL_KINDS.length === 4, "channel kinds");
  check(NOTIFICATION_CHANNEL_STATUSES.length === 3, "channel statuses");
  check(NOTIFICATION_TEMPLATE_KINDS.length === 3, "template kinds");
  check(NOTIFICATION_MESSAGE_PRIORITIES.length === 3, "message priorities");
  check(NOTIFICATION_DELIVERY_STATUSES.length === 4, "delivery statuses");
  check(NOTIFICATION_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(NOTIFICATION_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductNotificationReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductNotificationReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Notification Foundation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

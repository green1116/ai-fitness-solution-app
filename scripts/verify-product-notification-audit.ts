/**
 * Product Notification Audit — M06-P7 verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_CHANNEL_MANAGEMENT_ID } from "../lib/product/channel/management/management.constants";
import { PRODUCT_DELIVERY_ENGINE_ID } from "../lib/product/delivery/management/management.constants";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../lib/product/notification/foundation/foundation.constants";
import { PRODUCT_TEMPLATE_MANAGEMENT_ID } from "../lib/product/notification-template/management/management.constants";
import { PRODUCT_PREFERENCE_MANAGEMENT_ID } from "../lib/product/preference/management/management.constants";
import { PRODUCT_ROUTING_ENGINE_ID } from "../lib/product/routing/management/management.constants";
import {
  NOTIFICATION_AUDIT_CATEGORIES,
  NOTIFICATION_AUDIT_INTEGRITY_VERDICTS,
  NOTIFICATION_AUDIT_MANAGER_STATUSES,
  NOTIFICATION_AUDIT_READINESS_VERDICTS,
  NOTIFICATION_AUDIT_SEVERITIES,
  NOTIFICATION_AUDIT_TRAIL_STATUSES,
  PRODUCT_NOTIFICATION_AUDIT_BASE,
  PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION_TAG,
  PRODUCT_NOTIFICATION_AUDIT_ID,
  PRODUCT_NOTIFICATION_AUDIT_VERSION,
} from "../lib/product/notification-audit/management/management.constants";
import {
  assertProductNotificationAuditReleaseGatePass,
  checkProductNotificationAuditReleaseGate,
} from "../lib/product/notification-audit/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/notification-audit/management/management.constants.ts",
    "lib/product/notification-audit/management/management.types.ts",
    "lib/product/notification-audit/management/management.readiness.ts",
    "lib/product/notification-audit/event/event.types.ts",
    "lib/product/notification-audit/event/event.registry.ts",
    "lib/product/notification-audit/trail/trail.types.ts",
    "lib/product/notification-audit/trail/trail.registry.ts",
    "lib/product/notification-audit/integrity/integrity.types.ts",
    "lib/product/notification-audit/integrity/integrity.registry.ts",
    "lib/product/notification-audit/query/query.types.ts",
    "lib/product/notification-audit/query/query.registry.ts",
    "lib/product/notification-audit/manifest/manifest.registry.ts",
    "lib/product/notification-audit/notification-audit.manager.ts",
    "lib/product/notification-audit/verify/product.release.gate.ts",
    "lib/product/notification-audit/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_NOTIFICATION_AUDIT_ID ===
      "enterprise-product-notification-audit-v1",
    "notification audit id",
  );
  check(
    PRODUCT_NOTIFICATION_AUDIT_VERSION === "product-notification-audit-1",
    "notification audit version",
  );
  check(
    PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION ===
      "product-notification-audit-freeze-1",
    "notification audit freeze",
  );
  check(
    PRODUCT_NOTIFICATION_AUDIT_BASE === PRODUCT_ROUTING_ENGINE_ID,
    "notification audit base = routing engine",
  );
  check(
    PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION_TAG ===
      "product-notification-audit-freeze-1",
    "notification audit freeze tag",
  );
  check(
    PRODUCT_ROUTING_ENGINE_ID === "enterprise-product-routing-engine-v1",
    "routing engine preserved",
  );
  check(
    PRODUCT_PREFERENCE_MANAGEMENT_ID ===
      "enterprise-product-preference-management-v1",
    "preference management preserved",
  );
  check(
    PRODUCT_DELIVERY_ENGINE_ID === "enterprise-product-delivery-engine-v1",
    "delivery engine preserved",
  );
  check(
    PRODUCT_CHANNEL_MANAGEMENT_ID ===
      "enterprise-product-channel-management-v1",
    "channel management preserved",
  );
  check(
    PRODUCT_TEMPLATE_MANAGEMENT_ID ===
      "enterprise-product-template-management-v1",
    "template management preserved",
  );
  check(
    PRODUCT_NOTIFICATION_FOUNDATION_ID ===
      "enterprise-product-notification-foundation-v1",
    "notification foundation preserved",
  );
  check(NOTIFICATION_AUDIT_CATEGORIES.length === 6, "categories");
  check(NOTIFICATION_AUDIT_SEVERITIES.length === 3, "severities");
  check(NOTIFICATION_AUDIT_TRAIL_STATUSES.length === 2, "trail statuses");
  check(NOTIFICATION_AUDIT_INTEGRITY_VERDICTS.length === 3, "integrity");
  check(NOTIFICATION_AUDIT_READINESS_VERDICTS.length === 3, "readiness");
  check(NOTIFICATION_AUDIT_MANAGER_STATUSES.length === 4, "manager");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductNotificationAuditReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductNotificationAuditReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Notification Audit (M06-P7) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

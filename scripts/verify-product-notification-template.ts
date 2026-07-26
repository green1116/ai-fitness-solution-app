/**
 * Product Notification Template — M06-P2 verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../lib/product/notification/foundation/foundation.constants";
import {
  NOTIFICATION_TEMPLATE_KINDS,
  NOTIFICATION_TEMPLATE_LOCALES,
  NOTIFICATION_TEMPLATE_MANAGER_STATUSES,
  NOTIFICATION_TEMPLATE_READINESS_VERDICTS,
  NOTIFICATION_TEMPLATE_VARIABLE_TYPES,
  NOTIFICATION_TEMPLATE_VERSION_STATES,
  PRODUCT_TEMPLATE_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_BASE,
  PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_ID,
  PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
} from "../lib/product/notification-template/management/management.constants";
import {
  assertProductNotificationTemplateReleaseGatePass,
  checkProductNotificationTemplateReleaseGate,
} from "../lib/product/notification-template/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/notification-template/management/management.constants.ts",
    "lib/product/notification-template/management/management.types.ts",
    "lib/product/notification-template/management/management.readiness.ts",
    "lib/product/notification-template/registry/template.types.ts",
    "lib/product/notification-template/registry/template.registry.ts",
    "lib/product/notification-template/variant/variant.types.ts",
    "lib/product/notification-template/variant/variant.registry.ts",
    "lib/product/notification-template/schema/schema.types.ts",
    "lib/product/notification-template/schema/schema.registry.ts",
    "lib/product/notification-template/renderer/renderer.ts",
    "lib/product/notification-template/publication/publication.types.ts",
    "lib/product/notification-template/publication/publication.registry.ts",
    "lib/product/notification-template/manifest/manifest.registry.ts",
    "lib/product/notification-template/notification-template.manager.ts",
    "lib/product/notification-template/verify/product.release.gate.ts",
    "lib/product/notification-template/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_TEMPLATE_MANAGEMENT_ID ===
      "enterprise-product-template-management-v1",
    "template management id",
  );
  check(
    PRODUCT_TEMPLATE_MANAGEMENT_VERSION === "product-notification-template-1",
    "template management version",
  );
  check(
    PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION ===
      "product-notification-template-management-freeze-1",
    "template management freeze",
  );
  check(
    PRODUCT_TEMPLATE_MANAGEMENT_BASE === PRODUCT_NOTIFICATION_FOUNDATION_ID,
    "base = notification foundation",
  );
  check(
    PRODUCT_TEMPLATE_FREEZE_VERSION ===
      "product-notification-template-management-freeze-1",
    "freeze tag",
  );
  check(
    PRODUCT_NOTIFICATION_FOUNDATION_ID ===
      "enterprise-product-notification-foundation-v1",
    "notification foundation preserved",
  );
  check(NOTIFICATION_TEMPLATE_KINDS.length === 4, "kinds");
  check(NOTIFICATION_TEMPLATE_LOCALES.length === 3, "locales");
  check(NOTIFICATION_TEMPLATE_VARIABLE_TYPES.length === 4, "variable types");
  check(NOTIFICATION_TEMPLATE_VERSION_STATES.length === 4, "version states");
  check(NOTIFICATION_TEMPLATE_READINESS_VERDICTS.length === 3, "readiness");
  check(NOTIFICATION_TEMPLATE_MANAGER_STATUSES.length === 4, "manager");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductNotificationTemplateReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.passCount === 7 && gate.failCount === 0, "gate 7/7");
  assertProductNotificationTemplateReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Notification Template Management (M06-P2) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

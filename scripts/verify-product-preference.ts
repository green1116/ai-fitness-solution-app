/**
 * Product Preference — M06-P5 Preference Management verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_CHANNEL_MANAGEMENT_ID } from "../lib/product/channel/management/management.constants";
import { PRODUCT_DELIVERY_ENGINE_ID } from "../lib/product/delivery/management/management.constants";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../lib/product/notification/foundation/foundation.constants";
import { PRODUCT_TEMPLATE_MANAGEMENT_ID } from "../lib/product/notification-template/management/management.constants";
import {
  PREFERENCE_CONSENT_STATES,
  PREFERENCE_KINDS,
  PREFERENCE_MANAGER_STATUSES,
  PREFERENCE_READINESS_VERDICTS,
  PREFERENCE_RESOLUTION_STRATEGIES,
  PREFERENCE_SCOPE_LEVELS,
  PREFERENCE_VALIDATION_VERDICTS,
  PRODUCT_PREFERENCE_FREEZE_VERSION,
  PRODUCT_PREFERENCE_MANAGEMENT_BASE,
  PRODUCT_PREFERENCE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PREFERENCE_MANAGEMENT_ID,
  PRODUCT_PREFERENCE_MANAGEMENT_VERSION,
} from "../lib/product/preference/management/management.constants";
import {
  assertProductPreferenceReleaseGatePass,
  checkProductPreferenceReleaseGate,
} from "../lib/product/preference/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/preference/management/management.constants.ts",
    "lib/product/preference/management/management.types.ts",
    "lib/product/preference/management/management.readiness.ts",
    "lib/product/preference/registry/preference.types.ts",
    "lib/product/preference/registry/preference.registry.ts",
    "lib/product/preference/scope/scope.types.ts",
    "lib/product/preference/scope/scope.registry.ts",
    "lib/product/preference/consent/consent.types.ts",
    "lib/product/preference/consent/consent.registry.ts",
    "lib/product/preference/resolution/resolution.types.ts",
    "lib/product/preference/resolution/resolution.registry.ts",
    "lib/product/preference/validation/validation.types.ts",
    "lib/product/preference/validation/validation.registry.ts",
    "lib/product/preference/manifest/manifest.registry.ts",
    "lib/product/preference/preference.manager.ts",
    "lib/product/preference/verify/product.release.gate.ts",
    "lib/product/preference/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_PREFERENCE_MANAGEMENT_ID ===
      "enterprise-product-preference-management-v1",
    "preference management id",
  );
  check(
    PRODUCT_PREFERENCE_MANAGEMENT_VERSION === "product-preference-1",
    "preference management version",
  );
  check(
    PRODUCT_PREFERENCE_MANAGEMENT_FREEZE_VERSION ===
      "product-preference-management-freeze-1",
    "preference management freeze",
  );
  check(
    PRODUCT_PREFERENCE_MANAGEMENT_BASE === PRODUCT_DELIVERY_ENGINE_ID,
    "preference base = delivery engine",
  );
  check(
    PRODUCT_PREFERENCE_FREEZE_VERSION ===
      "product-preference-management-freeze-1",
    "preference freeze tag",
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
  check(PREFERENCE_KINDS.length === 4, "kinds");
  check(PREFERENCE_SCOPE_LEVELS.length === 4, "scope levels");
  check(PREFERENCE_CONSENT_STATES.length === 4, "consent states");
  check(PREFERENCE_RESOLUTION_STRATEGIES.length === 3, "resolution strategies");
  check(PREFERENCE_VALIDATION_VERDICTS.length === 3, "validation verdicts");
  check(PREFERENCE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(PREFERENCE_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductPreferenceReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductPreferenceReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Preference Management (M06-P5) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

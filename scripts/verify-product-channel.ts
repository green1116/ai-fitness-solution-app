/**
 * Product Channel — M06-P3 Channel Management verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../lib/product/notification/foundation/foundation.constants";
import { PRODUCT_TEMPLATE_MANAGEMENT_ID } from "../lib/product/notification-template/management/management.constants";
import {
  CHANNEL_CAPABILITY_FEATURES,
  CHANNEL_KINDS,
  CHANNEL_MANAGER_STATUSES,
  CHANNEL_POLICY_MODES,
  CHANNEL_READINESS_VERDICTS,
  CHANNEL_STATUSES,
  CHANNEL_VALIDATION_VERDICTS,
  PRODUCT_CHANNEL_FREEZE_VERSION,
  PRODUCT_CHANNEL_MANAGEMENT_BASE,
  PRODUCT_CHANNEL_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_CHANNEL_MANAGEMENT_ID,
  PRODUCT_CHANNEL_MANAGEMENT_VERSION,
} from "../lib/product/channel/management/management.constants";
import {
  assertProductChannelReleaseGatePass,
  checkProductChannelReleaseGate,
} from "../lib/product/channel/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/channel/management/management.constants.ts",
    "lib/product/channel/management/management.types.ts",
    "lib/product/channel/management/management.readiness.ts",
    "lib/product/channel/registry/channel.types.ts",
    "lib/product/channel/registry/channel.registry.ts",
    "lib/product/channel/capability/capability.types.ts",
    "lib/product/channel/capability/capability.registry.ts",
    "lib/product/channel/policy/policy.types.ts",
    "lib/product/channel/policy/policy.registry.ts",
    "lib/product/channel/validation/validation.types.ts",
    "lib/product/channel/validation/validation.registry.ts",
    "lib/product/channel/manifest/manifest.registry.ts",
    "lib/product/channel/channel.manager.ts",
    "lib/product/channel/verify/product.release.gate.ts",
    "lib/product/channel/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  check(
    !fs.existsSync(path.join(ROOT, "lib/product/channel/provider")),
    "provider must not exist",
  );
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_CHANNEL_MANAGEMENT_ID ===
      "enterprise-product-channel-management-v1",
    "channel management id",
  );
  check(
    PRODUCT_CHANNEL_MANAGEMENT_VERSION === "product-channel-1",
    "channel management version",
  );
  check(
    PRODUCT_CHANNEL_MANAGEMENT_FREEZE_VERSION ===
      "product-channel-management-freeze-1",
    "channel management freeze",
  );
  check(
    PRODUCT_CHANNEL_MANAGEMENT_BASE === PRODUCT_TEMPLATE_MANAGEMENT_ID,
    "channel base = template management",
  );
  check(
    PRODUCT_CHANNEL_FREEZE_VERSION ===
      "product-channel-management-freeze-1",
    "channel freeze tag",
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
  check(CHANNEL_KINDS.length === 5, "kinds");
  check(CHANNEL_STATUSES.length === 3, "statuses");
  check(CHANNEL_CAPABILITY_FEATURES.length === 4, "features");
  check(CHANNEL_POLICY_MODES.length === 3, "policy modes");
  check(CHANNEL_VALIDATION_VERDICTS.length === 3, "validation verdicts");
  check(CHANNEL_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(CHANNEL_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductChannelReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductChannelReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Channel Management (M06-P3) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

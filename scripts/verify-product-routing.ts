/**
 * Product Routing — M06-P6 Routing Engine verification
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
import {
  PRODUCT_ROUTING_ENGINE_BASE,
  PRODUCT_ROUTING_ENGINE_FREEZE_VERSION,
  PRODUCT_ROUTING_ENGINE_ID,
  PRODUCT_ROUTING_ENGINE_VERSION,
  PRODUCT_ROUTING_FREEZE_VERSION,
  ROUTING_FALLBACK_MODES,
  ROUTING_KINDS,
  ROUTING_MANAGER_STATUSES,
  ROUTING_READINESS_VERDICTS,
  ROUTING_RESOLUTION_VERDICTS,
  ROUTING_STRATEGIES,
} from "../lib/product/routing/management/management.constants";
import {
  assertProductRoutingReleaseGatePass,
  checkProductRoutingReleaseGate,
} from "../lib/product/routing/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/routing/management/management.constants.ts",
    "lib/product/routing/management/management.types.ts",
    "lib/product/routing/management/management.readiness.ts",
    "lib/product/routing/registry/route.types.ts",
    "lib/product/routing/registry/route.registry.ts",
    "lib/product/routing/rule/rule.types.ts",
    "lib/product/routing/rule/rule.registry.ts",
    "lib/product/routing/strategy/strategy.types.ts",
    "lib/product/routing/strategy/strategy.registry.ts",
    "lib/product/routing/fallback/fallback.types.ts",
    "lib/product/routing/fallback/fallback.registry.ts",
    "lib/product/routing/resolution/resolution.types.ts",
    "lib/product/routing/resolution/resolution.registry.ts",
    "lib/product/routing/manifest/manifest.registry.ts",
    "lib/product/routing/routing.manager.ts",
    "lib/product/routing/verify/product.release.gate.ts",
    "lib/product/routing/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_ROUTING_ENGINE_ID === "enterprise-product-routing-engine-v1",
    "routing engine id",
  );
  check(
    PRODUCT_ROUTING_ENGINE_VERSION === "product-routing-1",
    "routing engine version",
  );
  check(
    PRODUCT_ROUTING_ENGINE_FREEZE_VERSION ===
      "product-routing-engine-freeze-1",
    "routing engine freeze",
  );
  check(
    PRODUCT_ROUTING_ENGINE_BASE === PRODUCT_PREFERENCE_MANAGEMENT_ID,
    "routing base = preference management",
  );
  check(
    PRODUCT_ROUTING_FREEZE_VERSION === "product-routing-engine-freeze-1",
    "routing freeze tag",
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
  check(ROUTING_KINDS.length === 4, "kinds");
  check(ROUTING_STRATEGIES.length === 4, "strategies");
  check(ROUTING_FALLBACK_MODES.length === 3, "fallback modes");
  check(ROUTING_RESOLUTION_VERDICTS.length === 3, "resolution verdicts");
  check(ROUTING_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(ROUTING_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductRoutingReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductRoutingReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Routing Engine (M06-P6) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

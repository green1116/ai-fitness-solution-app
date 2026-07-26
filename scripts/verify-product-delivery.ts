/**
 * Product Delivery — M06-P4 Delivery Engine verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_CHANNEL_MANAGEMENT_ID } from "../lib/product/channel/management/management.constants";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../lib/product/notification/foundation/foundation.constants";
import { PRODUCT_TEMPLATE_MANAGEMENT_ID } from "../lib/product/notification-template/management/management.constants";
import {
  DELIVERY_DISPATCH_CONTRACT_STATUSES,
  DELIVERY_MANAGER_STATUSES,
  DELIVERY_PIPELINE_STAGES,
  DELIVERY_READINESS_VERDICTS,
  DELIVERY_REQUEST_PRIORITIES,
  DELIVERY_RETRY_BACKOFFS,
  DELIVERY_STATUSES,
  PRODUCT_DELIVERY_ENGINE_BASE,
  PRODUCT_DELIVERY_ENGINE_FREEZE_VERSION,
  PRODUCT_DELIVERY_ENGINE_ID,
  PRODUCT_DELIVERY_ENGINE_VERSION,
  PRODUCT_DELIVERY_FREEZE_VERSION,
} from "../lib/product/delivery/management/management.constants";
import {
  assertProductDeliveryReleaseGatePass,
  checkProductDeliveryReleaseGate,
} from "../lib/product/delivery/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/delivery/management/management.constants.ts",
    "lib/product/delivery/management/management.types.ts",
    "lib/product/delivery/management/management.readiness.ts",
    "lib/product/delivery/request/request.types.ts",
    "lib/product/delivery/request/request.registry.ts",
    "lib/product/delivery/pipeline/pipeline.types.ts",
    "lib/product/delivery/pipeline/pipeline.registry.ts",
    "lib/product/delivery/status/status.types.ts",
    "lib/product/delivery/status/status.registry.ts",
    "lib/product/delivery/retry/retry.types.ts",
    "lib/product/delivery/retry/retry.registry.ts",
    "lib/product/delivery/dispatch/dispatch.types.ts",
    "lib/product/delivery/dispatch/dispatch.registry.ts",
    "lib/product/delivery/manifest/manifest.registry.ts",
    "lib/product/delivery/delivery.manager.ts",
    "lib/product/delivery/verify/product.release.gate.ts",
    "lib/product/delivery/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_DELIVERY_ENGINE_ID === "enterprise-product-delivery-engine-v1",
    "delivery engine id",
  );
  check(
    PRODUCT_DELIVERY_ENGINE_VERSION === "product-delivery-1",
    "delivery engine version",
  );
  check(
    PRODUCT_DELIVERY_ENGINE_FREEZE_VERSION ===
      "product-delivery-engine-freeze-1",
    "delivery engine freeze",
  );
  check(
    PRODUCT_DELIVERY_ENGINE_BASE === PRODUCT_CHANNEL_MANAGEMENT_ID,
    "delivery base = channel management",
  );
  check(
    PRODUCT_DELIVERY_FREEZE_VERSION === "product-delivery-engine-freeze-1",
    "delivery freeze tag",
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
  check(DELIVERY_REQUEST_PRIORITIES.length === 3, "priorities");
  check(DELIVERY_PIPELINE_STAGES.length === 5, "pipeline stages");
  check(DELIVERY_STATUSES.length === 6, "statuses");
  check(DELIVERY_RETRY_BACKOFFS.length === 3, "retry backoffs");
  check(DELIVERY_DISPATCH_CONTRACT_STATUSES.length === 3, "dispatch statuses");
  check(DELIVERY_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(DELIVERY_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductDeliveryReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductDeliveryReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Delivery Engine (M06-P4) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

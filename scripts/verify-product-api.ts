/**
 * Product API — M07-P1 API Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID } from "../lib/product/notification-baseline/freeze/freeze.lock";
import {
  API_KINDS,
  API_LIFECYCLE_STATES,
  API_MANAGER_STATUSES,
  API_POLICY_MODES,
  API_READINESS_VERDICTS,
  PRODUCT_API_FOUNDATION_BASE,
  PRODUCT_API_FOUNDATION_FREEZE_VERSION,
  PRODUCT_API_FOUNDATION_ID,
  PRODUCT_API_FOUNDATION_VERSION,
  PRODUCT_API_FREEZE_VERSION,
} from "../lib/product/api/management/management.constants";
import {
  assertProductApiReleaseGatePass,
  checkProductApiReleaseGate,
} from "../lib/product/api/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/api/management/management.constants.ts",
    "lib/product/api/management/management.types.ts",
    "lib/product/api/management/management.readiness.ts",
    "lib/product/api/registry/api.types.ts",
    "lib/product/api/registry/api.registry.ts",
    "lib/product/api/definition/definition.types.ts",
    "lib/product/api/definition/definition.registry.ts",
    "lib/product/api/version/version.types.ts",
    "lib/product/api/version/version.registry.ts",
    "lib/product/api/lifecycle/lifecycle.types.ts",
    "lib/product/api/lifecycle/lifecycle.registry.ts",
    "lib/product/api/policy/policy.types.ts",
    "lib/product/api/policy/policy.registry.ts",
    "lib/product/api/manifest/manifest.registry.ts",
    "lib/product/api/api.manager.ts",
    "lib/product/api/verify/product.release.gate.ts",
    "lib/product/api/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_API_FOUNDATION_ID === "enterprise-product-api-foundation-v1",
    "api foundation id",
  );
  check(
    PRODUCT_API_FOUNDATION_VERSION === "product-api-1",
    "api foundation version",
  );
  check(
    PRODUCT_API_FOUNDATION_FREEZE_VERSION ===
      "product-api-foundation-freeze-1",
    "api foundation freeze",
  );
  check(
    PRODUCT_API_FOUNDATION_BASE === ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID,
    "api base = notification baseline",
  );
  check(
    PRODUCT_API_FREEZE_VERSION === "product-api-foundation-freeze-1",
    "api freeze tag",
  );
  check(
    ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID ===
      "enterprise-product-notification-baseline-v1",
    "notification baseline preserved",
  );
  check(API_KINDS.length === 4, "kinds");
  check(API_LIFECYCLE_STATES.length === 4, "lifecycle states");
  check(API_POLICY_MODES.length === 3, "policy modes");
  check(API_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(API_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductApiReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductApiReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product API Foundation (M07-P1) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

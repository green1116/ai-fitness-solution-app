/**
 * Product Marketplace — M08-P1 Marketplace Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_API_BASELINE_ID } from "../lib/product/api-baseline/freeze/freeze.lock";
import {
  MARKETPLACE_LIFECYCLE_STATES,
  MARKETPLACE_LISTING_KINDS,
  MARKETPLACE_MANAGER_STATUSES,
  MARKETPLACE_POLICY_MODES,
  MARKETPLACE_READINESS_VERDICTS,
  PRODUCT_MARKETPLACE_FOUNDATION_BASE,
  PRODUCT_MARKETPLACE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_FOUNDATION_ID,
  PRODUCT_MARKETPLACE_FOUNDATION_VERSION,
  PRODUCT_MARKETPLACE_FREEZE_VERSION,
} from "../lib/product/marketplace/management/management.constants";
import {
  assertProductMarketplaceReleaseGatePass,
  checkProductMarketplaceReleaseGate,
} from "../lib/product/marketplace/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/marketplace/management/management.constants.ts",
    "lib/product/marketplace/management/management.types.ts",
    "lib/product/marketplace/management/management.readiness.ts",
    "lib/product/marketplace/registry/listing.types.ts",
    "lib/product/marketplace/registry/listing.registry.ts",
    "lib/product/marketplace/definition/definition.types.ts",
    "lib/product/marketplace/definition/definition.registry.ts",
    "lib/product/marketplace/version/version.types.ts",
    "lib/product/marketplace/version/version.registry.ts",
    "lib/product/marketplace/lifecycle/lifecycle.types.ts",
    "lib/product/marketplace/lifecycle/lifecycle.registry.ts",
    "lib/product/marketplace/policy/policy.types.ts",
    "lib/product/marketplace/policy/policy.registry.ts",
    "lib/product/marketplace/manifest/manifest.registry.ts",
    "lib/product/marketplace/marketplace.manager.ts",
    "lib/product/marketplace/verify/product.release.gate.ts",
    "lib/product/marketplace/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_MARKETPLACE_FOUNDATION_ID ===
      "enterprise-product-marketplace-foundation-v1",
    "marketplace foundation id",
  );
  check(
    PRODUCT_MARKETPLACE_FOUNDATION_VERSION === "product-marketplace-1",
    "marketplace foundation version",
  );
  check(
    PRODUCT_MARKETPLACE_FOUNDATION_FREEZE_VERSION ===
      "product-marketplace-foundation-freeze-1",
    "marketplace foundation freeze",
  );
  check(
    PRODUCT_MARKETPLACE_FOUNDATION_BASE ===
      ENTERPRISE_PRODUCT_API_BASELINE_ID,
    "marketplace base = api baseline",
  );
  check(
    PRODUCT_MARKETPLACE_FREEZE_VERSION ===
      "product-marketplace-foundation-freeze-1",
    "marketplace freeze tag",
  );
  check(
    ENTERPRISE_PRODUCT_API_BASELINE_ID ===
      "enterprise-product-api-baseline-v1",
    "api baseline preserved",
  );
  check(MARKETPLACE_LISTING_KINDS.length === 4, "listing kinds");
  check(MARKETPLACE_LIFECYCLE_STATES.length === 4, "lifecycle states");
  check(MARKETPLACE_POLICY_MODES.length === 3, "policy modes");
  check(MARKETPLACE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(MARKETPLACE_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductMarketplaceReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductMarketplaceReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Marketplace Foundation (M08-P1) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

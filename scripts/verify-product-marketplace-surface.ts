/**
 * Product Marketplace Surface — M08-P5 verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_APP_REGISTRY_ID } from "../lib/product/app/management/management.constants";
import {
  PRODUCT_MARKETPLACE_SURFACE_BASE,
  PRODUCT_MARKETPLACE_SURFACE_FREEZE_TAG,
  PRODUCT_MARKETPLACE_SURFACE_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_SURFACE_ID,
  PRODUCT_MARKETPLACE_SURFACE_VERSION,
  SURFACE_CATALOG_KINDS,
  SURFACE_CATALOG_STATUSES,
  SURFACE_LISTING_STATUSES,
  SURFACE_MANAGER_STATUSES,
  SURFACE_PLACEMENT_KINDS,
  SURFACE_READINESS_VERDICTS,
  SURFACE_VISIBILITY_MODES,
} from "../lib/product/marketplace-surface/management/management.constants";
import {
  assertProductMarketplaceSurfaceReleaseGatePass,
  checkProductMarketplaceSurfaceReleaseGate,
} from "../lib/product/marketplace-surface/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/marketplace-surface/management/management.constants.ts",
    "lib/product/marketplace-surface/management/management.types.ts",
    "lib/product/marketplace-surface/management/management.readiness.ts",
    "lib/product/marketplace-surface/catalog/catalog.types.ts",
    "lib/product/marketplace-surface/catalog/catalog.registry.ts",
    "lib/product/marketplace-surface/listing/listing.types.ts",
    "lib/product/marketplace-surface/listing/listing.registry.ts",
    "lib/product/marketplace-surface/visibility/visibility.types.ts",
    "lib/product/marketplace-surface/visibility/visibility.registry.ts",
    "lib/product/marketplace-surface/placement/placement.types.ts",
    "lib/product/marketplace-surface/placement/placement.registry.ts",
    "lib/product/marketplace-surface/manifest/manifest.registry.ts",
    "lib/product/marketplace-surface/marketplace-surface.manager.ts",
    "lib/product/marketplace-surface/verify/product.release.gate.ts",
    "lib/product/marketplace-surface/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_MARKETPLACE_SURFACE_ID ===
      "enterprise-product-marketplace-surface-v1",
    "marketplace surface id",
  );
  check(
    PRODUCT_MARKETPLACE_SURFACE_VERSION === "product-marketplace-surface-1",
    "marketplace surface version",
  );
  check(
    PRODUCT_MARKETPLACE_SURFACE_FREEZE_VERSION ===
      "product-marketplace-surface-freeze-1",
    "marketplace surface freeze",
  );
  check(
    PRODUCT_MARKETPLACE_SURFACE_BASE === PRODUCT_APP_REGISTRY_ID,
    "surface base = app registry",
  );
  check(
    PRODUCT_MARKETPLACE_SURFACE_FREEZE_TAG ===
      "product-marketplace-surface-freeze-1",
    "marketplace surface freeze tag",
  );
  check(
    PRODUCT_APP_REGISTRY_ID === "enterprise-product-app-registry-v1",
    "app registry preserved",
  );
  check(SURFACE_CATALOG_KINDS.length === 4, "catalog kinds");
  check(SURFACE_CATALOG_STATUSES.length === 4, "catalog statuses");
  check(SURFACE_LISTING_STATUSES.length === 4, "listing statuses");
  check(SURFACE_VISIBILITY_MODES.length === 3, "visibility modes");
  check(SURFACE_PLACEMENT_KINDS.length === 4, "placement kinds");
  check(SURFACE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(SURFACE_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductMarketplaceSurfaceReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductMarketplaceSurfaceReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Marketplace Surface (M08-P5) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

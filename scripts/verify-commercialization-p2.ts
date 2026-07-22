/**
 * Commercialization P2 — Product Packaging Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import {
  COMMERCIALIZATION_P1_SALES_FREEZE_VERSION,
  COMMERCIALIZATION_SALES_FOUNDATION_ID,
} from "../lib/commercialization/p1/sales/sales.constants";
import {
  COMMERCIALIZATION_P2_PACKAGING_FREEZE_VERSION,
  COMMERCIALIZATION_PRODUCT_PACKAGING_BASE,
  COMMERCIALIZATION_PRODUCT_PACKAGING_FREEZE_VERSION,
  COMMERCIALIZATION_PRODUCT_PACKAGING_ID,
  COMMERCIALIZATION_PRODUCT_PACKAGING_VERSION,
  DELIVERY_MODELS,
  DELIVERY_SCOPES,
  PACKAGE_KINDS,
  PACKAGE_STATUSES,
  PACKAGING_MANAGER_STATUSES,
  PACKAGING_READINESS_VERDICTS,
  PRODUCT_STATUSES,
  TIER_LEVELS,
} from "../lib/commercialization/p2/tier/tier.constants";
import { buildTierMatrix } from "../lib/commercialization/p2/tier/tier.matrix";
import {
  assertCommercializationP2ReleaseGatePass,
  checkCommercializationP2ReleaseGate,
} from "../lib/commercialization/p2/verify/commercialization.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/commercialization/p2/product/product.types.ts",
    "lib/commercialization/p2/product/product.registry.ts",
    "lib/commercialization/p2/product/product.catalog.ts",
    "lib/commercialization/p2/package/package.types.ts",
    "lib/commercialization/p2/package/package.registry.ts",
    "lib/commercialization/p2/package/package.composer.ts",
    "lib/commercialization/p2/tier/tier.constants.ts",
    "lib/commercialization/p2/tier/tier.matrix.ts",
    "lib/commercialization/p2/delivery/delivery.scope.ts",
    "lib/commercialization/p2/delivery/delivery.model.ts",
    "lib/commercialization/p2/delivery/delivery.types.ts",
    "lib/commercialization/p2/packaging.types.ts",
    "lib/commercialization/p2/packaging.readiness.ts",
    "lib/commercialization/p2/packaging.manager.ts",
    "lib/commercialization/p2/verify/commercialization.release.gate.ts",
    "lib/commercialization/p2/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    COMMERCIALIZATION_PRODUCT_PACKAGING_ID ===
      "enterprise-commercialization-p2-product-packaging-foundation-v1",
    "product packaging id",
  );
  check(
    COMMERCIALIZATION_PRODUCT_PACKAGING_VERSION === "commercialization-p2-1",
    "product packaging version",
  );
  check(
    COMMERCIALIZATION_PRODUCT_PACKAGING_FREEZE_VERSION ===
      "commercialization-product-packaging-foundation-freeze-1",
    "product packaging freeze",
  );
  check(
    COMMERCIALIZATION_PRODUCT_PACKAGING_BASE ===
      COMMERCIALIZATION_SALES_FOUNDATION_ID,
    "packaging base = p1 sales foundation",
  );
  check(
    COMMERCIALIZATION_SALES_FOUNDATION_ID ===
      "enterprise-commercialization-p1-sales-foundation-v1",
    "p1 freeze preserved",
  );
  check(
    COMMERCIALIZATION_P1_SALES_FREEZE_VERSION ===
      "commercialization-p1-sales-foundation-freeze-1",
    "p1 freeze tag preserved",
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
    COMMERCIALIZATION_P2_PACKAGING_FREEZE_VERSION ===
      "commercialization-p2-product-packaging-foundation-freeze-1",
    "p2 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(PRODUCT_STATUSES.length === 3, "product statuses");
  check(PACKAGE_KINDS.length === 4, "package kinds");
  check(PACKAGE_STATUSES.length === 4, "package statuses");
  check(TIER_LEVELS.length === 4, "tier levels");
  check(DELIVERY_SCOPES.length === 4, "delivery scopes");
  check(DELIVERY_MODELS.length === 3, "delivery models");
  check(PACKAGING_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(PACKAGING_MANAGER_STATUSES.length === 4, "manager statuses");
  check(buildTierMatrix().length === 4, "tier matrix");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkCommercializationP2ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertCommercializationP2ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Commercialization P2 Product Packaging Foundation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

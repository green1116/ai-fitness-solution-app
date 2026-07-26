/**
 * Product App — M08-P4 App Registry verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  APP_KINDS,
  APP_MANAGER_STATUSES,
  APP_OWNERSHIP_STATUSES,
  APP_READINESS_VERDICTS,
  APP_STATUSES,
  APP_VERSION_STATUSES,
  PRODUCT_APP_FREEZE_TAG,
  PRODUCT_APP_REGISTRY_BASE,
  PRODUCT_APP_REGISTRY_FREEZE_VERSION,
  PRODUCT_APP_REGISTRY_ID,
  PRODUCT_APP_REGISTRY_VERSION,
} from "../lib/product/app/management/management.constants";
import {
  assertProductAppReleaseGatePass,
  checkProductAppReleaseGate,
} from "../lib/product/app/verify/product.release.gate";
import { PRODUCT_PARTNER_MANAGEMENT_ID } from "../lib/product/partner/management/management.constants";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/app/management/management.constants.ts",
    "lib/product/app/management/management.types.ts",
    "lib/product/app/management/management.readiness.ts",
    "lib/product/app/registry/app.types.ts",
    "lib/product/app/registry/app.registry.ts",
    "lib/product/app/definition/definition.types.ts",
    "lib/product/app/definition/definition.registry.ts",
    "lib/product/app/version/version.types.ts",
    "lib/product/app/version/version.registry.ts",
    "lib/product/app/ownership/ownership.types.ts",
    "lib/product/app/ownership/ownership.registry.ts",
    "lib/product/app/manifest/manifest.registry.ts",
    "lib/product/app/app.manager.ts",
    "lib/product/app/verify/product.release.gate.ts",
    "lib/product/app/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_APP_REGISTRY_ID === "enterprise-product-app-registry-v1",
    "app registry id",
  );
  check(
    PRODUCT_APP_REGISTRY_VERSION === "product-app-1",
    "app registry version",
  );
  check(
    PRODUCT_APP_REGISTRY_FREEZE_VERSION === "product-app-registry-freeze-1",
    "app registry freeze",
  );
  check(
    PRODUCT_APP_REGISTRY_BASE === PRODUCT_PARTNER_MANAGEMENT_ID,
    "app base = partner management",
  );
  check(
    PRODUCT_APP_FREEZE_TAG === "product-app-registry-freeze-1",
    "app freeze tag",
  );
  check(
    PRODUCT_PARTNER_MANAGEMENT_ID ===
      "enterprise-product-partner-management-v1",
    "partner management preserved",
  );
  check(APP_KINDS.length === 4, "app kinds");
  check(APP_STATUSES.length === 4, "app statuses");
  check(APP_VERSION_STATUSES.length === 4, "version statuses");
  check(APP_OWNERSHIP_STATUSES.length === 3, "ownership statuses");
  check(APP_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(APP_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAppReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAppReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product App Registry (M08-P4) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

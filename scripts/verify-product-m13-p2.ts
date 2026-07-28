/**
 * Product M13 — P2 OS Catalog verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_OS_FOUNDATION_ID } from "../lib/product/m13/foundation/os.constants";
import {
  OS_CATALOG_BINDING_STATUSES,
  OS_CATALOG_ENTRY_STATUSES,
  OS_CATALOG_KINDS,
  OS_CATALOG_READINESS_VERDICTS,
  OS_CATALOG_STATUSES,
  PRODUCT_OS_CATALOG_BASE,
  PRODUCT_OS_CATALOG_FREEZE_TAG,
  PRODUCT_OS_CATALOG_FREEZE_VERSION,
  PRODUCT_OS_CATALOG_ID,
  PRODUCT_OS_CATALOG_VERSION,
} from "../lib/product/m13/catalog-runtime/catalog.constants";
import {
  getOsCatalogMetadata,
  isOsCatalogMetadataIntact,
} from "../lib/product/m13/catalog-runtime/catalog.metadata";
import {
  assertProductOsCatalogReleaseGatePass,
  checkProductOsCatalogReleaseGate,
} from "../lib/product/m13/verify/os.catalog.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m13/catalog-runtime/catalog.constants.ts",
    "lib/product/m13/catalog-runtime/catalog.types.ts",
    "lib/product/m13/catalog-runtime/catalog.metadata.ts",
    "lib/product/m13/catalog-runtime/catalog.registry.ts",
    "lib/product/m13/catalog-runtime/entry.registry.ts",
    "lib/product/m13/catalog-runtime/binding.registry.ts",
    "lib/product/m13/catalog-runtime/catalog.manifest.ts",
    "lib/product/m13/verify/os.catalog.gate.ts",
    "lib/product/m13/index.ts",
    "lib/product/m13/foundation/os.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m13/vector",
    "lib/product/m13/rag",
    "lib/product/m13/embedding",
    "lib/product/m13/provider",
    "lib/product/m13/db",
    "lib/product/m13/runtime",
    "lib/product/m13/execution",
    "lib/product/m13/tool",
    "lib/product/m13/catalog",
    "lib/product/m13/dependency",
    "lib/product/m13/policy",
    "lib/product/m13/compatibility",
    "lib/product/m13/governance-runtime",
    "lib/product/m13/lifecycle",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P3+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_OS_CATALOG_ID === "enterprise-product-os-catalog-v1",
    "os catalog id",
  );
  check(
    PRODUCT_OS_CATALOG_VERSION === "product-os-catalog-1",
    "os catalog version",
  );
  check(
    PRODUCT_OS_CATALOG_FREEZE_VERSION === "product-os-catalog-freeze-1",
    "os catalog freeze",
  );
  check(
    PRODUCT_OS_CATALOG_BASE === PRODUCT_OS_FOUNDATION_ID,
    "os catalog base = os foundation",
  );
  check(
    PRODUCT_OS_CATALOG_FREEZE_TAG === "product-os-catalog-freeze-1",
    "os catalog freeze tag",
  );
  check(
    PRODUCT_OS_FOUNDATION_ID === "enterprise-product-os-foundation-v1",
    "os foundation preserved",
  );
  check(OS_CATALOG_KINDS.length === 4, "catalog kinds");
  check(OS_CATALOG_STATUSES.length === 4, "catalog statuses");
  check(OS_CATALOG_ENTRY_STATUSES.length === 4, "entry statuses");
  check(OS_CATALOG_BINDING_STATUSES.length === 3, "binding statuses");
  check(OS_CATALOG_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(isOsCatalogMetadataIntact(getOsCatalogMetadata()), "metadata");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductOsCatalogReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductOsCatalogReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Enterprise Operating System Catalog (M13-P2) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

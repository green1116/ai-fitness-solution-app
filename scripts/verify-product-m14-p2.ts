/**
 * Product M14 — P2 Enterprise Intelligence Catalog verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_INTELLIGENCE_FOUNDATION_ID } from "../lib/product/m14/foundation/intelligence.constants";
import {
  INTELLIGENCE_CATALOG_BINDING_STATUSES,
  INTELLIGENCE_CATALOG_ENTRY_STATUSES,
  INTELLIGENCE_CATALOG_KINDS,
  INTELLIGENCE_CATALOG_READINESS_VERDICTS,
  INTELLIGENCE_CATALOG_STATUSES,
  PRODUCT_INTELLIGENCE_CATALOG_BASE,
  PRODUCT_INTELLIGENCE_CATALOG_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_CATALOG_ID,
  PRODUCT_INTELLIGENCE_CATALOG_VERSION,
} from "../lib/product/m14/catalog-runtime/catalog.constants";
import {
  getIntelligenceCatalogMetadata,
  isIntelligenceCatalogMetadataIntact,
} from "../lib/product/m14/catalog-runtime/catalog.metadata";
import {
  assertProductIntelligenceCatalogReleaseGatePass,
  checkProductIntelligenceCatalogReleaseGate,
} from "../lib/product/m14/verify/intelligence.catalog.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m14/catalog-runtime/catalog.constants.ts",
    "lib/product/m14/catalog-runtime/catalog.types.ts",
    "lib/product/m14/catalog-runtime/catalog.metadata.ts",
    "lib/product/m14/catalog-runtime/catalog.registry.ts",
    "lib/product/m14/catalog-runtime/entry.registry.ts",
    "lib/product/m14/catalog-runtime/binding.registry.ts",
    "lib/product/m14/catalog-runtime/catalog.manifest.ts",
    "lib/product/m14/verify/intelligence.catalog.gate.ts",
    "lib/product/m14/index.ts",
    "lib/product/m14/foundation/intelligence.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m14/vector",
    "lib/product/m14/rag",
    "lib/product/m14/embedding",
    "lib/product/m14/provider",
    "lib/product/m14/db",
    "lib/product/m14/runtime",
    "lib/product/m14/execution",
    "lib/product/m14/tool",
    "lib/product/m14/catalog",
    "lib/product/m14/dependency",
    "lib/product/m14/policy",
    "lib/product/m14/compatibility",
    "lib/product/m14/governance-runtime",
    "lib/product/m14/lifecycle",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P3+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_INTELLIGENCE_CATALOG_ID === "enterprise-product-intelligence-catalog-v1",
    "intelligence catalog id",
  );
  check(
    PRODUCT_INTELLIGENCE_CATALOG_VERSION === "product-intelligence-catalog-1",
    "intelligence catalog version",
  );
  check(
    PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION ===
      "product-intelligence-catalog-freeze-1",
    "intelligence catalog freeze",
  );
  check(
    PRODUCT_INTELLIGENCE_CATALOG_BASE === PRODUCT_INTELLIGENCE_FOUNDATION_ID,
    "intelligence catalog base = intelligence foundation",
  );
  check(
    PRODUCT_INTELLIGENCE_CATALOG_FREEZE_TAG ===
      "product-intelligence-catalog-freeze-1",
    "intelligence catalog freeze tag",
  );
  check(
    PRODUCT_INTELLIGENCE_FOUNDATION_ID ===
      "enterprise-product-intelligence-foundation-v1",
    "intelligence foundation preserved",
  );
  check(INTELLIGENCE_CATALOG_KINDS.length === 4, "catalog kinds");
  check(INTELLIGENCE_CATALOG_STATUSES.length === 4, "catalog statuses");
  check(INTELLIGENCE_CATALOG_ENTRY_STATUSES.length === 4, "entry statuses");
  check(INTELLIGENCE_CATALOG_BINDING_STATUSES.length === 3, "binding statuses");
  check(INTELLIGENCE_CATALOG_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isIntelligenceCatalogMetadataIntact(getIntelligenceCatalogMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductIntelligenceCatalogReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductIntelligenceCatalogReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Enterprise Intelligence Catalog (M14-P2) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

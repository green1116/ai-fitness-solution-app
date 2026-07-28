/**
 * Product M11 — P2 Knowledge Catalog verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_KNOWLEDGE_FOUNDATION_ID } from "../lib/product/m11/foundation/knowledge.constants";
import {
  KNOWLEDGE_CATALOG_BINDING_STATUSES,
  KNOWLEDGE_CATALOG_ENTRY_STATUSES,
  KNOWLEDGE_CATALOG_KINDS,
  KNOWLEDGE_CATALOG_READINESS_VERDICTS,
  KNOWLEDGE_CATALOG_STATUSES,
  PRODUCT_KNOWLEDGE_CATALOG_BASE,
  PRODUCT_KNOWLEDGE_CATALOG_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_CATALOG_ID,
  PRODUCT_KNOWLEDGE_CATALOG_VERSION,
} from "../lib/product/m11/catalog/catalog.constants";
import {
  getKnowledgeCatalogMetadata,
  isKnowledgeCatalogMetadataIntact,
} from "../lib/product/m11/catalog/catalog.metadata";
import {
  assertProductKnowledgeCatalogReleaseGatePass,
  checkProductKnowledgeCatalogReleaseGate,
} from "../lib/product/m11/verify/knowledge.catalog.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m11/catalog/catalog.constants.ts",
    "lib/product/m11/catalog/catalog.types.ts",
    "lib/product/m11/catalog/catalog.metadata.ts",
    "lib/product/m11/catalog/catalog.registry.ts",
    "lib/product/m11/catalog/entry.registry.ts",
    "lib/product/m11/catalog/binding.registry.ts",
    "lib/product/m11/catalog/catalog.manifest.ts",
    "lib/product/m11/verify/knowledge.catalog.gate.ts",
    "lib/product/m11/index.ts",
    "lib/product/m11/foundation/knowledge.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m11/vector",
    "lib/product/m11/rag",
    "lib/product/m11/embedding",
    "lib/product/m11/provider",
    "lib/product/m11/db",
    "lib/product/m11/dependency",
    "lib/product/m11/index-runtime",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P3+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_KNOWLEDGE_CATALOG_ID ===
      "enterprise-product-knowledge-catalog-v1",
    "knowledge catalog id",
  );
  check(
    PRODUCT_KNOWLEDGE_CATALOG_VERSION === "product-knowledge-catalog-1",
    "knowledge catalog version",
  );
  check(
    PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION ===
      "product-knowledge-catalog-freeze-1",
    "knowledge catalog freeze",
  );
  check(
    PRODUCT_KNOWLEDGE_CATALOG_BASE === PRODUCT_KNOWLEDGE_FOUNDATION_ID,
    "catalog base = knowledge foundation",
  );
  check(
    PRODUCT_KNOWLEDGE_CATALOG_FREEZE_TAG ===
      "product-knowledge-catalog-freeze-1",
    "knowledge catalog freeze tag",
  );
  check(
    PRODUCT_KNOWLEDGE_FOUNDATION_ID ===
      "enterprise-product-knowledge-foundation-v1",
    "knowledge foundation preserved",
  );
  check(KNOWLEDGE_CATALOG_KINDS.length === 4, "catalog kinds");
  check(KNOWLEDGE_CATALOG_STATUSES.length === 4, "catalog statuses");
  check(KNOWLEDGE_CATALOG_ENTRY_STATUSES.length === 4, "entry statuses");
  check(KNOWLEDGE_CATALOG_BINDING_STATUSES.length === 3, "binding statuses");
  check(KNOWLEDGE_CATALOG_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isKnowledgeCatalogMetadataIntact(getKnowledgeCatalogMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductKnowledgeCatalogReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductKnowledgeCatalogReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Knowledge Catalog (M11-P2) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

/**
 * Product M11 — P3 Knowledge Dependency verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_KNOWLEDGE_CATALOG_ID } from "../lib/product/m11/catalog/catalog.constants";
import {
  KNOWLEDGE_DEPENDENCY_EDGE_STATUSES,
  KNOWLEDGE_DEPENDENCY_GRAPH_KINDS,
  KNOWLEDGE_DEPENDENCY_GRAPH_STATUSES,
  KNOWLEDGE_DEPENDENCY_IMPACTS,
  KNOWLEDGE_DEPENDENCY_NODE_STATUSES,
  KNOWLEDGE_DEPENDENCY_READINESS_VERDICTS,
  PRODUCT_KNOWLEDGE_DEPENDENCY_BASE,
  PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_DEPENDENCY_ID,
  PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION,
} from "../lib/product/m11/dependency-runtime/dependency.constants";
import {
  getKnowledgeDependencyMetadata,
  isKnowledgeDependencyMetadataIntact,
} from "../lib/product/m11/dependency-runtime/dependency.metadata";
import {
  assertProductKnowledgeDependencyReleaseGatePass,
  checkProductKnowledgeDependencyReleaseGate,
} from "../lib/product/m11/verify/knowledge.dependency.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m11/dependency-runtime/dependency.constants.ts",
    "lib/product/m11/dependency-runtime/dependency.types.ts",
    "lib/product/m11/dependency-runtime/dependency.metadata.ts",
    "lib/product/m11/dependency-runtime/graph.registry.ts",
    "lib/product/m11/dependency-runtime/node.registry.ts",
    "lib/product/m11/dependency-runtime/edge.registry.ts",
    "lib/product/m11/dependency-runtime/dependency.manifest.ts",
    "lib/product/m11/verify/knowledge.dependency.gate.ts",
    "lib/product/m11/index.ts",
    "lib/product/m11/catalog/catalog.constants.ts",
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
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P4+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_KNOWLEDGE_DEPENDENCY_ID ===
      "enterprise-product-knowledge-dependency-v1",
    "knowledge dependency id",
  );
  check(
    PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION ===
      "product-knowledge-dependency-1",
    "knowledge dependency version",
  );
  check(
    PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION ===
      "product-knowledge-dependency-freeze-1",
    "knowledge dependency freeze",
  );
  check(
    PRODUCT_KNOWLEDGE_DEPENDENCY_BASE === PRODUCT_KNOWLEDGE_CATALOG_ID,
    "dependency base = knowledge catalog",
  );
  check(
    PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_TAG ===
      "product-knowledge-dependency-freeze-1",
    "knowledge dependency freeze tag",
  );
  check(
    PRODUCT_KNOWLEDGE_CATALOG_ID ===
      "enterprise-product-knowledge-catalog-v1",
    "knowledge catalog preserved",
  );
  check(KNOWLEDGE_DEPENDENCY_GRAPH_KINDS.length === 4, "graph kinds");
  check(KNOWLEDGE_DEPENDENCY_GRAPH_STATUSES.length === 4, "graph statuses");
  check(KNOWLEDGE_DEPENDENCY_NODE_STATUSES.length === 4, "node statuses");
  check(KNOWLEDGE_DEPENDENCY_EDGE_STATUSES.length === 3, "edge statuses");
  check(KNOWLEDGE_DEPENDENCY_IMPACTS.length === 4, "impacts");
  check(
    KNOWLEDGE_DEPENDENCY_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isKnowledgeDependencyMetadataIntact(getKnowledgeDependencyMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductKnowledgeDependencyReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductKnowledgeDependencyReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Knowledge Dependency (M11-P3) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

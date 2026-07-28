/**
 * Product M14 — P3 Enterprise Intelligence Dependency verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_INTELLIGENCE_CATALOG_ID } from "../lib/product/m14/catalog-runtime/catalog.constants";
import {
  INTELLIGENCE_DEPENDENCY_EDGE_STATUSES,
  INTELLIGENCE_DEPENDENCY_GRAPH_KINDS,
  INTELLIGENCE_DEPENDENCY_GRAPH_STATUSES,
  INTELLIGENCE_DEPENDENCY_IMPACTS,
  INTELLIGENCE_DEPENDENCY_NODE_STATUSES,
  INTELLIGENCE_DEPENDENCY_READINESS_VERDICTS,
  PRODUCT_INTELLIGENCE_DEPENDENCY_BASE,
  PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_DEPENDENCY_ID,
  PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION,
} from "../lib/product/m14/dependency-runtime/dependency.constants";
import {
  getIntelligenceDependencyMetadata,
  isIntelligenceDependencyMetadataIntact,
} from "../lib/product/m14/dependency-runtime/dependency.metadata";
import {
  assertProductIntelligenceDependencyReleaseGatePass,
  checkProductIntelligenceDependencyReleaseGate,
} from "../lib/product/m14/verify/intelligence.dependency.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m14/dependency-runtime/dependency.constants.ts",
    "lib/product/m14/dependency-runtime/dependency.types.ts",
    "lib/product/m14/dependency-runtime/dependency.metadata.ts",
    "lib/product/m14/dependency-runtime/graph.registry.ts",
    "lib/product/m14/dependency-runtime/node.registry.ts",
    "lib/product/m14/dependency-runtime/edge.registry.ts",
    "lib/product/m14/dependency-runtime/dependency.manifest.ts",
    "lib/product/m14/verify/intelligence.dependency.gate.ts",
    "lib/product/m14/index.ts",
    "lib/product/m14/catalog-runtime/catalog.constants.ts",
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
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P4+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_INTELLIGENCE_DEPENDENCY_ID ===
      "enterprise-product-intelligence-dependency-v1",
    "intelligence dependency id",
  );
  check(
    PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION === "product-intelligence-dependency-1",
    "intelligence dependency version",
  );
  check(
    PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION ===
      "product-intelligence-dependency-freeze-1",
    "intelligence dependency freeze",
  );
  check(
    PRODUCT_INTELLIGENCE_DEPENDENCY_BASE === PRODUCT_INTELLIGENCE_CATALOG_ID,
    "intelligence dependency base = intelligence catalog",
  );
  check(
    PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_TAG ===
      "product-intelligence-dependency-freeze-1",
    "intelligence dependency freeze tag",
  );
  check(
    PRODUCT_INTELLIGENCE_CATALOG_ID === "enterprise-product-intelligence-catalog-v1",
    "intelligence catalog preserved",
  );
  check(INTELLIGENCE_DEPENDENCY_GRAPH_KINDS.length === 4, "graph kinds");
  check(INTELLIGENCE_DEPENDENCY_GRAPH_STATUSES.length === 4, "graph statuses");
  check(INTELLIGENCE_DEPENDENCY_NODE_STATUSES.length === 4, "node statuses");
  check(INTELLIGENCE_DEPENDENCY_EDGE_STATUSES.length === 3, "edge statuses");
  check(INTELLIGENCE_DEPENDENCY_IMPACTS.length === 4, "impacts");
  check(
    INTELLIGENCE_DEPENDENCY_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    isIntelligenceDependencyMetadataIntact(getIntelligenceDependencyMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductIntelligenceDependencyReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductIntelligenceDependencyReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Enterprise Intelligence Dependency (M14-P3) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

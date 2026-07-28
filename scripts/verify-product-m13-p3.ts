/**
 * Product M13 — P3 OS Dependency verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_OS_CATALOG_ID } from "../lib/product/m13/catalog-runtime/catalog.constants";
import {
  OS_DEPENDENCY_EDGE_STATUSES,
  OS_DEPENDENCY_GRAPH_KINDS,
  OS_DEPENDENCY_GRAPH_STATUSES,
  OS_DEPENDENCY_IMPACTS,
  OS_DEPENDENCY_NODE_STATUSES,
  OS_DEPENDENCY_READINESS_VERDICTS,
  PRODUCT_OS_DEPENDENCY_BASE,
  PRODUCT_OS_DEPENDENCY_FREEZE_TAG,
  PRODUCT_OS_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_OS_DEPENDENCY_ID,
  PRODUCT_OS_DEPENDENCY_VERSION,
} from "../lib/product/m13/dependency-runtime/dependency.constants";
import {
  getOsDependencyMetadata,
  isOsDependencyMetadataIntact,
} from "../lib/product/m13/dependency-runtime/dependency.metadata";
import {
  assertProductOsDependencyReleaseGatePass,
  checkProductOsDependencyReleaseGate,
} from "../lib/product/m13/verify/os.dependency.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m13/dependency-runtime/dependency.constants.ts",
    "lib/product/m13/dependency-runtime/dependency.types.ts",
    "lib/product/m13/dependency-runtime/dependency.metadata.ts",
    "lib/product/m13/dependency-runtime/graph.registry.ts",
    "lib/product/m13/dependency-runtime/node.registry.ts",
    "lib/product/m13/dependency-runtime/edge.registry.ts",
    "lib/product/m13/dependency-runtime/dependency.manifest.ts",
    "lib/product/m13/verify/os.dependency.gate.ts",
    "lib/product/m13/index.ts",
    "lib/product/m13/catalog-runtime/catalog.constants.ts",
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
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P4+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_OS_DEPENDENCY_ID === "enterprise-product-os-dependency-v1",
    "os dependency id",
  );
  check(
    PRODUCT_OS_DEPENDENCY_VERSION === "product-os-dependency-1",
    "os dependency version",
  );
  check(
    PRODUCT_OS_DEPENDENCY_FREEZE_VERSION === "product-os-dependency-freeze-1",
    "os dependency freeze",
  );
  check(
    PRODUCT_OS_DEPENDENCY_BASE === PRODUCT_OS_CATALOG_ID,
    "os dependency base = os catalog",
  );
  check(
    PRODUCT_OS_DEPENDENCY_FREEZE_TAG === "product-os-dependency-freeze-1",
    "os dependency freeze tag",
  );
  check(
    PRODUCT_OS_CATALOG_ID === "enterprise-product-os-catalog-v1",
    "os catalog preserved",
  );
  check(OS_DEPENDENCY_GRAPH_KINDS.length === 4, "graph kinds");
  check(OS_DEPENDENCY_GRAPH_STATUSES.length === 4, "graph statuses");
  check(OS_DEPENDENCY_NODE_STATUSES.length === 4, "node statuses");
  check(OS_DEPENDENCY_EDGE_STATUSES.length === 3, "edge statuses");
  check(OS_DEPENDENCY_IMPACTS.length === 4, "impacts");
  check(OS_DEPENDENCY_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isOsDependencyMetadataIntact(getOsDependencyMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductOsDependencyReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductOsDependencyReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log(
    "=== Product Enterprise Operating System Dependency (M13-P3) ===",
  );
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

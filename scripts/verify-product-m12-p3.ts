/**
 * Product M12 — P3 Agent Dependency verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_AGENT_CATALOG_ID } from "../lib/product/m12/catalog/catalog.constants";
import {
  AGENT_DEPENDENCY_EDGE_STATUSES,
  AGENT_DEPENDENCY_GRAPH_KINDS,
  AGENT_DEPENDENCY_GRAPH_STATUSES,
  AGENT_DEPENDENCY_IMPACTS,
  AGENT_DEPENDENCY_NODE_STATUSES,
  AGENT_DEPENDENCY_READINESS_VERDICTS,
  PRODUCT_AGENT_DEPENDENCY_BASE,
  PRODUCT_AGENT_DEPENDENCY_FREEZE_TAG,
  PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_AGENT_DEPENDENCY_ID,
  PRODUCT_AGENT_DEPENDENCY_VERSION,
} from "../lib/product/m12/dependency-runtime/dependency.constants";
import {
  getAgentDependencyMetadata,
  isAgentDependencyMetadataIntact,
} from "../lib/product/m12/dependency-runtime/dependency.metadata";
import {
  assertProductAgentDependencyReleaseGatePass,
  checkProductAgentDependencyReleaseGate,
} from "../lib/product/m12/verify/agent.dependency.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m12/dependency-runtime/dependency.constants.ts",
    "lib/product/m12/dependency-runtime/dependency.types.ts",
    "lib/product/m12/dependency-runtime/dependency.metadata.ts",
    "lib/product/m12/dependency-runtime/graph.registry.ts",
    "lib/product/m12/dependency-runtime/node.registry.ts",
    "lib/product/m12/dependency-runtime/edge.registry.ts",
    "lib/product/m12/dependency-runtime/dependency.manifest.ts",
    "lib/product/m12/verify/agent.dependency.gate.ts",
    "lib/product/m12/index.ts",
    "lib/product/m12/catalog/catalog.constants.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }

  const forbidden = [
    "lib/product/m12/vector",
    "lib/product/m12/rag",
    "lib/product/m12/embedding",
    "lib/product/m12/provider",
    "lib/product/m12/db",
    "lib/product/m12/runtime",
    "lib/product/m12/execution",
    "lib/product/m12/tool",
    "lib/product/m12/dependency",
    "lib/product/m12/policy",
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P4+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AGENT_DEPENDENCY_ID === "enterprise-product-agent-dependency-v1",
    "agent dependency id",
  );
  check(
    PRODUCT_AGENT_DEPENDENCY_VERSION === "product-agent-dependency-1",
    "agent dependency version",
  );
  check(
    PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION ===
      "product-agent-dependency-freeze-1",
    "agent dependency freeze",
  );
  check(
    PRODUCT_AGENT_DEPENDENCY_BASE === PRODUCT_AGENT_CATALOG_ID,
    "agent dependency base = agent catalog",
  );
  check(
    PRODUCT_AGENT_DEPENDENCY_FREEZE_TAG ===
      "product-agent-dependency-freeze-1",
    "agent dependency freeze tag",
  );
  check(
    PRODUCT_AGENT_CATALOG_ID === "enterprise-product-agent-catalog-v1",
    "agent catalog preserved",
  );
  check(AGENT_DEPENDENCY_GRAPH_KINDS.length === 4, "graph kinds");
  check(AGENT_DEPENDENCY_GRAPH_STATUSES.length === 4, "graph statuses");
  check(AGENT_DEPENDENCY_NODE_STATUSES.length === 4, "node statuses");
  check(AGENT_DEPENDENCY_EDGE_STATUSES.length === 3, "edge statuses");
  check(AGENT_DEPENDENCY_IMPACTS.length === 4, "impacts");
  check(AGENT_DEPENDENCY_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isAgentDependencyMetadataIntact(getAgentDependencyMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAgentDependencyReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAgentDependencyReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Agent Platform Dependency (M12-P3) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

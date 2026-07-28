/**
 * Product M12 — P2 Agent Catalog verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_AGENT_FOUNDATION_ID } from "../lib/product/m12/foundation/agent.constants";
import {
  AGENT_CATALOG_BINDING_STATUSES,
  AGENT_CATALOG_ENTRY_STATUSES,
  AGENT_CATALOG_KINDS,
  AGENT_CATALOG_READINESS_VERDICTS,
  AGENT_CATALOG_STATUSES,
  PRODUCT_AGENT_CATALOG_BASE,
  PRODUCT_AGENT_CATALOG_FREEZE_TAG,
  PRODUCT_AGENT_CATALOG_FREEZE_VERSION,
  PRODUCT_AGENT_CATALOG_ID,
  PRODUCT_AGENT_CATALOG_VERSION,
} from "../lib/product/m12/catalog/catalog.constants";
import {
  getAgentCatalogMetadata,
  isAgentCatalogMetadataIntact,
} from "../lib/product/m12/catalog/catalog.metadata";
import {
  assertProductAgentCatalogReleaseGatePass,
  checkProductAgentCatalogReleaseGate,
} from "../lib/product/m12/verify/agent.catalog.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/m12/catalog/catalog.constants.ts",
    "lib/product/m12/catalog/catalog.types.ts",
    "lib/product/m12/catalog/catalog.metadata.ts",
    "lib/product/m12/catalog/catalog.registry.ts",
    "lib/product/m12/catalog/entry.registry.ts",
    "lib/product/m12/catalog/binding.registry.ts",
    "lib/product/m12/catalog/catalog.manifest.ts",
    "lib/product/m12/verify/agent.catalog.gate.ts",
    "lib/product/m12/index.ts",
    "lib/product/m12/foundation/agent.constants.ts",
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
  ];
  for (const rel of forbidden) {
    check(!fs.existsSync(path.join(ROOT, rel)), `unexpected P3+ path: ${rel}`);
  }

  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AGENT_CATALOG_ID === "enterprise-product-agent-catalog-v1",
    "agent catalog id",
  );
  check(
    PRODUCT_AGENT_CATALOG_VERSION === "product-agent-catalog-1",
    "agent catalog version",
  );
  check(
    PRODUCT_AGENT_CATALOG_FREEZE_VERSION === "product-agent-catalog-freeze-1",
    "agent catalog freeze",
  );
  check(
    PRODUCT_AGENT_CATALOG_BASE === PRODUCT_AGENT_FOUNDATION_ID,
    "agent catalog base = agent foundation",
  );
  check(
    PRODUCT_AGENT_CATALOG_FREEZE_TAG === "product-agent-catalog-freeze-1",
    "agent catalog freeze tag",
  );
  check(
    PRODUCT_AGENT_FOUNDATION_ID === "enterprise-product-agent-foundation-v1",
    "agent foundation preserved",
  );
  check(AGENT_CATALOG_KINDS.length === 4, "catalog kinds");
  check(AGENT_CATALOG_STATUSES.length === 4, "catalog statuses");
  check(AGENT_CATALOG_ENTRY_STATUSES.length === 4, "entry statuses");
  check(AGENT_CATALOG_BINDING_STATUSES.length === 3, "binding statuses");
  check(AGENT_CATALOG_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(
    isAgentCatalogMetadataIntact(getAgentCatalogMetadata()),
    "metadata",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAgentCatalogReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAgentCatalogReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product AI Agent Platform Catalog (M12-P2) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

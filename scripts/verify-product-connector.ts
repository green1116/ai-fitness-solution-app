/**
 * Product Connector — M08-P2 Connector Framework verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_API_BASELINE_ID } from "../lib/product/api-baseline/freeze/freeze.lock";
import { PRODUCT_MARKETPLACE_FOUNDATION_ID } from "../lib/product/marketplace/management/management.constants";
import {
  CONNECTOR_BINDING_STATUSES,
  CONNECTOR_CONTRACT_KINDS,
  CONNECTOR_KINDS,
  CONNECTOR_MANAGER_STATUSES,
  CONNECTOR_READINESS_VERDICTS,
  CONNECTOR_STATUSES,
  PRODUCT_CONNECTOR_FRAMEWORK_BASE,
  PRODUCT_CONNECTOR_FRAMEWORK_FREEZE_VERSION,
  PRODUCT_CONNECTOR_FRAMEWORK_ID,
  PRODUCT_CONNECTOR_FRAMEWORK_VERSION,
  PRODUCT_CONNECTOR_FREEZE_TAG,
} from "../lib/product/connector/management/management.constants";
import {
  assertProductConnectorReleaseGatePass,
  checkProductConnectorReleaseGate,
} from "../lib/product/connector/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/connector/management/management.constants.ts",
    "lib/product/connector/management/management.types.ts",
    "lib/product/connector/management/management.readiness.ts",
    "lib/product/connector/registry/connector.types.ts",
    "lib/product/connector/registry/connector.registry.ts",
    "lib/product/connector/definition/definition.types.ts",
    "lib/product/connector/definition/definition.registry.ts",
    "lib/product/connector/contract/contract.types.ts",
    "lib/product/connector/contract/contract.registry.ts",
    "lib/product/connector/binding/binding.types.ts",
    "lib/product/connector/binding/binding.registry.ts",
    "lib/product/connector/manifest/manifest.registry.ts",
    "lib/product/connector/connector.manager.ts",
    "lib/product/connector/verify/product.release.gate.ts",
    "lib/product/connector/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_CONNECTOR_FRAMEWORK_ID ===
      "enterprise-product-connector-framework-v1",
    "connector framework id",
  );
  check(
    PRODUCT_CONNECTOR_FRAMEWORK_VERSION === "product-connector-1",
    "connector framework version",
  );
  check(
    PRODUCT_CONNECTOR_FRAMEWORK_FREEZE_VERSION ===
      "product-connector-framework-freeze-1",
    "connector framework freeze",
  );
  check(
    PRODUCT_CONNECTOR_FRAMEWORK_BASE === PRODUCT_MARKETPLACE_FOUNDATION_ID,
    "connector base = marketplace foundation",
  );
  check(
    PRODUCT_CONNECTOR_FREEZE_TAG === "product-connector-framework-freeze-1",
    "connector freeze tag",
  );
  check(
    PRODUCT_MARKETPLACE_FOUNDATION_ID ===
      "enterprise-product-marketplace-foundation-v1",
    "marketplace foundation preserved",
  );
  check(
    ENTERPRISE_PRODUCT_API_BASELINE_ID ===
      "enterprise-product-api-baseline-v1",
    "api baseline preserved",
  );
  check(CONNECTOR_KINDS.length === 4, "connector kinds");
  check(CONNECTOR_STATUSES.length === 4, "connector statuses");
  check(CONNECTOR_CONTRACT_KINDS.length === 3, "contract kinds");
  check(CONNECTOR_BINDING_STATUSES.length === 3, "binding statuses");
  check(CONNECTOR_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(CONNECTOR_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductConnectorReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductConnectorReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Connector Framework (M08-P2) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

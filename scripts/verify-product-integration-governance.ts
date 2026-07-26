/**
 * Product Integration Governance — M08-P6 verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import {
  INTEGRATION_GOVERNANCE_COMPLIANCE_VERDICTS,
  INTEGRATION_GOVERNANCE_MANAGER_STATUSES,
  INTEGRATION_GOVERNANCE_POLICY_KINDS,
  INTEGRATION_GOVERNANCE_POLICY_STATUSES,
  INTEGRATION_GOVERNANCE_READINESS_VERDICTS,
  INTEGRATION_GOVERNANCE_REVIEW_VERDICTS,
  INTEGRATION_GOVERNANCE_STANDARD_LEVELS,
  PRODUCT_INTEGRATION_GOVERNANCE_BASE,
  PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_TAG,
  PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_INTEGRATION_GOVERNANCE_ID,
  PRODUCT_INTEGRATION_GOVERNANCE_VERSION,
} from "../lib/product/integration-governance/management/management.constants";
import {
  assertProductIntegrationGovernanceReleaseGatePass,
  checkProductIntegrationGovernanceReleaseGate,
} from "../lib/product/integration-governance/verify/product.release.gate";
import { PRODUCT_MARKETPLACE_SURFACE_ID } from "../lib/product/marketplace-surface/management/management.constants";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/integration-governance/management/management.constants.ts",
    "lib/product/integration-governance/management/management.types.ts",
    "lib/product/integration-governance/management/management.readiness.ts",
    "lib/product/integration-governance/policy/policy.types.ts",
    "lib/product/integration-governance/policy/policy.registry.ts",
    "lib/product/integration-governance/standard/standard.types.ts",
    "lib/product/integration-governance/standard/standard.registry.ts",
    "lib/product/integration-governance/review/review.types.ts",
    "lib/product/integration-governance/review/review.registry.ts",
    "lib/product/integration-governance/compliance/compliance.types.ts",
    "lib/product/integration-governance/compliance/compliance.registry.ts",
    "lib/product/integration-governance/manifest/manifest.registry.ts",
    "lib/product/integration-governance/integration-governance.manager.ts",
    "lib/product/integration-governance/verify/product.release.gate.ts",
    "lib/product/integration-governance/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_INTEGRATION_GOVERNANCE_ID ===
      "enterprise-product-integration-governance-v1",
    "integration governance id",
  );
  check(
    PRODUCT_INTEGRATION_GOVERNANCE_VERSION ===
      "product-integration-governance-1",
    "integration governance version",
  );
  check(
    PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_VERSION ===
      "product-integration-governance-freeze-1",
    "integration governance freeze",
  );
  check(
    PRODUCT_INTEGRATION_GOVERNANCE_BASE === PRODUCT_MARKETPLACE_SURFACE_ID,
    "integration governance base = marketplace surface",
  );
  check(
    PRODUCT_INTEGRATION_GOVERNANCE_FREEZE_TAG ===
      "product-integration-governance-freeze-1",
    "integration governance freeze tag",
  );
  check(
    PRODUCT_MARKETPLACE_SURFACE_ID ===
      "enterprise-product-marketplace-surface-v1",
    "marketplace surface preserved",
  );
  check(INTEGRATION_GOVERNANCE_POLICY_KINDS.length === 4, "policy kinds");
  check(INTEGRATION_GOVERNANCE_POLICY_STATUSES.length === 3, "policy statuses");
  check(
    INTEGRATION_GOVERNANCE_STANDARD_LEVELS.length === 3,
    "standard levels",
  );
  check(INTEGRATION_GOVERNANCE_REVIEW_VERDICTS.length === 3, "review verdicts");
  check(
    INTEGRATION_GOVERNANCE_COMPLIANCE_VERDICTS.length === 3,
    "compliance verdicts",
  );
  check(
    INTEGRATION_GOVERNANCE_READINESS_VERDICTS.length === 3,
    "readiness verdicts",
  );
  check(
    INTEGRATION_GOVERNANCE_MANAGER_STATUSES.length === 4,
    "manager statuses",
  );
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductIntegrationGovernanceReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductIntegrationGovernanceReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Integration Governance (M08-P6) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

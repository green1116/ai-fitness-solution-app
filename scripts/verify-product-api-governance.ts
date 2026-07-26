/**
 * Product API Governance — M07-P6 verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_API_FOUNDATION_ID } from "../lib/product/api/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../lib/product/api-authentication/management/management.constants";
import { PRODUCT_API_GATEWAY_ID } from "../lib/product/api-gateway/management/management.constants";
import { PRODUCT_API_PORTAL_ID } from "../lib/product/api-portal/management/management.constants";
import { PRODUCT_API_SDK_ID } from "../lib/product/api-sdk/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../lib/product/auth/freeze/freeze.lock";
import {
  GOVERNANCE_COMPLIANCE_VERDICTS,
  GOVERNANCE_MANAGER_STATUSES,
  GOVERNANCE_POLICY_KINDS,
  GOVERNANCE_POLICY_STATUSES,
  GOVERNANCE_READINESS_VERDICTS,
  GOVERNANCE_REVIEW_VERDICTS,
  GOVERNANCE_STANDARD_LEVELS,
  PRODUCT_API_GOVERNANCE_BASE,
  PRODUCT_API_GOVERNANCE_FREEZE_TAG,
  PRODUCT_API_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_API_GOVERNANCE_ID,
  PRODUCT_API_GOVERNANCE_VERSION,
} from "../lib/product/api-governance/management/management.constants";
import {
  assertProductApiGovernanceReleaseGatePass,
  checkProductApiGovernanceReleaseGate,
} from "../lib/product/api-governance/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/api-governance/management/management.constants.ts",
    "lib/product/api-governance/management/management.types.ts",
    "lib/product/api-governance/management/management.readiness.ts",
    "lib/product/api-governance/policy/policy.types.ts",
    "lib/product/api-governance/policy/policy.registry.ts",
    "lib/product/api-governance/standard/standard.types.ts",
    "lib/product/api-governance/standard/standard.registry.ts",
    "lib/product/api-governance/review/review.types.ts",
    "lib/product/api-governance/review/review.registry.ts",
    "lib/product/api-governance/compliance/compliance.types.ts",
    "lib/product/api-governance/compliance/compliance.registry.ts",
    "lib/product/api-governance/manifest/manifest.registry.ts",
    "lib/product/api-governance/api-governance.manager.ts",
    "lib/product/api-governance/verify/product.release.gate.ts",
    "lib/product/api-governance/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_API_GOVERNANCE_ID === "enterprise-product-api-governance-v1",
    "api governance id",
  );
  check(
    PRODUCT_API_GOVERNANCE_VERSION === "product-api-governance-1",
    "api governance version",
  );
  check(
    PRODUCT_API_GOVERNANCE_FREEZE_VERSION ===
      "product-api-governance-freeze-1",
    "api governance freeze",
  );
  check(
    PRODUCT_API_GOVERNANCE_BASE === PRODUCT_API_PORTAL_ID,
    "api governance base = api portal",
  );
  check(
    PRODUCT_API_GOVERNANCE_FREEZE_TAG === "product-api-governance-freeze-1",
    "api governance freeze tag",
  );
  check(
    PRODUCT_API_PORTAL_ID === "enterprise-product-api-portal-v1",
    "api portal preserved",
  );
  check(
    PRODUCT_API_SDK_ID === "enterprise-product-api-sdk-v1",
    "api sdk preserved",
  );
  check(
    PRODUCT_API_GATEWAY_ID === "enterprise-product-api-gateway-v1",
    "api gateway preserved",
  );
  check(
    PRODUCT_API_AUTHENTICATION_ID ===
      "enterprise-product-api-authentication-v1",
    "api authentication preserved",
  );
  check(
    PRODUCT_API_FOUNDATION_ID === "enterprise-product-api-foundation-v1",
    "api foundation preserved",
  );
  check(
    ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
      "enterprise-product-auth-baseline-v1",
    "auth baseline preserved",
  );
  check(GOVERNANCE_POLICY_KINDS.length === 4, "policy kinds");
  check(GOVERNANCE_POLICY_STATUSES.length === 3, "policy statuses");
  check(GOVERNANCE_STANDARD_LEVELS.length === 3, "standard levels");
  check(GOVERNANCE_REVIEW_VERDICTS.length === 3, "review verdicts");
  check(GOVERNANCE_COMPLIANCE_VERDICTS.length === 3, "compliance verdicts");
  check(GOVERNANCE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(GOVERNANCE_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductApiGovernanceReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductApiGovernanceReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product API Governance (M07-P6) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

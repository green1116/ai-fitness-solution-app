/**
 * Product API Audit — M07-P7 verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_API_FOUNDATION_ID } from "../lib/product/api/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../lib/product/api-authentication/management/management.constants";
import { PRODUCT_API_GATEWAY_ID } from "../lib/product/api-gateway/management/management.constants";
import { PRODUCT_API_GOVERNANCE_ID } from "../lib/product/api-governance/management/management.constants";
import { PRODUCT_API_PORTAL_ID } from "../lib/product/api-portal/management/management.constants";
import { PRODUCT_API_SDK_ID } from "../lib/product/api-sdk/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../lib/product/auth/freeze/freeze.lock";
import {
  API_AUDIT_CATEGORIES,
  API_AUDIT_INTEGRITY_VERDICTS,
  API_AUDIT_MANAGER_STATUSES,
  API_AUDIT_READINESS_VERDICTS,
  API_AUDIT_SEVERITIES,
  API_AUDIT_TRAIL_STATUSES,
  PRODUCT_API_AUDIT_BASE,
  PRODUCT_API_AUDIT_FREEZE_TAG,
  PRODUCT_API_AUDIT_FREEZE_VERSION,
  PRODUCT_API_AUDIT_ID,
  PRODUCT_API_AUDIT_VERSION,
} from "../lib/product/api-audit/management/management.constants";
import {
  assertProductApiAuditReleaseGatePass,
  checkProductApiAuditReleaseGate,
} from "../lib/product/api-audit/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/api-audit/management/management.constants.ts",
    "lib/product/api-audit/management/management.types.ts",
    "lib/product/api-audit/management/management.readiness.ts",
    "lib/product/api-audit/event/event.types.ts",
    "lib/product/api-audit/event/event.registry.ts",
    "lib/product/api-audit/trail/trail.types.ts",
    "lib/product/api-audit/trail/trail.registry.ts",
    "lib/product/api-audit/query/query.types.ts",
    "lib/product/api-audit/query/query.registry.ts",
    "lib/product/api-audit/integrity/integrity.types.ts",
    "lib/product/api-audit/integrity/integrity.registry.ts",
    "lib/product/api-audit/manifest/manifest.registry.ts",
    "lib/product/api-audit/api-audit.manager.ts",
    "lib/product/api-audit/verify/product.release.gate.ts",
    "lib/product/api-audit/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_API_AUDIT_ID === "enterprise-product-api-audit-v1",
    "api audit id",
  );
  check(
    PRODUCT_API_AUDIT_VERSION === "product-api-audit-1",
    "api audit version",
  );
  check(
    PRODUCT_API_AUDIT_FREEZE_VERSION === "product-api-audit-freeze-1",
    "api audit freeze",
  );
  check(
    PRODUCT_API_AUDIT_BASE === PRODUCT_API_GOVERNANCE_ID,
    "api audit base = api governance",
  );
  check(
    PRODUCT_API_AUDIT_FREEZE_TAG === "product-api-audit-freeze-1",
    "api audit freeze tag",
  );
  check(
    PRODUCT_API_GOVERNANCE_ID === "enterprise-product-api-governance-v1",
    "api governance preserved",
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
  check(API_AUDIT_CATEGORIES.length === 6, "audit categories");
  check(API_AUDIT_SEVERITIES.length === 3, "audit severities");
  check(API_AUDIT_TRAIL_STATUSES.length === 2, "trail statuses");
  check(API_AUDIT_INTEGRITY_VERDICTS.length === 3, "integrity verdicts");
  check(API_AUDIT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(API_AUDIT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductApiAuditReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductApiAuditReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product API Audit (M07-P7) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

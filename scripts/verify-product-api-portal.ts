/**
 * Product API Portal — M07-P5 verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_API_FOUNDATION_ID } from "../lib/product/api/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../lib/product/api-authentication/management/management.constants";
import { PRODUCT_API_GATEWAY_ID } from "../lib/product/api-gateway/management/management.constants";
import { PRODUCT_API_SDK_ID } from "../lib/product/api-sdk/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../lib/product/auth/freeze/freeze.lock";
import {
  PORTAL_CATALOG_STATUSES,
  PORTAL_DOC_KINDS,
  PORTAL_MANAGER_STATUSES,
  PORTAL_READINESS_VERDICTS,
  PORTAL_STATUSES,
  PORTAL_SURFACE_KINDS,
  PRODUCT_API_PORTAL_BASE,
  PRODUCT_API_PORTAL_FREEZE_TAG,
  PRODUCT_API_PORTAL_FREEZE_VERSION,
  PRODUCT_API_PORTAL_ID,
  PRODUCT_API_PORTAL_VERSION,
} from "../lib/product/api-portal/management/management.constants";
import {
  assertProductApiPortalReleaseGatePass,
  checkProductApiPortalReleaseGate,
} from "../lib/product/api-portal/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/api-portal/management/management.constants.ts",
    "lib/product/api-portal/management/management.types.ts",
    "lib/product/api-portal/management/management.readiness.ts",
    "lib/product/api-portal/registry/portal.types.ts",
    "lib/product/api-portal/registry/portal.registry.ts",
    "lib/product/api-portal/documentation/documentation.types.ts",
    "lib/product/api-portal/documentation/documentation.registry.ts",
    "lib/product/api-portal/catalog/catalog.types.ts",
    "lib/product/api-portal/catalog/catalog.registry.ts",
    "lib/product/api-portal/surface/surface.types.ts",
    "lib/product/api-portal/surface/surface.registry.ts",
    "lib/product/api-portal/manifest/manifest.registry.ts",
    "lib/product/api-portal/api-portal.manager.ts",
    "lib/product/api-portal/verify/product.release.gate.ts",
    "lib/product/api-portal/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_API_PORTAL_ID === "enterprise-product-api-portal-v1",
    "api portal id",
  );
  check(
    PRODUCT_API_PORTAL_VERSION === "product-api-portal-1",
    "api portal version",
  );
  check(
    PRODUCT_API_PORTAL_FREEZE_VERSION === "product-api-portal-freeze-1",
    "api portal freeze",
  );
  check(
    PRODUCT_API_PORTAL_BASE === PRODUCT_API_SDK_ID,
    "api portal base = api sdk",
  );
  check(
    PRODUCT_API_PORTAL_FREEZE_TAG === "product-api-portal-freeze-1",
    "api portal freeze tag",
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
  check(PORTAL_STATUSES.length === 3, "portal statuses");
  check(PORTAL_DOC_KINDS.length === 4, "doc kinds");
  check(PORTAL_CATALOG_STATUSES.length === 3, "catalog statuses");
  check(PORTAL_SURFACE_KINDS.length === 4, "surface kinds");
  check(PORTAL_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(PORTAL_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductApiPortalReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductApiPortalReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product API Portal (M07-P5) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

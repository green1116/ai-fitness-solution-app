/**
 * Product API SDK — M07-P4 verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_API_FOUNDATION_ID } from "../lib/product/api/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../lib/product/api-authentication/management/management.constants";
import { PRODUCT_API_GATEWAY_ID } from "../lib/product/api-gateway/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../lib/product/auth/freeze/freeze.lock";
import {
  PRODUCT_API_SDK_BASE,
  PRODUCT_API_SDK_FREEZE_TAG,
  PRODUCT_API_SDK_FREEZE_VERSION,
  PRODUCT_API_SDK_ID,
  PRODUCT_API_SDK_VERSION,
  SDK_CLIENT_KINDS,
  SDK_CLIENT_STATUSES,
  SDK_MANAGER_STATUSES,
  SDK_OPERATION_METHODS,
  SDK_PACKAGE_STATUSES,
  SDK_READINESS_VERDICTS,
  SDK_SCHEMA_KINDS,
} from "../lib/product/api-sdk/management/management.constants";
import {
  assertProductApiSdkReleaseGatePass,
  checkProductApiSdkReleaseGate,
} from "../lib/product/api-sdk/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/api-sdk/management/management.constants.ts",
    "lib/product/api-sdk/management/management.types.ts",
    "lib/product/api-sdk/management/management.readiness.ts",
    "lib/product/api-sdk/client/client.types.ts",
    "lib/product/api-sdk/client/client.registry.ts",
    "lib/product/api-sdk/operation/operation.types.ts",
    "lib/product/api-sdk/operation/operation.registry.ts",
    "lib/product/api-sdk/schema/schema.types.ts",
    "lib/product/api-sdk/schema/schema.registry.ts",
    "lib/product/api-sdk/package/package.types.ts",
    "lib/product/api-sdk/package/package.registry.ts",
    "lib/product/api-sdk/manifest/manifest.registry.ts",
    "lib/product/api-sdk/api-sdk.manager.ts",
    "lib/product/api-sdk/verify/product.release.gate.ts",
    "lib/product/api-sdk/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_API_SDK_ID === "enterprise-product-api-sdk-v1",
    "api sdk id",
  );
  check(PRODUCT_API_SDK_VERSION === "product-api-sdk-1", "api sdk version");
  check(
    PRODUCT_API_SDK_FREEZE_VERSION === "product-api-sdk-freeze-1",
    "api sdk freeze",
  );
  check(
    PRODUCT_API_SDK_BASE === PRODUCT_API_GATEWAY_ID,
    "api sdk base = api gateway",
  );
  check(
    PRODUCT_API_SDK_FREEZE_TAG === "product-api-sdk-freeze-1",
    "api sdk freeze tag",
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
  check(SDK_CLIENT_KINDS.length === 3, "client kinds");
  check(SDK_CLIENT_STATUSES.length === 3, "client statuses");
  check(SDK_OPERATION_METHODS.length === 5, "operation methods");
  check(SDK_SCHEMA_KINDS.length === 2, "schema kinds");
  check(SDK_PACKAGE_STATUSES.length === 3, "package statuses");
  check(SDK_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(SDK_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductApiSdkReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductApiSdkReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product API SDK (M07-P4) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

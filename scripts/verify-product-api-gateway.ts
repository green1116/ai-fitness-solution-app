/**
 * Product API Gateway — M07-P3 verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_API_FOUNDATION_ID } from "../lib/product/api/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../lib/product/api-authentication/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../lib/product/auth/freeze/freeze.lock";
import {
  GATEWAY_HTTP_METHODS,
  GATEWAY_MANAGER_STATUSES,
  GATEWAY_POLICY_MODES,
  GATEWAY_READINESS_VERDICTS,
  GATEWAY_STATUSES,
  GATEWAY_VALIDATION_VERDICTS,
  PRODUCT_API_GATEWAY_BASE,
  PRODUCT_API_GATEWAY_FREEZE_TAG,
  PRODUCT_API_GATEWAY_FREEZE_VERSION,
  PRODUCT_API_GATEWAY_ID,
  PRODUCT_API_GATEWAY_VERSION,
} from "../lib/product/api-gateway/management/management.constants";
import {
  assertProductApiGatewayReleaseGatePass,
  checkProductApiGatewayReleaseGate,
} from "../lib/product/api-gateway/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/api-gateway/management/management.constants.ts",
    "lib/product/api-gateway/management/management.types.ts",
    "lib/product/api-gateway/management/management.readiness.ts",
    "lib/product/api-gateway/registry/gateway.types.ts",
    "lib/product/api-gateway/registry/gateway.registry.ts",
    "lib/product/api-gateway/route/route.types.ts",
    "lib/product/api-gateway/route/route.registry.ts",
    "lib/product/api-gateway/policy/policy.types.ts",
    "lib/product/api-gateway/policy/policy.registry.ts",
    "lib/product/api-gateway/validation/validation.types.ts",
    "lib/product/api-gateway/validation/validation.registry.ts",
    "lib/product/api-gateway/manifest/manifest.registry.ts",
    "lib/product/api-gateway/api-gateway.manager.ts",
    "lib/product/api-gateway/verify/product.release.gate.ts",
    "lib/product/api-gateway/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_API_GATEWAY_ID === "enterprise-product-api-gateway-v1",
    "api gateway id",
  );
  check(
    PRODUCT_API_GATEWAY_VERSION === "product-api-gateway-1",
    "api gateway version",
  );
  check(
    PRODUCT_API_GATEWAY_FREEZE_VERSION === "product-api-gateway-freeze-1",
    "api gateway freeze",
  );
  check(
    PRODUCT_API_GATEWAY_BASE === PRODUCT_API_AUTHENTICATION_ID,
    "api gateway base = api authentication",
  );
  check(
    PRODUCT_API_GATEWAY_FREEZE_TAG === "product-api-gateway-freeze-1",
    "api gateway freeze tag",
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
  check(GATEWAY_STATUSES.length === 2, "gateway statuses");
  check(GATEWAY_HTTP_METHODS.length === 5, "http methods");
  check(GATEWAY_POLICY_MODES.length === 3, "policy modes");
  check(GATEWAY_VALIDATION_VERDICTS.length === 3, "validation verdicts");
  check(GATEWAY_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(GATEWAY_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductApiGatewayReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductApiGatewayReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product API Gateway (M07-P3) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

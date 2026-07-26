/**
 * Product API Authentication — M07-P2 verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { PRODUCT_API_FOUNDATION_ID } from "../lib/product/api/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../lib/product/auth/freeze/freeze.lock";
import {
  API_AUTH_MANAGER_STATUSES,
  API_AUTH_READINESS_VERDICTS,
  API_CREDENTIAL_KINDS,
  API_CREDENTIAL_STATUSES,
  API_TOKEN_VALIDATION_VERDICTS,
  PRODUCT_API_AUTHENTICATION_BASE,
  PRODUCT_API_AUTHENTICATION_FREEZE_TAG,
  PRODUCT_API_AUTHENTICATION_FREEZE_VERSION,
  PRODUCT_API_AUTHENTICATION_ID,
  PRODUCT_API_AUTHENTICATION_VERSION,
} from "../lib/product/api-authentication/management/management.constants";
import {
  assertProductApiAuthenticationReleaseGatePass,
  checkProductApiAuthenticationReleaseGate,
} from "../lib/product/api-authentication/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/api-authentication/management/management.constants.ts",
    "lib/product/api-authentication/management/management.types.ts",
    "lib/product/api-authentication/management/management.readiness.ts",
    "lib/product/api-authentication/credential/credential.types.ts",
    "lib/product/api-authentication/credential/credential.registry.ts",
    "lib/product/api-authentication/key/key.types.ts",
    "lib/product/api-authentication/key/key.registry.ts",
    "lib/product/api-authentication/token/token.types.ts",
    "lib/product/api-authentication/token/token.registry.ts",
    "lib/product/api-authentication/identity/identity.types.ts",
    "lib/product/api-authentication/identity/identity.registry.ts",
    "lib/product/api-authentication/context/context.types.ts",
    "lib/product/api-authentication/context/context.registry.ts",
    "lib/product/api-authentication/manifest/manifest.registry.ts",
    "lib/product/api-authentication/api-authentication.manager.ts",
    "lib/product/api-authentication/verify/product.release.gate.ts",
    "lib/product/api-authentication/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_API_AUTHENTICATION_ID ===
      "enterprise-product-api-authentication-v1",
    "api authentication id",
  );
  check(
    PRODUCT_API_AUTHENTICATION_VERSION === "product-api-authentication-1",
    "api authentication version",
  );
  check(
    PRODUCT_API_AUTHENTICATION_FREEZE_VERSION ===
      "product-api-authentication-freeze-1",
    "api authentication freeze",
  );
  check(
    PRODUCT_API_AUTHENTICATION_BASE === PRODUCT_API_FOUNDATION_ID,
    "api authentication base = api foundation",
  );
  check(
    PRODUCT_API_AUTHENTICATION_FREEZE_TAG ===
      "product-api-authentication-freeze-1",
    "api authentication freeze tag",
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
  check(API_CREDENTIAL_KINDS.length === 3, "credential kinds");
  check(API_CREDENTIAL_STATUSES.length === 3, "credential statuses");
  check(API_TOKEN_VALIDATION_VERDICTS.length === 3, "token verdicts");
  check(API_AUTH_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(API_AUTH_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductApiAuthenticationReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductApiAuthenticationReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product API Authentication (M07-P2) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

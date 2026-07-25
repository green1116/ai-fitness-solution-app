/**
 * Product Identity — Identity Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../lib/commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../lib/launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../lib/operations/o5/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../lib/product/complete/freeze/freeze.lock";
import { PRODUCT_ITERATION_FOUNDATION_ID } from "../lib/product/iteration/cycle/cycle.constants";
import {
  ACCESS_DECISIONS,
  AUTH_STATUSES,
  CREDENTIAL_KINDS,
  IDENTITY_MANAGER_STATUSES,
  IDENTITY_READINESS_VERDICTS,
  PRINCIPAL_KINDS,
  PRODUCT_IDENTITY_FOUNDATION_BASE,
  PRODUCT_IDENTITY_FOUNDATION_FREEZE_VERSION,
  PRODUCT_IDENTITY_FOUNDATION_ID,
  PRODUCT_IDENTITY_FOUNDATION_VERSION,
  PRODUCT_IDENTITY_FREEZE_VERSION,
  SESSION_STATUSES,
  TOKEN_KINDS,
} from "../lib/product/identity/authentication/authentication.constants";
import {
  assertProductIdentityReleaseGatePass,
  checkProductIdentityReleaseGate,
} from "../lib/product/identity/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/identity/authentication/authentication.constants.ts",
    "lib/product/identity/authentication/authentication.types.ts",
    "lib/product/identity/authentication/authentication.registry.ts",
    "lib/product/identity/authentication/authentication.readiness.ts",
    "lib/product/identity/principal/principal.types.ts",
    "lib/product/identity/principal/principal.registry.ts",
    "lib/product/identity/credential/credential.types.ts",
    "lib/product/identity/credential/credential.registry.ts",
    "lib/product/identity/session/session.types.ts",
    "lib/product/identity/session/session.registry.ts",
    "lib/product/identity/token/token.types.ts",
    "lib/product/identity/token/token.registry.ts",
    "lib/product/identity/access/access.types.ts",
    "lib/product/identity/access/access.registry.ts",
    "lib/product/identity/identity.manager.ts",
    "lib/product/identity/verify/product.release.gate.ts",
    "lib/product/identity/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_IDENTITY_FOUNDATION_ID ===
      "enterprise-product-identity-foundation-v1",
    "identity foundation id",
  );
  check(
    PRODUCT_IDENTITY_FOUNDATION_VERSION === "product-identity-1",
    "identity foundation version",
  );
  check(
    PRODUCT_IDENTITY_FOUNDATION_FREEZE_VERSION ===
      "product-identity-foundation-freeze-1",
    "identity foundation freeze",
  );
  check(
    PRODUCT_IDENTITY_FOUNDATION_BASE === PRODUCT_ITERATION_FOUNDATION_ID,
    "identity base = iteration foundation",
  );
  check(
    PRODUCT_IDENTITY_FREEZE_VERSION ===
      "product-identity-foundation-freeze-1",
    "identity freeze tag",
  );
  check(
    ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1",
    "product complete preserved",
  );
  check(
    ENTERPRISE_OPERATIONS_COMPLETE_ID === "enterprise-operations-complete-v1",
    "operations complete preserved",
  );
  check(
    ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
      "enterprise-launch-readiness-complete-v1",
    "launch readiness complete preserved",
  );
  check(
    ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
      "enterprise-commercialization-complete-v1",
    "commercialization complete preserved",
  );
  check(
    ENTERPRISE_EVOLUTION_COMPLETE_ID === "enterprise-evolution-complete-v1",
    "evolution complete preserved",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete preserved",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(AUTH_STATUSES.length === 5, "auth statuses");
  check(PRINCIPAL_KINDS.length === 4, "principal kinds");
  check(CREDENTIAL_KINDS.length === 4, "credential kinds");
  check(SESSION_STATUSES.length === 3, "session statuses");
  check(TOKEN_KINDS.length === 3, "token kinds");
  check(ACCESS_DECISIONS.length === 3, "access decisions");
  check(IDENTITY_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(IDENTITY_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductIdentityReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductIdentityReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Identity Foundation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

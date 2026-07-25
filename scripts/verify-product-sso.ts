/**
 * Product SSO — Enterprise SSO Federation verification
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
import { PRODUCT_AUTHORIZATION_RBAC_ID } from "../lib/product/authorization/rbac/rbac.constants";
import { PRODUCT_IDENTITY_FOUNDATION_ID } from "../lib/product/identity/authentication/authentication.constants";
import { PRODUCT_ITERATION_FOUNDATION_ID } from "../lib/product/iteration/cycle/cycle.constants";
import { PRODUCT_MFA_SECURITY_ID } from "../lib/product/mfa/factor/factor.constants";
import { PRODUCT_SESSION_CONTROL_ID } from "../lib/product/session/control/control.constants";
import {
  PRODUCT_SSO_FEDERATION_BASE,
  PRODUCT_SSO_FEDERATION_FREEZE_VERSION,
  PRODUCT_SSO_FEDERATION_ID,
  PRODUCT_SSO_FEDERATION_VERSION,
  PRODUCT_SSO_FREEZE_VERSION,
  SSO_ASSERTION_RESULTS,
  SSO_CONNECTION_STATUSES,
  SSO_MANAGER_STATUSES,
  SSO_PROVIDER_PROTOCOLS,
  SSO_PROVIDER_STATUSES,
  SSO_READINESS_VERDICTS,
} from "../lib/product/sso/federation/federation.constants";
import {
  assertProductSsoReleaseGatePass,
  checkProductSsoReleaseGate,
} from "../lib/product/sso/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/sso/federation/federation.constants.ts",
    "lib/product/sso/federation/federation.types.ts",
    "lib/product/sso/federation/federation.readiness.ts",
    "lib/product/sso/provider/provider.types.ts",
    "lib/product/sso/provider/provider.registry.ts",
    "lib/product/sso/connection/connection.types.ts",
    "lib/product/sso/connection/connection.registry.ts",
    "lib/product/sso/assertion/assertion.types.ts",
    "lib/product/sso/assertion/assertion.registry.ts",
    "lib/product/sso/exchange/exchange.types.ts",
    "lib/product/sso/exchange/exchange.registry.ts",
    "lib/product/sso/sso.manager.ts",
    "lib/product/sso/verify/product.release.gate.ts",
    "lib/product/sso/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_SSO_FEDERATION_ID === "enterprise-product-sso-federation-v1",
    "sso federation id",
  );
  check(
    PRODUCT_SSO_FEDERATION_VERSION === "product-sso-1",
    "sso federation version",
  );
  check(
    PRODUCT_SSO_FEDERATION_FREEZE_VERSION ===
      "product-sso-federation-freeze-1",
    "sso federation freeze",
  );
  check(
    PRODUCT_SSO_FEDERATION_BASE === PRODUCT_MFA_SECURITY_ID,
    "sso base = mfa security",
  );
  check(
    PRODUCT_SSO_FREEZE_VERSION === "product-sso-federation-freeze-1",
    "sso freeze tag",
  );
  check(
    PRODUCT_MFA_SECURITY_ID === "enterprise-product-mfa-security-v1",
    "mfa security preserved",
  );
  check(
    PRODUCT_SESSION_CONTROL_ID === "enterprise-product-session-control-v1",
    "session control preserved",
  );
  check(
    PRODUCT_AUTHORIZATION_RBAC_ID ===
      "enterprise-product-authorization-rbac-v1",
    "authorization rbac preserved",
  );
  check(
    PRODUCT_IDENTITY_FOUNDATION_ID ===
      "enterprise-product-identity-foundation-v1",
    "identity foundation preserved",
  );
  check(
    PRODUCT_ITERATION_FOUNDATION_ID ===
      "enterprise-product-iteration-foundation-v1",
    "iteration foundation preserved",
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
  check(SSO_PROVIDER_PROTOCOLS.length === 3, "provider protocols");
  check(SSO_PROVIDER_STATUSES.length === 3, "provider statuses");
  check(SSO_CONNECTION_STATUSES.length === 3, "connection statuses");
  check(SSO_ASSERTION_RESULTS.length === 2, "assertion results");
  check(SSO_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(SSO_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductSsoReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductSsoReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product SSO Federation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

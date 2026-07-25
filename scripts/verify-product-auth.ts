/**
 * Product Auth — Governance Freeze verification
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
import { PRODUCT_AUDIT_TRACEABILITY_ID } from "../lib/product/audit/security/security.constants";
import { PRODUCT_AUTHORIZATION_RBAC_ID } from "../lib/product/authorization/rbac/rbac.constants";
import { PRODUCT_IDENTITY_FOUNDATION_ID } from "../lib/product/identity/authentication/authentication.constants";
import { PRODUCT_MFA_SECURITY_ID } from "../lib/product/mfa/factor/factor.constants";
import { PRODUCT_SESSION_CONTROL_ID } from "../lib/product/session/control/control.constants";
import { PRODUCT_SSO_FEDERATION_ID } from "../lib/product/sso/federation/federation.constants";
import {
  ENTERPRISE_PRODUCT_AUTH_BASELINE_ID,
  isProductAuthFreezeLockIntact,
  PRODUCT_AUTH_BASELINE_ID,
  PRODUCT_AUTH_COMPONENT_LOCK,
  PRODUCT_AUTH_FREEZE_BASE,
  PRODUCT_AUTH_FREEZE_LOCK,
  PRODUCT_AUTH_FREEZE_VERSION,
} from "../lib/product/auth/freeze/freeze.lock";
import {
  assertProductAuthReleaseGatePass,
  checkProductAuthReleaseGate,
} from "../lib/product/auth/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/auth/freeze/freeze.lock.ts",
    "lib/product/auth/verify/product.release.gate.ts",
    "lib/product/auth/index.ts",
    "lib/product/identity/index.ts",
    "lib/product/authorization/index.ts",
    "lib/product/session/index.ts",
    "lib/product/mfa/index.ts",
    "lib/product/sso/index.ts",
    "lib/product/audit/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AUTH_BASELINE_ID === "enterprise-product-auth-baseline-v1",
    "auth baseline id",
  );
  check(
    ENTERPRISE_PRODUCT_AUTH_BASELINE_ID === PRODUCT_AUTH_BASELINE_ID,
    "auth baseline alias",
  );
  check(
    PRODUCT_AUTH_FREEZE_VERSION === "product-auth-baseline-freeze-1",
    "auth freeze version",
  );
  check(
    PRODUCT_AUTH_FREEZE_BASE === PRODUCT_AUDIT_TRACEABILITY_ID,
    "auth freeze base = audit",
  );
  check(
    isProductAuthFreezeLockIntact(PRODUCT_AUTH_FREEZE_LOCK),
    "auth freeze lock intact",
  );
  check(PRODUCT_AUTH_COMPONENT_LOCK.length === 7, "auth components");
  check(
    PRODUCT_IDENTITY_FOUNDATION_ID ===
      "enterprise-product-identity-foundation-v1",
    "identity preserved",
  );
  check(
    PRODUCT_AUTHORIZATION_RBAC_ID ===
      "enterprise-product-authorization-rbac-v1",
    "authorization preserved",
  );
  check(
    PRODUCT_SESSION_CONTROL_ID === "enterprise-product-session-control-v1",
    "session preserved",
  );
  check(
    PRODUCT_MFA_SECURITY_ID === "enterprise-product-mfa-security-v1",
    "mfa preserved",
  );
  check(
    PRODUCT_SSO_FEDERATION_ID === "enterprise-product-sso-federation-v1",
    "sso preserved",
  );
  check(
    PRODUCT_AUDIT_TRACEABILITY_ID ===
      "enterprise-product-audit-traceability-v1",
    "audit preserved",
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
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAuthReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAuthReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Auth Governance Freeze ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

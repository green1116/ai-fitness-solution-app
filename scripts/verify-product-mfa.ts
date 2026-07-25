/**
 * Product MFA — Multi-Factor Authentication verification
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
import { PRODUCT_SESSION_CONTROL_ID } from "../lib/product/session/control/control.constants";
import {
  MFA_ASSERTION_RESULTS,
  MFA_CHALLENGE_STATUSES,
  MFA_ENROLLMENT_STATUSES,
  MFA_FACTOR_KINDS,
  MFA_MANAGER_STATUSES,
  MFA_READINESS_VERDICTS,
  PRODUCT_MFA_FREEZE_VERSION,
  PRODUCT_MFA_SECURITY_BASE,
  PRODUCT_MFA_SECURITY_FREEZE_VERSION,
  PRODUCT_MFA_SECURITY_ID,
  PRODUCT_MFA_SECURITY_VERSION,
} from "../lib/product/mfa/factor/factor.constants";
import {
  assertProductMfaReleaseGatePass,
  checkProductMfaReleaseGate,
} from "../lib/product/mfa/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/mfa/factor/factor.constants.ts",
    "lib/product/mfa/factor/factor.types.ts",
    "lib/product/mfa/factor/factor.readiness.ts",
    "lib/product/mfa/enrollment/enrollment.types.ts",
    "lib/product/mfa/enrollment/enrollment.registry.ts",
    "lib/product/mfa/challenge/challenge.types.ts",
    "lib/product/mfa/challenge/challenge.registry.ts",
    "lib/product/mfa/assertion/assertion.types.ts",
    "lib/product/mfa/assertion/assertion.registry.ts",
    "lib/product/mfa/recovery/recovery.types.ts",
    "lib/product/mfa/recovery/recovery.registry.ts",
    "lib/product/mfa/mfa.manager.ts",
    "lib/product/mfa/verify/product.release.gate.ts",
    "lib/product/mfa/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_MFA_SECURITY_ID === "enterprise-product-mfa-security-v1",
    "mfa security id",
  );
  check(
    PRODUCT_MFA_SECURITY_VERSION === "product-mfa-1",
    "mfa security version",
  );
  check(
    PRODUCT_MFA_SECURITY_FREEZE_VERSION === "product-mfa-security-freeze-1",
    "mfa security freeze",
  );
  check(
    PRODUCT_MFA_SECURITY_BASE === PRODUCT_SESSION_CONTROL_ID,
    "mfa base = session control",
  );
  check(
    PRODUCT_MFA_FREEZE_VERSION === "product-mfa-security-freeze-1",
    "mfa freeze tag",
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
  check(MFA_FACTOR_KINDS.length === 4, "factor kinds");
  check(MFA_ENROLLMENT_STATUSES.length === 3, "enrollment statuses");
  check(MFA_CHALLENGE_STATUSES.length === 4, "challenge statuses");
  check(MFA_ASSERTION_RESULTS.length === 2, "assertion results");
  check(MFA_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(MFA_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductMfaReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductMfaReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product MFA Security ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

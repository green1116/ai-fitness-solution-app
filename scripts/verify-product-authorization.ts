/**
 * Product Authorization — RBAC verification
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
import { PRODUCT_IDENTITY_FOUNDATION_ID } from "../lib/product/identity/authentication/authentication.constants";
import { PRODUCT_ITERATION_FOUNDATION_ID } from "../lib/product/iteration/cycle/cycle.constants";
import {
  ASSIGNMENT_STATUSES,
  AUTHORIZATION_MANAGER_STATUSES,
  AUTHORIZATION_READINESS_VERDICTS,
  DECISION_RESULTS,
  PERMISSION_EFFECTS,
  PRODUCT_AUTHORIZATION_FREEZE_VERSION,
  PRODUCT_AUTHORIZATION_RBAC_BASE,
  PRODUCT_AUTHORIZATION_RBAC_FREEZE_VERSION,
  PRODUCT_AUTHORIZATION_RBAC_ID,
  PRODUCT_AUTHORIZATION_RBAC_VERSION,
  ROLE_KINDS,
} from "../lib/product/authorization/rbac/rbac.constants";
import {
  assertProductAuthorizationReleaseGatePass,
  checkProductAuthorizationReleaseGate,
} from "../lib/product/authorization/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/authorization/rbac/rbac.constants.ts",
    "lib/product/authorization/rbac/rbac.types.ts",
    "lib/product/authorization/rbac/rbac.readiness.ts",
    "lib/product/authorization/role/role.types.ts",
    "lib/product/authorization/role/role.registry.ts",
    "lib/product/authorization/permission/permission.types.ts",
    "lib/product/authorization/permission/permission.registry.ts",
    "lib/product/authorization/grant/grant.types.ts",
    "lib/product/authorization/grant/grant.registry.ts",
    "lib/product/authorization/assignment/assignment.types.ts",
    "lib/product/authorization/assignment/assignment.registry.ts",
    "lib/product/authorization/decision/decision.types.ts",
    "lib/product/authorization/decision/decision.registry.ts",
    "lib/product/authorization/authorization.manager.ts",
    "lib/product/authorization/verify/product.release.gate.ts",
    "lib/product/authorization/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AUTHORIZATION_RBAC_ID ===
      "enterprise-product-authorization-rbac-v1",
    "authorization rbac id",
  );
  check(
    PRODUCT_AUTHORIZATION_RBAC_VERSION === "product-authorization-1",
    "authorization rbac version",
  );
  check(
    PRODUCT_AUTHORIZATION_RBAC_FREEZE_VERSION ===
      "product-authorization-rbac-freeze-1",
    "authorization rbac freeze",
  );
  check(
    PRODUCT_AUTHORIZATION_RBAC_BASE === PRODUCT_IDENTITY_FOUNDATION_ID,
    "authorization base = identity foundation",
  );
  check(
    PRODUCT_AUTHORIZATION_FREEZE_VERSION ===
      "product-authorization-rbac-freeze-1",
    "authorization freeze tag",
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
  check(ROLE_KINDS.length === 4, "role kinds");
  check(PERMISSION_EFFECTS.length === 2, "permission effects");
  check(ASSIGNMENT_STATUSES.length === 3, "assignment statuses");
  check(DECISION_RESULTS.length === 2, "decision results");
  check(AUTHORIZATION_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(AUTHORIZATION_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAuthorizationReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAuthorizationReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Authorization RBAC ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

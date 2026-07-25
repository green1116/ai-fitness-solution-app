/**
 * Product Audit — Security Traceability verification
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
import { PRODUCT_SSO_FEDERATION_ID } from "../lib/product/sso/federation/federation.constants";
import {
  AUDIT_EVENT_CATEGORIES,
  AUDIT_INTEGRITY_RESULTS,
  AUDIT_MANAGER_STATUSES,
  AUDIT_READINESS_VERDICTS,
  AUDIT_SEVERITIES,
  AUDIT_TRAIL_STATUSES,
  PRODUCT_AUDIT_FREEZE_VERSION,
  PRODUCT_AUDIT_TRACEABILITY_BASE,
  PRODUCT_AUDIT_TRACEABILITY_FREEZE_VERSION,
  PRODUCT_AUDIT_TRACEABILITY_ID,
  PRODUCT_AUDIT_TRACEABILITY_VERSION,
} from "../lib/product/audit/security/security.constants";
import {
  assertProductAuditReleaseGatePass,
  checkProductAuditReleaseGate,
} from "../lib/product/audit/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/audit/security/security.constants.ts",
    "lib/product/audit/security/security.types.ts",
    "lib/product/audit/security/security.readiness.ts",
    "lib/product/audit/event/event.types.ts",
    "lib/product/audit/event/event.registry.ts",
    "lib/product/audit/trail/trail.types.ts",
    "lib/product/audit/trail/trail.registry.ts",
    "lib/product/audit/integrity/integrity.types.ts",
    "lib/product/audit/integrity/integrity.registry.ts",
    "lib/product/audit/query/query.types.ts",
    "lib/product/audit/query/query.registry.ts",
    "lib/product/audit/audit.manager.ts",
    "lib/product/audit/verify/product.release.gate.ts",
    "lib/product/audit/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_AUDIT_TRACEABILITY_ID ===
      "enterprise-product-audit-traceability-v1",
    "audit traceability id",
  );
  check(
    PRODUCT_AUDIT_TRACEABILITY_VERSION === "product-audit-1",
    "audit traceability version",
  );
  check(
    PRODUCT_AUDIT_TRACEABILITY_FREEZE_VERSION ===
      "product-audit-traceability-freeze-1",
    "audit traceability freeze",
  );
  check(
    PRODUCT_AUDIT_TRACEABILITY_BASE === PRODUCT_SSO_FEDERATION_ID,
    "audit base = sso federation",
  );
  check(
    PRODUCT_AUDIT_FREEZE_VERSION === "product-audit-traceability-freeze-1",
    "audit freeze tag",
  );
  check(
    PRODUCT_SSO_FEDERATION_ID === "enterprise-product-sso-federation-v1",
    "sso federation preserved",
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
  check(AUDIT_EVENT_CATEGORIES.length === 4, "event categories");
  check(AUDIT_SEVERITIES.length === 3, "severities");
  check(AUDIT_TRAIL_STATUSES.length === 3, "trail statuses");
  check(AUDIT_INTEGRITY_RESULTS.length === 2, "integrity results");
  check(AUDIT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(AUDIT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAuditReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAuditReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Audit Traceability ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

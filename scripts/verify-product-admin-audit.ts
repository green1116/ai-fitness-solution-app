/**
 * Product Admin Audit — verification
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
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../lib/product/auth/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_BILLING_BASELINE_ID } from "../lib/product/billing-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID } from "../lib/product/customer-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID } from "../lib/product/analytics-baseline/freeze/freeze.lock";
import { PRODUCT_ADMIN_FOUNDATION_ID } from "../lib/product/admin/foundation/foundation.constants";
import { PRODUCT_COMPLIANCE_GOVERNANCE_ID } from "../lib/product/compliance/governance/governance.constants";
import { PRODUCT_OPERATIONS_CONSOLE_ID } from "../lib/product/operations/console/console.constants";
import { PRODUCT_SYSTEM_CONFIGURATION_ID } from "../lib/product/configuration/management/management.constants";
import { PRODUCT_TENANT_ADMINISTRATION_ID } from "../lib/product/tenant/administration/administration.constants";
import { PRODUCT_USER_ADMINISTRATION_ID } from "../lib/product/user/administration/administration.constants";
import {
  ADMIN_AUDIT_CATEGORIES,
  ADMIN_AUDIT_MANAGER_STATUSES,
  ADMIN_AUDIT_READINESS_VERDICTS,
  ADMIN_AUDIT_SEVERITIES,
  ADMIN_INTEGRITY_RESULTS,
  ADMIN_TRAIL_STATUSES,
  PRODUCT_ADMIN_AUDIT_BASE,
  PRODUCT_ADMIN_AUDIT_FREEZE_TAG,
  PRODUCT_ADMIN_AUDIT_FREEZE_VERSION,
  PRODUCT_ADMIN_AUDIT_ID,
  PRODUCT_ADMIN_AUDIT_VERSION,
} from "../lib/product/admin-audit/traceability/traceability.constants";
import {
  assertProductAdminAuditReleaseGatePass,
  checkProductAdminAuditReleaseGate,
} from "../lib/product/admin-audit/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/admin-audit/traceability/traceability.constants.ts",
    "lib/product/admin-audit/traceability/traceability.types.ts",
    "lib/product/admin-audit/traceability/traceability.readiness.ts",
    "lib/product/admin-audit/event/event.types.ts",
    "lib/product/admin-audit/event/event.registry.ts",
    "lib/product/admin-audit/trail/trail.types.ts",
    "lib/product/admin-audit/trail/trail.registry.ts",
    "lib/product/admin-audit/integrity/integrity.types.ts",
    "lib/product/admin-audit/integrity/integrity.registry.ts",
    "lib/product/admin-audit/query/query.types.ts",
    "lib/product/admin-audit/query/query.registry.ts",
    "lib/product/admin-audit/admin-audit.manager.ts",
    "lib/product/admin-audit/verify/product.release.gate.ts",
    "lib/product/admin-audit/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_ADMIN_AUDIT_ID === "enterprise-product-admin-audit-v1",
    "admin audit id",
  );
  check(
    PRODUCT_ADMIN_AUDIT_VERSION === "product-admin-audit-1",
    "admin audit version",
  );
  check(
    PRODUCT_ADMIN_AUDIT_FREEZE_VERSION === "product-admin-audit-freeze-1",
    "admin audit freeze",
  );
  check(
    PRODUCT_ADMIN_AUDIT_BASE === PRODUCT_COMPLIANCE_GOVERNANCE_ID,
    "admin audit base = compliance governance",
  );
  check(
    PRODUCT_ADMIN_AUDIT_FREEZE_TAG === "product-admin-audit-freeze-1",
    "admin audit freeze tag",
  );
  check(
    PRODUCT_COMPLIANCE_GOVERNANCE_ID ===
      "enterprise-product-compliance-governance-v1",
    "compliance governance preserved",
  );
  check(
    PRODUCT_OPERATIONS_CONSOLE_ID ===
      "enterprise-product-operations-console-v1",
    "operations console preserved",
  );
  check(
    PRODUCT_SYSTEM_CONFIGURATION_ID ===
      "enterprise-product-system-configuration-v1",
    "system configuration preserved",
  );
  check(
    PRODUCT_USER_ADMINISTRATION_ID ===
      "enterprise-product-user-administration-v1",
    "user administration preserved",
  );
  check(
    PRODUCT_TENANT_ADMINISTRATION_ID ===
      "enterprise-product-tenant-administration-v1",
    "tenant administration preserved",
  );
  check(
    PRODUCT_ADMIN_FOUNDATION_ID ===
      "enterprise-product-admin-foundation-v1",
    "admin foundation preserved",
  );
  check(
    ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID ===
      "enterprise-product-analytics-baseline-v1",
    "analytics baseline preserved",
  );
  check(
    ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID ===
      "enterprise-product-customer-baseline-v1",
    "customer baseline preserved",
  );
  check(
    ENTERPRISE_PRODUCT_BILLING_BASELINE_ID ===
      "enterprise-product-billing-baseline-v1",
    "billing baseline preserved",
  );
  check(
    ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
      "enterprise-product-auth-baseline-v1",
    "auth baseline preserved",
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
  check(ADMIN_AUDIT_CATEGORIES.length === 6, "audit categories");
  check(ADMIN_AUDIT_SEVERITIES.length === 3, "audit severities");
  check(ADMIN_TRAIL_STATUSES.length === 3, "trail statuses");
  check(ADMIN_INTEGRITY_RESULTS.length === 2, "integrity results");
  check(ADMIN_AUDIT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(ADMIN_AUDIT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAdminAuditReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAdminAuditReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Admin Audit ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

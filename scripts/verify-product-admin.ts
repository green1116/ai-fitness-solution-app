/**
 * Product Admin — Admin Foundation verification
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
import { PRODUCT_ANALYTICS_AUDIT_ID } from "../lib/product/analytics-audit/traceability/traceability.constants";
import { PRODUCT_ANALYTICS_FOUNDATION_ID } from "../lib/product/analytics/foundation/foundation.constants";
import {
  ADMIN_MANAGER_STATUSES,
  ADMIN_OPERATOR_ROLES,
  ADMIN_OPERATOR_STATUSES,
  ADMIN_POLICY_EFFECTS,
  ADMIN_POLICY_STATUSES,
  ADMIN_READINESS_VERDICTS,
  ADMIN_SETTING_SCOPES,
  ADMIN_TENANT_KINDS,
  ADMIN_TENANT_STATUSES,
  PRODUCT_ADMIN_FOUNDATION_BASE,
  PRODUCT_ADMIN_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ADMIN_FOUNDATION_ID,
  PRODUCT_ADMIN_FOUNDATION_VERSION,
  PRODUCT_ADMIN_FREEZE_VERSION,
} from "../lib/product/admin/foundation/foundation.constants";
import {
  assertProductAdminReleaseGatePass,
  checkProductAdminReleaseGate,
} from "../lib/product/admin/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/admin/foundation/foundation.constants.ts",
    "lib/product/admin/foundation/foundation.types.ts",
    "lib/product/admin/foundation/foundation.readiness.ts",
    "lib/product/admin/tenant/tenant.types.ts",
    "lib/product/admin/tenant/tenant.registry.ts",
    "lib/product/admin/setting/setting.types.ts",
    "lib/product/admin/setting/setting.registry.ts",
    "lib/product/admin/operator/operator.types.ts",
    "lib/product/admin/operator/operator.registry.ts",
    "lib/product/admin/policy/policy.types.ts",
    "lib/product/admin/policy/policy.registry.ts",
    "lib/product/admin/admin.manager.ts",
    "lib/product/admin/verify/product.release.gate.ts",
    "lib/product/admin/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_ADMIN_FOUNDATION_ID ===
      "enterprise-product-admin-foundation-v1",
    "admin foundation id",
  );
  check(
    PRODUCT_ADMIN_FOUNDATION_VERSION === "product-admin-1",
    "admin foundation version",
  );
  check(
    PRODUCT_ADMIN_FOUNDATION_FREEZE_VERSION ===
      "product-admin-foundation-freeze-1",
    "admin foundation freeze",
  );
  check(
    PRODUCT_ADMIN_FOUNDATION_BASE ===
      ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID,
    "admin base = analytics baseline",
  );
  check(
    PRODUCT_ADMIN_FREEZE_VERSION ===
      "product-admin-foundation-freeze-1",
    "admin freeze tag",
  );
  check(
    ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID ===
      "enterprise-product-analytics-baseline-v1",
    "analytics baseline preserved",
  );
  check(
    PRODUCT_ANALYTICS_AUDIT_ID === "enterprise-product-analytics-audit-v1",
    "analytics audit preserved",
  );
  check(
    PRODUCT_ANALYTICS_FOUNDATION_ID ===
      "enterprise-product-analytics-foundation-v1",
    "analytics foundation preserved",
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
  check(ADMIN_TENANT_KINDS.length === 3, "tenant kinds");
  check(ADMIN_TENANT_STATUSES.length === 3, "tenant statuses");
  check(ADMIN_SETTING_SCOPES.length === 3, "setting scopes");
  check(ADMIN_OPERATOR_ROLES.length === 3, "operator roles");
  check(ADMIN_OPERATOR_STATUSES.length === 2, "operator statuses");
  check(ADMIN_POLICY_EFFECTS.length === 3, "policy effects");
  check(ADMIN_POLICY_STATUSES.length === 2, "policy statuses");
  check(ADMIN_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(ADMIN_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAdminReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAdminReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Admin Foundation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

/**
 * Product Tenant — Tenant Administration verification
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
import {
  PRODUCT_TENANT_ADMINISTRATION_BASE,
  PRODUCT_TENANT_ADMINISTRATION_FREEZE_VERSION,
  PRODUCT_TENANT_ADMINISTRATION_ID,
  PRODUCT_TENANT_ADMINISTRATION_VERSION,
  PRODUCT_TENANT_FREEZE_VERSION,
  TENANT_ISOLATION_MODES,
  TENANT_LIFECYCLE_STATES,
  TENANT_MANAGER_STATUSES,
  TENANT_QUOTA_RESOURCES,
  TENANT_READINESS_VERDICTS,
  TENANT_RECORD_STATUSES,
  TENANT_TIERS,
} from "../lib/product/tenant/administration/administration.constants";
import {
  assertProductTenantReleaseGatePass,
  checkProductTenantReleaseGate,
} from "../lib/product/tenant/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/tenant/administration/administration.constants.ts",
    "lib/product/tenant/administration/administration.types.ts",
    "lib/product/tenant/administration/administration.readiness.ts",
    "lib/product/tenant/record/record.types.ts",
    "lib/product/tenant/record/record.registry.ts",
    "lib/product/tenant/quota/quota.types.ts",
    "lib/product/tenant/quota/quota.registry.ts",
    "lib/product/tenant/isolation/isolation.types.ts",
    "lib/product/tenant/isolation/isolation.registry.ts",
    "lib/product/tenant/lifecycle/lifecycle.types.ts",
    "lib/product/tenant/lifecycle/lifecycle.registry.ts",
    "lib/product/tenant/tenant.manager.ts",
    "lib/product/tenant/verify/product.release.gate.ts",
    "lib/product/tenant/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_TENANT_ADMINISTRATION_ID ===
      "enterprise-product-tenant-administration-v1",
    "tenant administration id",
  );
  check(
    PRODUCT_TENANT_ADMINISTRATION_VERSION === "product-tenant-1",
    "tenant administration version",
  );
  check(
    PRODUCT_TENANT_ADMINISTRATION_FREEZE_VERSION ===
      "product-tenant-administration-freeze-1",
    "tenant administration freeze",
  );
  check(
    PRODUCT_TENANT_ADMINISTRATION_BASE === PRODUCT_ADMIN_FOUNDATION_ID,
    "tenant base = admin foundation",
  );
  check(
    PRODUCT_TENANT_FREEZE_VERSION ===
      "product-tenant-administration-freeze-1",
    "tenant freeze tag",
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
  check(TENANT_TIERS.length === 3, "tenant tiers");
  check(TENANT_RECORD_STATUSES.length === 3, "record statuses");
  check(TENANT_QUOTA_RESOURCES.length === 3, "quota resources");
  check(TENANT_ISOLATION_MODES.length === 3, "isolation modes");
  check(TENANT_LIFECYCLE_STATES.length === 4, "lifecycle states");
  check(TENANT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(TENANT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductTenantReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductTenantReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Tenant Administration ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

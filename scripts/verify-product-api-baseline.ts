/**
 * Product API — Governance Freeze verification (M07-P8)
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
import { ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID } from "../lib/product/admin-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID } from "../lib/product/notification-baseline/freeze/freeze.lock";
import { PRODUCT_API_FOUNDATION_ID } from "../lib/product/api/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../lib/product/api-authentication/management/management.constants";
import { PRODUCT_API_GATEWAY_ID } from "../lib/product/api-gateway/management/management.constants";
import { PRODUCT_API_SDK_ID } from "../lib/product/api-sdk/management/management.constants";
import { PRODUCT_API_PORTAL_ID } from "../lib/product/api-portal/management/management.constants";
import { PRODUCT_API_GOVERNANCE_ID } from "../lib/product/api-governance/management/management.constants";
import { PRODUCT_API_AUDIT_ID } from "../lib/product/api-audit/management/management.constants";
import {
  ENTERPRISE_PRODUCT_API_BASELINE_ID,
  isProductApiFreezeLockIntact,
  PRODUCT_API_BASELINE_FREEZE_BASE,
  PRODUCT_API_BASELINE_FREEZE_VERSION,
  PRODUCT_API_BASELINE_ID,
  PRODUCT_API_COMPONENT_LOCK,
  PRODUCT_API_FREEZE_LOCK,
} from "../lib/product/api-baseline/freeze/freeze.lock";
import {
  isProductApiImmutableManifestIntact,
  PRODUCT_API_IMMUTABLE_MANIFEST,
} from "../lib/product/api-baseline/freeze/immutable.manifest";
import {
  isProductApiRollbackSnapshotIntact,
  PRODUCT_API_ROLLBACK_SNAPSHOT,
} from "../lib/product/api-baseline/freeze/rollback.snapshot";
import {
  assertProductApiBaselineReleaseGatePass,
  checkProductApiBaselineReleaseGate,
} from "../lib/product/api-baseline/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/api-baseline/freeze/freeze.lock.ts",
    "lib/product/api-baseline/freeze/immutable.manifest.ts",
    "lib/product/api-baseline/freeze/rollback.snapshot.ts",
    "lib/product/api-baseline/verify/product.release.gate.ts",
    "lib/product/api-baseline/index.ts",
    "lib/product/api/index.ts",
    "lib/product/api-authentication/index.ts",
    "lib/product/api-gateway/index.ts",
    "lib/product/api-sdk/index.ts",
    "lib/product/api-portal/index.ts",
    "lib/product/api-governance/index.ts",
    "lib/product/api-audit/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_API_BASELINE_ID === "enterprise-product-api-baseline-v1",
    "api baseline id",
  );
  check(
    ENTERPRISE_PRODUCT_API_BASELINE_ID === PRODUCT_API_BASELINE_ID,
    "api baseline alias",
  );
  check(
    PRODUCT_API_BASELINE_FREEZE_VERSION === "product-api-baseline-freeze-1",
    "api freeze version",
  );
  check(
    PRODUCT_API_BASELINE_FREEZE_BASE === PRODUCT_API_AUDIT_ID,
    "freeze base = api audit",
  );
  check(
    PRODUCT_API_FOUNDATION_ID === "enterprise-product-api-foundation-v1",
    "foundation preserved",
  );
  check(
    PRODUCT_API_AUTHENTICATION_ID ===
      "enterprise-product-api-authentication-v1",
    "authentication preserved",
  );
  check(
    PRODUCT_API_GATEWAY_ID === "enterprise-product-api-gateway-v1",
    "gateway preserved",
  );
  check(
    PRODUCT_API_SDK_ID === "enterprise-product-api-sdk-v1",
    "sdk preserved",
  );
  check(
    PRODUCT_API_PORTAL_ID === "enterprise-product-api-portal-v1",
    "portal preserved",
  );
  check(
    PRODUCT_API_GOVERNANCE_ID === "enterprise-product-api-governance-v1",
    "governance preserved",
  );
  check(
    PRODUCT_API_AUDIT_ID === "enterprise-product-api-audit-v1",
    "audit preserved",
  );
  check(
    ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID ===
      "enterprise-product-notification-baseline-v1",
    "notification baseline preserved",
  );
  check(
    ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID ===
      "enterprise-product-admin-baseline-v1",
    "admin baseline preserved",
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
    "launch readiness preserved",
  );
  check(
    ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
      "enterprise-commercialization-complete-v1",
    "commercialization preserved",
  );
  check(
    ENTERPRISE_EVOLUTION_COMPLETE_ID === "enterprise-evolution-complete-v1",
    "evolution preserved",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete preserved",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 preserved",
  );
  check(PRODUCT_API_COMPONENT_LOCK.length === 8, "components");
  check(isProductApiFreezeLockIntact(), "freeze lock intact");
  check(
    isProductApiImmutableManifestIntact(PRODUCT_API_IMMUTABLE_MANIFEST),
    "immutable manifest intact",
  );
  check(
    isProductApiRollbackSnapshotIntact(PRODUCT_API_ROLLBACK_SNAPSHOT),
    "rollback snapshot intact",
  );
  check(PRODUCT_API_FREEZE_LOCK.readOnly === true, "read-only");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductApiBaselineReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductApiBaselineReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product API Governance Freeze (M07-P8) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

/**
 * Product Marketplace — Governance Freeze verification (M08-P8)
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
import { ENTERPRISE_PRODUCT_API_BASELINE_ID } from "../lib/product/api-baseline/freeze/freeze.lock";
import { PRODUCT_MARKETPLACE_FOUNDATION_ID } from "../lib/product/marketplace/management/management.constants";
import { PRODUCT_CONNECTOR_FRAMEWORK_ID } from "../lib/product/connector/management/management.constants";
import { PRODUCT_PARTNER_MANAGEMENT_ID } from "../lib/product/partner/management/management.constants";
import { PRODUCT_APP_REGISTRY_ID } from "../lib/product/app/management/management.constants";
import { PRODUCT_MARKETPLACE_SURFACE_ID } from "../lib/product/marketplace-surface/management/management.constants";
import { PRODUCT_INTEGRATION_GOVERNANCE_ID } from "../lib/product/integration-governance/management/management.constants";
import { PRODUCT_MARKETPLACE_AUDIT_ID } from "../lib/product/marketplace-audit/management/management.constants";
import {
  ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID,
  isProductMarketplaceFreezeLockIntact,
  PRODUCT_MARKETPLACE_BASELINE_FREEZE_BASE,
  PRODUCT_MARKETPLACE_BASELINE_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_BASELINE_ID,
  PRODUCT_MARKETPLACE_COMPONENT_LOCK,
  PRODUCT_MARKETPLACE_FREEZE_LOCK,
} from "../lib/product/marketplace-baseline/freeze/freeze.lock";
import {
  isProductMarketplaceImmutableManifestIntact,
  PRODUCT_MARKETPLACE_IMMUTABLE_MANIFEST,
} from "../lib/product/marketplace-baseline/freeze/immutable.manifest";
import {
  isProductMarketplaceRollbackSnapshotIntact,
  PRODUCT_MARKETPLACE_ROLLBACK_SNAPSHOT,
} from "../lib/product/marketplace-baseline/freeze/rollback.snapshot";
import {
  assertProductMarketplaceBaselineReleaseGatePass,
  checkProductMarketplaceBaselineReleaseGate,
} from "../lib/product/marketplace-baseline/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/marketplace-baseline/freeze/freeze.lock.ts",
    "lib/product/marketplace-baseline/freeze/immutable.manifest.ts",
    "lib/product/marketplace-baseline/freeze/rollback.snapshot.ts",
    "lib/product/marketplace-baseline/verify/product.release.gate.ts",
    "lib/product/marketplace-baseline/index.ts",
    "lib/product/marketplace/index.ts",
    "lib/product/connector/index.ts",
    "lib/product/partner/index.ts",
    "lib/product/app/index.ts",
    "lib/product/marketplace-surface/index.ts",
    "lib/product/integration-governance/index.ts",
    "lib/product/marketplace-audit/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_MARKETPLACE_BASELINE_ID ===
      "enterprise-product-marketplace-baseline-v1",
    "marketplace baseline id",
  );
  check(
    ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID ===
      PRODUCT_MARKETPLACE_BASELINE_ID,
    "marketplace baseline alias",
  );
  check(
    PRODUCT_MARKETPLACE_BASELINE_FREEZE_VERSION ===
      "product-marketplace-baseline-freeze-1",
    "marketplace freeze version",
  );
  check(
    PRODUCT_MARKETPLACE_BASELINE_FREEZE_BASE === PRODUCT_MARKETPLACE_AUDIT_ID,
    "freeze base = marketplace audit",
  );
  check(
    PRODUCT_MARKETPLACE_FOUNDATION_ID ===
      "enterprise-product-marketplace-foundation-v1",
    "foundation preserved",
  );
  check(
    PRODUCT_CONNECTOR_FRAMEWORK_ID ===
      "enterprise-product-connector-framework-v1",
    "connector preserved",
  );
  check(
    PRODUCT_PARTNER_MANAGEMENT_ID ===
      "enterprise-product-partner-management-v1",
    "partner preserved",
  );
  check(
    PRODUCT_APP_REGISTRY_ID === "enterprise-product-app-registry-v1",
    "app preserved",
  );
  check(
    PRODUCT_MARKETPLACE_SURFACE_ID ===
      "enterprise-product-marketplace-surface-v1",
    "surface preserved",
  );
  check(
    PRODUCT_INTEGRATION_GOVERNANCE_ID ===
      "enterprise-product-integration-governance-v1",
    "integration governance preserved",
  );
  check(
    PRODUCT_MARKETPLACE_AUDIT_ID ===
      "enterprise-product-marketplace-audit-v1",
    "marketplace audit preserved",
  );
  check(
    ENTERPRISE_PRODUCT_API_BASELINE_ID ===
      "enterprise-product-api-baseline-v1",
    "api baseline preserved",
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
  check(PRODUCT_MARKETPLACE_COMPONENT_LOCK.length === 8, "components");
  check(isProductMarketplaceFreezeLockIntact(), "freeze lock intact");
  check(
    isProductMarketplaceImmutableManifestIntact(
      PRODUCT_MARKETPLACE_IMMUTABLE_MANIFEST,
    ),
    "immutable manifest intact",
  );
  check(
    isProductMarketplaceRollbackSnapshotIntact(
      PRODUCT_MARKETPLACE_ROLLBACK_SNAPSHOT,
    ),
    "rollback snapshot intact",
  );
  check(PRODUCT_MARKETPLACE_FREEZE_LOCK.readOnly === true, "read-only");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");
  check(buildPlatformV1Manifest().aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductMarketplaceBaselineReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductMarketplaceBaselineReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Marketplace Governance Freeze (M08-P8) ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

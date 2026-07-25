/**
 * Product Billing Audit — Billing Traceability verification
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
import { PRODUCT_BILLING_FOUNDATION_ID } from "../lib/product/billing/foundation/foundation.constants";
import { PRODUCT_INVOICE_ENGINE_ID } from "../lib/product/invoice/engine/engine.constants";
import { PRODUCT_USAGE_METERING_ID } from "../lib/product/metering/usage/usage.constants";
import { PRODUCT_PAYMENT_INTEGRATION_ID } from "../lib/product/payment/integration/integration.constants";
import { PRODUCT_PRICING_MANAGEMENT_ID } from "../lib/product/pricing/management/management.constants";
import { PRODUCT_SUBSCRIPTION_LIFECYCLE_ID } from "../lib/product/subscription/lifecycle/lifecycle.constants";
import {
  BILLING_AUDIT_CATEGORIES,
  BILLING_AUDIT_MANAGER_STATUSES,
  BILLING_AUDIT_READINESS_VERDICTS,
  BILLING_AUDIT_SEVERITIES,
  BILLING_INTEGRITY_RESULTS,
  BILLING_TRAIL_STATUSES,
  PRODUCT_BILLING_AUDIT_BASE,
  PRODUCT_BILLING_AUDIT_FREEZE_TAG,
  PRODUCT_BILLING_AUDIT_FREEZE_VERSION,
  PRODUCT_BILLING_AUDIT_ID,
  PRODUCT_BILLING_AUDIT_VERSION,
} from "../lib/product/billing-audit/traceability/traceability.constants";
import {
  assertProductBillingAuditReleaseGatePass,
  checkProductBillingAuditReleaseGate,
} from "../lib/product/billing-audit/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/billing-audit/traceability/traceability.constants.ts",
    "lib/product/billing-audit/traceability/traceability.types.ts",
    "lib/product/billing-audit/traceability/traceability.readiness.ts",
    "lib/product/billing-audit/event/event.types.ts",
    "lib/product/billing-audit/event/event.registry.ts",
    "lib/product/billing-audit/trail/trail.types.ts",
    "lib/product/billing-audit/trail/trail.registry.ts",
    "lib/product/billing-audit/integrity/integrity.types.ts",
    "lib/product/billing-audit/integrity/integrity.registry.ts",
    "lib/product/billing-audit/query/query.types.ts",
    "lib/product/billing-audit/query/query.registry.ts",
    "lib/product/billing-audit/billing-audit.manager.ts",
    "lib/product/billing-audit/verify/product.release.gate.ts",
    "lib/product/billing-audit/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_BILLING_AUDIT_ID === "enterprise-product-billing-audit-v1",
    "billing audit id",
  );
  check(
    PRODUCT_BILLING_AUDIT_VERSION === "product-billing-audit-1",
    "billing audit version",
  );
  check(
    PRODUCT_BILLING_AUDIT_FREEZE_VERSION === "product-billing-audit-freeze-1",
    "billing audit freeze",
  );
  check(
    PRODUCT_BILLING_AUDIT_BASE === PRODUCT_PAYMENT_INTEGRATION_ID,
    "billing audit base = payment integration",
  );
  check(
    PRODUCT_BILLING_AUDIT_FREEZE_TAG === "product-billing-audit-freeze-1",
    "billing audit freeze tag",
  );
  check(
    PRODUCT_PAYMENT_INTEGRATION_ID ===
      "enterprise-product-payment-integration-v1",
    "payment integration preserved",
  );
  check(
    PRODUCT_USAGE_METERING_ID === "enterprise-product-usage-metering-v1",
    "usage metering preserved",
  );
  check(
    PRODUCT_INVOICE_ENGINE_ID === "enterprise-product-invoice-engine-v1",
    "invoice engine preserved",
  );
  check(
    PRODUCT_PRICING_MANAGEMENT_ID ===
      "enterprise-product-pricing-management-v1",
    "pricing management preserved",
  );
  check(
    PRODUCT_SUBSCRIPTION_LIFECYCLE_ID ===
      "enterprise-product-subscription-lifecycle-v1",
    "subscription lifecycle preserved",
  );
  check(
    PRODUCT_BILLING_FOUNDATION_ID ===
      "enterprise-product-billing-foundation-v1",
    "billing foundation preserved",
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
  check(BILLING_AUDIT_CATEGORIES.length === 4, "audit categories");
  check(BILLING_AUDIT_SEVERITIES.length === 3, "audit severities");
  check(BILLING_TRAIL_STATUSES.length === 3, "trail statuses");
  check(BILLING_INTEGRITY_RESULTS.length === 2, "integrity results");
  check(BILLING_AUDIT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(BILLING_AUDIT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductBillingAuditReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductBillingAuditReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Billing Audit ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

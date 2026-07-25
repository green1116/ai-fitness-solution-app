/**
 * Product Billing — Governance Freeze verification
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
import { PRODUCT_BILLING_AUDIT_ID } from "../lib/product/billing-audit/traceability/traceability.constants";
import { PRODUCT_BILLING_FOUNDATION_ID } from "../lib/product/billing/foundation/foundation.constants";
import { PRODUCT_INVOICE_ENGINE_ID } from "../lib/product/invoice/engine/engine.constants";
import { PRODUCT_USAGE_METERING_ID } from "../lib/product/metering/usage/usage.constants";
import { PRODUCT_PAYMENT_INTEGRATION_ID } from "../lib/product/payment/integration/integration.constants";
import { PRODUCT_PRICING_MANAGEMENT_ID } from "../lib/product/pricing/management/management.constants";
import { PRODUCT_SUBSCRIPTION_LIFECYCLE_ID } from "../lib/product/subscription/lifecycle/lifecycle.constants";
import {
  ENTERPRISE_PRODUCT_BILLING_BASELINE_ID,
  isProductBillingFreezeLockIntact,
  PRODUCT_BILLING_BASELINE_FREEZE_BASE,
  PRODUCT_BILLING_BASELINE_FREEZE_VERSION,
  PRODUCT_BILLING_BASELINE_ID,
  PRODUCT_BILLING_COMPONENT_LOCK,
  PRODUCT_BILLING_FREEZE_LOCK,
} from "../lib/product/billing-baseline/freeze/freeze.lock";
import {
  assertProductBillingBaselineReleaseGatePass,
  checkProductBillingBaselineReleaseGate,
} from "../lib/product/billing-baseline/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/billing-baseline/freeze/freeze.lock.ts",
    "lib/product/billing-baseline/verify/product.release.gate.ts",
    "lib/product/billing-baseline/index.ts",
    "lib/product/billing/index.ts",
    "lib/product/subscription/index.ts",
    "lib/product/pricing/index.ts",
    "lib/product/invoice/index.ts",
    "lib/product/metering/index.ts",
    "lib/product/payment/index.ts",
    "lib/product/billing-audit/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_BILLING_BASELINE_ID === "enterprise-product-billing-baseline-v1",
    "billing baseline id",
  );
  check(
    ENTERPRISE_PRODUCT_BILLING_BASELINE_ID === PRODUCT_BILLING_BASELINE_ID,
    "billing baseline alias",
  );
  check(
    PRODUCT_BILLING_BASELINE_FREEZE_VERSION ===
      "product-billing-baseline-freeze-1",
    "billing freeze version",
  );
  check(
    PRODUCT_BILLING_BASELINE_FREEZE_BASE === PRODUCT_BILLING_AUDIT_ID,
    "billing freeze base = billing audit",
  );
  check(
    isProductBillingFreezeLockIntact(PRODUCT_BILLING_FREEZE_LOCK),
    "billing freeze lock intact",
  );
  check(PRODUCT_BILLING_COMPONENT_LOCK.length === 8, "billing components");
  check(
    PRODUCT_BILLING_FOUNDATION_ID ===
      "enterprise-product-billing-foundation-v1",
    "billing foundation preserved",
  );
  check(
    PRODUCT_SUBSCRIPTION_LIFECYCLE_ID ===
      "enterprise-product-subscription-lifecycle-v1",
    "subscription preserved",
  );
  check(
    PRODUCT_PRICING_MANAGEMENT_ID ===
      "enterprise-product-pricing-management-v1",
    "pricing preserved",
  );
  check(
    PRODUCT_INVOICE_ENGINE_ID === "enterprise-product-invoice-engine-v1",
    "invoice preserved",
  );
  check(
    PRODUCT_USAGE_METERING_ID === "enterprise-product-usage-metering-v1",
    "metering preserved",
  );
  check(
    PRODUCT_PAYMENT_INTEGRATION_ID ===
      "enterprise-product-payment-integration-v1",
    "payment preserved",
  );
  check(
    PRODUCT_BILLING_AUDIT_ID === "enterprise-product-billing-audit-v1",
    "billing audit preserved",
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
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductBillingBaselineReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductBillingBaselineReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Billing Governance Freeze ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

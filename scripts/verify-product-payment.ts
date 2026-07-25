/**
 * Product Payment — Payment Integration verification
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
import { PRODUCT_PRICING_MANAGEMENT_ID } from "../lib/product/pricing/management/management.constants";
import { PRODUCT_SUBSCRIPTION_LIFECYCLE_ID } from "../lib/product/subscription/lifecycle/lifecycle.constants";
import {
  INTENT_STATUSES,
  PAYMENT_MANAGER_STATUSES,
  PAYMENT_PROVIDER_KINDS,
  PAYMENT_READINESS_VERDICTS,
  PRODUCT_PAYMENT_FREEZE_VERSION,
  PRODUCT_PAYMENT_INTEGRATION_BASE,
  PRODUCT_PAYMENT_INTEGRATION_FREEZE_VERSION,
  PRODUCT_PAYMENT_INTEGRATION_ID,
  PRODUCT_PAYMENT_INTEGRATION_VERSION,
  PROVIDER_STATUSES,
  REFUND_RESULTS,
} from "../lib/product/payment/integration/integration.constants";
import {
  assertProductPaymentReleaseGatePass,
  checkProductPaymentReleaseGate,
} from "../lib/product/payment/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/payment/integration/integration.constants.ts",
    "lib/product/payment/integration/integration.types.ts",
    "lib/product/payment/integration/integration.readiness.ts",
    "lib/product/payment/provider/provider.types.ts",
    "lib/product/payment/provider/provider.registry.ts",
    "lib/product/payment/intent/intent.types.ts",
    "lib/product/payment/intent/intent.registry.ts",
    "lib/product/payment/capture/capture.types.ts",
    "lib/product/payment/capture/capture.registry.ts",
    "lib/product/payment/refund/refund.types.ts",
    "lib/product/payment/refund/refund.registry.ts",
    "lib/product/payment/payment.manager.ts",
    "lib/product/payment/verify/product.release.gate.ts",
    "lib/product/payment/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_PAYMENT_INTEGRATION_ID ===
      "enterprise-product-payment-integration-v1",
    "payment integration id",
  );
  check(
    PRODUCT_PAYMENT_INTEGRATION_VERSION === "product-payment-1",
    "payment integration version",
  );
  check(
    PRODUCT_PAYMENT_INTEGRATION_FREEZE_VERSION ===
      "product-payment-integration-freeze-1",
    "payment integration freeze",
  );
  check(
    PRODUCT_PAYMENT_INTEGRATION_BASE === PRODUCT_USAGE_METERING_ID,
    "payment base = usage metering",
  );
  check(
    PRODUCT_PAYMENT_FREEZE_VERSION ===
      "product-payment-integration-freeze-1",
    "payment freeze tag",
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
  check(PAYMENT_PROVIDER_KINDS.length === 3, "provider kinds");
  check(PROVIDER_STATUSES.length === 2, "provider statuses");
  check(INTENT_STATUSES.length === 4, "intent statuses");
  check(REFUND_RESULTS.length === 3, "refund results");
  check(PAYMENT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(PAYMENT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductPaymentReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductPaymentReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Payment Integration ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

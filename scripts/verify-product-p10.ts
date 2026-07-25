/**
 * Product P10 — Subscription & Billing verification
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
import { PRODUCT_P9_CUSTOMER_SUCCESS_ID } from "../lib/product/p9/customer-health/health.constants";
import {
  BILLING_STATUSES,
  ENTITLEMENT_KINDS,
  INVOICE_STATUSES,
  P10_MANAGER_STATUSES,
  P10_READINESS_VERDICTS,
  PAYMENT_STATUSES,
  PLAN_TIERS,
  PRICING_BILLING_CYCLES,
  PRODUCT_P10_SUBSCRIPTION_BILLING_BASE,
  PRODUCT_P10_SUBSCRIPTION_BILLING_FREEZE_VERSION,
  PRODUCT_P10_SUBSCRIPTION_BILLING_ID,
  PRODUCT_P10_SUBSCRIPTION_BILLING_VERSION,
  PRODUCT_P10_SUBSCRIPTION_FREEZE_VERSION,
  QUOTA_UNITS,
  SUBSCRIPTION_STATUSES,
} from "../lib/product/p10/subscription/subscription.constants";
import {
  assertProductP10ReleaseGatePass,
  checkProductP10ReleaseGate,
} from "../lib/product/p10/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/p10/subscription/subscription.constants.ts",
    "lib/product/p10/subscription/subscription.types.ts",
    "lib/product/p10/subscription/subscription.registry.ts",
    "lib/product/p10/subscription/subscription.readiness.ts",
    "lib/product/p10/plan/plan.types.ts",
    "lib/product/p10/plan/plan.registry.ts",
    "lib/product/p10/pricing/pricing.types.ts",
    "lib/product/p10/pricing/pricing.registry.ts",
    "lib/product/p10/billing/billing.types.ts",
    "lib/product/p10/billing/billing.registry.ts",
    "lib/product/p10/invoice/invoice.types.ts",
    "lib/product/p10/invoice/invoice.registry.ts",
    "lib/product/p10/payment/payment.types.ts",
    "lib/product/p10/payment/payment.registry.ts",
    "lib/product/p10/entitlement/entitlement.types.ts",
    "lib/product/p10/entitlement/entitlement.registry.ts",
    "lib/product/p10/quota/quota.types.ts",
    "lib/product/p10/quota/quota.registry.ts",
    "lib/product/p10/subscription.manager.ts",
    "lib/product/p10/verify/product.release.gate.ts",
    "lib/product/p10/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_P10_SUBSCRIPTION_BILLING_ID ===
      "enterprise-product-p10-subscription-billing-v1",
    "p10 subscription billing id",
  );
  check(
    PRODUCT_P10_SUBSCRIPTION_BILLING_VERSION === "product-p10-1",
    "p10 subscription billing version",
  );
  check(
    PRODUCT_P10_SUBSCRIPTION_BILLING_FREEZE_VERSION ===
      "product-p10-subscription-billing-freeze-1",
    "p10 subscription billing freeze",
  );
  check(
    PRODUCT_P10_SUBSCRIPTION_BILLING_BASE === PRODUCT_P9_CUSTOMER_SUCCESS_ID,
    "p10 base = p9 customer success",
  );
  check(
    PRODUCT_P10_SUBSCRIPTION_FREEZE_VERSION ===
      "product-p10-subscription-billing-freeze-1",
    "p10 freeze tag",
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
  check(SUBSCRIPTION_STATUSES.length === 6, "subscription statuses");
  check(PLAN_TIERS.length === 4, "plan tiers");
  check(PRICING_BILLING_CYCLES.length === 4, "pricing cycles");
  check(BILLING_STATUSES.length === 5, "billing statuses");
  check(INVOICE_STATUSES.length === 5, "invoice statuses");
  check(PAYMENT_STATUSES.length === 4, "payment statuses");
  check(ENTITLEMENT_KINDS.length === 5, "entitlement kinds");
  check(QUOTA_UNITS.length === 5, "quota units");
  check(P10_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(P10_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductP10ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductP10ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product P10 Subscription & Billing ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

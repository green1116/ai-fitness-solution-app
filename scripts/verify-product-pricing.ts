/**
 * Product Pricing — Pricing Management verification
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
import { PRODUCT_SUBSCRIPTION_LIFECYCLE_ID } from "../lib/product/subscription/lifecycle/lifecycle.constants";
import {
  DISCOUNT_KINDS,
  PRICE_MODELS,
  PRICING_CATALOG_STATUSES,
  PRICING_MANAGER_STATUSES,
  PRICING_READINESS_VERDICTS,
  PRODUCT_PRICING_FREEZE_VERSION,
  PRODUCT_PRICING_MANAGEMENT_BASE,
  PRODUCT_PRICING_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PRICING_MANAGEMENT_ID,
  PRODUCT_PRICING_MANAGEMENT_VERSION,
  QUOTE_STATUSES,
} from "../lib/product/pricing/management/management.constants";
import {
  assertProductPricingReleaseGatePass,
  checkProductPricingReleaseGate,
} from "../lib/product/pricing/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/pricing/management/management.constants.ts",
    "lib/product/pricing/management/management.types.ts",
    "lib/product/pricing/management/management.readiness.ts",
    "lib/product/pricing/catalog/catalog.types.ts",
    "lib/product/pricing/catalog/catalog.registry.ts",
    "lib/product/pricing/price/price.types.ts",
    "lib/product/pricing/price/price.registry.ts",
    "lib/product/pricing/discount/discount.types.ts",
    "lib/product/pricing/discount/discount.registry.ts",
    "lib/product/pricing/quote/quote.types.ts",
    "lib/product/pricing/quote/quote.registry.ts",
    "lib/product/pricing/pricing.manager.ts",
    "lib/product/pricing/verify/product.release.gate.ts",
    "lib/product/pricing/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_PRICING_MANAGEMENT_ID ===
      "enterprise-product-pricing-management-v1",
    "pricing management id",
  );
  check(
    PRODUCT_PRICING_MANAGEMENT_VERSION === "product-pricing-1",
    "pricing management version",
  );
  check(
    PRODUCT_PRICING_MANAGEMENT_FREEZE_VERSION ===
      "product-pricing-management-freeze-1",
    "pricing management freeze",
  );
  check(
    PRODUCT_PRICING_MANAGEMENT_BASE === PRODUCT_SUBSCRIPTION_LIFECYCLE_ID,
    "pricing base = subscription lifecycle",
  );
  check(
    PRODUCT_PRICING_FREEZE_VERSION === "product-pricing-management-freeze-1",
    "pricing freeze tag",
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
  check(PRICING_CATALOG_STATUSES.length === 3, "catalog statuses");
  check(PRICE_MODELS.length === 3, "price models");
  check(DISCOUNT_KINDS.length === 2, "discount kinds");
  check(QUOTE_STATUSES.length === 3, "quote statuses");
  check(PRICING_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(PRICING_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductPricingReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductPricingReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Pricing Management ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

/**
 * Product Metering — Usage Metering verification
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
import { PRODUCT_PRICING_MANAGEMENT_ID } from "../lib/product/pricing/management/management.constants";
import { PRODUCT_SUBSCRIPTION_LIFECYCLE_ID } from "../lib/product/subscription/lifecycle/lifecycle.constants";
import {
  AGGREGATION_WINDOWS,
  METER_STATUSES,
  METER_UNITS,
  METERING_MANAGER_STATUSES,
  METERING_READINESS_VERDICTS,
  PRODUCT_METERING_FREEZE_VERSION,
  PRODUCT_USAGE_METERING_BASE,
  PRODUCT_USAGE_METERING_FREEZE_VERSION,
  PRODUCT_USAGE_METERING_ID,
  PRODUCT_USAGE_METERING_VERSION,
  RATING_RESULTS,
} from "../lib/product/metering/usage/usage.constants";
import {
  assertProductMeteringReleaseGatePass,
  checkProductMeteringReleaseGate,
} from "../lib/product/metering/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/metering/usage/usage.constants.ts",
    "lib/product/metering/usage/usage.types.ts",
    "lib/product/metering/usage/usage.readiness.ts",
    "lib/product/metering/meter/meter.types.ts",
    "lib/product/metering/meter/meter.registry.ts",
    "lib/product/metering/event/event.types.ts",
    "lib/product/metering/event/event.registry.ts",
    "lib/product/metering/aggregate/aggregate.types.ts",
    "lib/product/metering/aggregate/aggregate.registry.ts",
    "lib/product/metering/rating/rating.types.ts",
    "lib/product/metering/rating/rating.registry.ts",
    "lib/product/metering/metering.manager.ts",
    "lib/product/metering/verify/product.release.gate.ts",
    "lib/product/metering/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_USAGE_METERING_ID === "enterprise-product-usage-metering-v1",
    "usage metering id",
  );
  check(
    PRODUCT_USAGE_METERING_VERSION === "product-metering-1",
    "usage metering version",
  );
  check(
    PRODUCT_USAGE_METERING_FREEZE_VERSION ===
      "product-usage-metering-freeze-1",
    "usage metering freeze",
  );
  check(
    PRODUCT_USAGE_METERING_BASE === PRODUCT_INVOICE_ENGINE_ID,
    "metering base = invoice engine",
  );
  check(
    PRODUCT_METERING_FREEZE_VERSION === "product-usage-metering-freeze-1",
    "metering freeze tag",
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
  check(METER_UNITS.length === 4, "meter units");
  check(METER_STATUSES.length === 3, "meter statuses");
  check(AGGREGATION_WINDOWS.length === 3, "aggregation windows");
  check(RATING_RESULTS.length === 3, "rating results");
  check(METERING_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(METERING_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductMeteringReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductMeteringReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Usage Metering ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

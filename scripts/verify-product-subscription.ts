/**
 * Product Subscription — Lifecycle verification
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
import {
  CHANGE_KINDS,
  ENTITLEMENT_STATUSES,
  PRODUCT_SUBSCRIPTION_FREEZE_VERSION,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_ID,
  PRODUCT_SUBSCRIPTION_LIFECYCLE_VERSION,
  RENEWAL_RESULTS,
  SUBSCRIPTION_MANAGER_STATUSES,
  SUBSCRIPTION_READINESS_VERDICTS,
  SUBSCRIPTION_STATUSES,
} from "../lib/product/subscription/lifecycle/lifecycle.constants";
import {
  assertProductSubscriptionReleaseGatePass,
  checkProductSubscriptionReleaseGate,
} from "../lib/product/subscription/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/subscription/lifecycle/lifecycle.constants.ts",
    "lib/product/subscription/lifecycle/lifecycle.types.ts",
    "lib/product/subscription/lifecycle/lifecycle.readiness.ts",
    "lib/product/subscription/subscription/subscription.types.ts",
    "lib/product/subscription/subscription/subscription.registry.ts",
    "lib/product/subscription/entitlement/entitlement.types.ts",
    "lib/product/subscription/entitlement/entitlement.registry.ts",
    "lib/product/subscription/renewal/renewal.types.ts",
    "lib/product/subscription/renewal/renewal.registry.ts",
    "lib/product/subscription/change/change.types.ts",
    "lib/product/subscription/change/change.registry.ts",
    "lib/product/subscription/subscription.manager.ts",
    "lib/product/subscription/verify/product.release.gate.ts",
    "lib/product/subscription/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_SUBSCRIPTION_LIFECYCLE_ID ===
      "enterprise-product-subscription-lifecycle-v1",
    "subscription lifecycle id",
  );
  check(
    PRODUCT_SUBSCRIPTION_LIFECYCLE_VERSION === "product-subscription-1",
    "subscription lifecycle version",
  );
  check(
    PRODUCT_SUBSCRIPTION_LIFECYCLE_FREEZE_VERSION ===
      "product-subscription-lifecycle-freeze-1",
    "subscription lifecycle freeze",
  );
  check(
    PRODUCT_SUBSCRIPTION_LIFECYCLE_BASE === PRODUCT_BILLING_FOUNDATION_ID,
    "subscription base = billing foundation",
  );
  check(
    PRODUCT_SUBSCRIPTION_FREEZE_VERSION ===
      "product-subscription-lifecycle-freeze-1",
    "subscription freeze tag",
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
  check(SUBSCRIPTION_STATUSES.length === 5, "subscription statuses");
  check(ENTITLEMENT_STATUSES.length === 2, "entitlement statuses");
  check(RENEWAL_RESULTS.length === 2, "renewal results");
  check(CHANGE_KINDS.length === 3, "change kinds");
  check(SUBSCRIPTION_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(SUBSCRIPTION_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductSubscriptionReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductSubscriptionReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Subscription Lifecycle ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

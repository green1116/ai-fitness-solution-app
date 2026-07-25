/**
 * Product Invoice — Invoice Engine verification
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
import { PRODUCT_PRICING_MANAGEMENT_ID } from "../lib/product/pricing/management/management.constants";
import { PRODUCT_SUBSCRIPTION_LIFECYCLE_ID } from "../lib/product/subscription/lifecycle/lifecycle.constants";
import {
  DOCUMENT_STATUSES,
  INVOICE_MANAGER_STATUSES,
  INVOICE_READINESS_VERDICTS,
  LINE_KINDS,
  PRODUCT_INVOICE_ENGINE_BASE,
  PRODUCT_INVOICE_ENGINE_FREEZE_VERSION,
  PRODUCT_INVOICE_ENGINE_ID,
  PRODUCT_INVOICE_ENGINE_VERSION,
  PRODUCT_INVOICE_FREEZE_VERSION,
  SETTLEMENT_RESULTS,
  TAX_MODES,
} from "../lib/product/invoice/engine/engine.constants";
import {
  assertProductInvoiceReleaseGatePass,
  checkProductInvoiceReleaseGate,
} from "../lib/product/invoice/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/invoice/engine/engine.constants.ts",
    "lib/product/invoice/engine/engine.types.ts",
    "lib/product/invoice/engine/engine.readiness.ts",
    "lib/product/invoice/document/document.types.ts",
    "lib/product/invoice/document/document.registry.ts",
    "lib/product/invoice/line/line.types.ts",
    "lib/product/invoice/line/line.registry.ts",
    "lib/product/invoice/tax/tax.types.ts",
    "lib/product/invoice/tax/tax.registry.ts",
    "lib/product/invoice/settlement/settlement.types.ts",
    "lib/product/invoice/settlement/settlement.registry.ts",
    "lib/product/invoice/invoice.manager.ts",
    "lib/product/invoice/verify/product.release.gate.ts",
    "lib/product/invoice/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_INVOICE_ENGINE_ID === "enterprise-product-invoice-engine-v1",
    "invoice engine id",
  );
  check(
    PRODUCT_INVOICE_ENGINE_VERSION === "product-invoice-1",
    "invoice engine version",
  );
  check(
    PRODUCT_INVOICE_ENGINE_FREEZE_VERSION ===
      "product-invoice-engine-freeze-1",
    "invoice engine freeze",
  );
  check(
    PRODUCT_INVOICE_ENGINE_BASE === PRODUCT_PRICING_MANAGEMENT_ID,
    "invoice base = pricing management",
  );
  check(
    PRODUCT_INVOICE_FREEZE_VERSION === "product-invoice-engine-freeze-1",
    "invoice freeze tag",
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
  check(DOCUMENT_STATUSES.length === 4, "document statuses");
  check(LINE_KINDS.length === 3, "line kinds");
  check(TAX_MODES.length === 3, "tax modes");
  check(SETTLEMENT_RESULTS.length === 3, "settlement results");
  check(INVOICE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(INVOICE_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductInvoiceReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductInvoiceReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Invoice Engine ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

/**
 * Commercialization P3 — Pricing & Contract Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import { COMMERCIALIZATION_SALES_FOUNDATION_ID } from "../lib/commercialization/p1/sales/sales.constants";
import {
  COMMERCIALIZATION_P2_PACKAGING_FREEZE_VERSION,
  COMMERCIALIZATION_PRODUCT_PACKAGING_ID,
} from "../lib/commercialization/p2/tier/tier.constants";
import {
  BILLING_CYCLES,
  COMMERCIAL_MODELS,
  COMMERCIALIZATION_P3_PRICING_FREEZE_VERSION,
  COMMERCIALIZATION_PRICING_CONTRACT_BASE,
  COMMERCIALIZATION_PRICING_CONTRACT_FREEZE_VERSION,
  COMMERCIALIZATION_PRICING_CONTRACT_ID,
  COMMERCIALIZATION_PRICING_CONTRACT_VERSION,
  CONTRACT_STATUSES,
  PRICE_BOOK_STATUSES,
  PRICING_MANAGER_STATUSES,
  PRICING_READINESS_VERDICTS,
  QUOTE_STATUSES,
  TERM_KINDS,
} from "../lib/commercialization/p3/pricing/pricing.constants";
import {
  assertCommercializationP3ReleaseGatePass,
  checkCommercializationP3ReleaseGate,
} from "../lib/commercialization/p3/verify/commercialization.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/commercialization/p3/pricing/pricing.constants.ts",
    "lib/commercialization/p3/pricing/pricing.types.ts",
    "lib/commercialization/p3/pricing/pricing.registry.ts",
    "lib/commercialization/p3/pricing/pricing.calculator.ts",
    "lib/commercialization/p3/quote/quote.types.ts",
    "lib/commercialization/p3/quote/quote.registry.ts",
    "lib/commercialization/p3/quote/quote.composer.ts",
    "lib/commercialization/p3/contract/contract.types.ts",
    "lib/commercialization/p3/contract/contract.registry.ts",
    "lib/commercialization/p3/contract/contract.lifecycle.ts",
    "lib/commercialization/p3/commercial/commercial.types.ts",
    "lib/commercialization/p3/commercial/commercial.terms.ts",
    "lib/commercialization/p3/commercial/commercial.model.ts",
    "lib/commercialization/p3/pricing.readiness.ts",
    "lib/commercialization/p3/pricing.manager.ts",
    "lib/commercialization/p3/verify/commercialization.release.gate.ts",
    "lib/commercialization/p3/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    COMMERCIALIZATION_PRICING_CONTRACT_ID ===
      "enterprise-commercialization-p3-pricing-contract-foundation-v1",
    "pricing-contract id",
  );
  check(
    COMMERCIALIZATION_PRICING_CONTRACT_VERSION === "commercialization-p3-1",
    "pricing-contract version",
  );
  check(
    COMMERCIALIZATION_PRICING_CONTRACT_FREEZE_VERSION ===
      "commercialization-pricing-contract-foundation-freeze-1",
    "pricing-contract freeze",
  );
  check(
    COMMERCIALIZATION_PRICING_CONTRACT_BASE ===
      COMMERCIALIZATION_PRODUCT_PACKAGING_ID,
    "pricing base = p2 packaging",
  );
  check(
    COMMERCIALIZATION_PRODUCT_PACKAGING_ID ===
      "enterprise-commercialization-p2-product-packaging-foundation-v1",
    "p2 freeze preserved",
  );
  check(
    COMMERCIALIZATION_P2_PACKAGING_FREEZE_VERSION ===
      "commercialization-p2-product-packaging-foundation-freeze-1",
    "p2 freeze tag preserved",
  );
  check(
    COMMERCIALIZATION_SALES_FOUNDATION_ID ===
      "enterprise-commercialization-p1-sales-foundation-v1",
    "p1 freeze preserved",
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
    COMMERCIALIZATION_P3_PRICING_FREEZE_VERSION ===
      "commercialization-p3-pricing-contract-foundation-freeze-1",
    "p3 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(PRICE_BOOK_STATUSES.length === 3, "price book statuses");
  check(BILLING_CYCLES.length === 3, "billing cycles");
  check(QUOTE_STATUSES.length === 5, "quote statuses");
  check(CONTRACT_STATUSES.length === 6, "contract statuses");
  check(TERM_KINDS.length === 5, "term kinds");
  check(COMMERCIAL_MODELS.length === 4, "commercial models");
  check(PRICING_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(PRICING_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkCommercializationP3ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertCommercializationP3ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Commercialization P3 Pricing & Contract Foundation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

/**
 * Commercialization P1 — Sales Foundation verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import {
  ENTERPRISE_OPERATIONS_COMPLETE_ID,
  OPERATIONS_GOVERNANCE_COMPLETE_ID,
} from "../lib/operations/signoff/governance.freeze.lock";
import {
  ENTERPRISE_EVOLUTION_COMPLETE_ID,
  EVOLUTION_GOVERNANCE_COMPLETE_ID,
} from "../lib/evolution/signoff/governance.freeze.lock";
import {
  COMMERCIALIZATION_P1_SALES_FREEZE_VERSION,
  COMMERCIALIZATION_SALES_FOUNDATION_BASE,
  COMMERCIALIZATION_SALES_FOUNDATION_FREEZE_VERSION,
  COMMERCIALIZATION_SALES_FOUNDATION_ID,
  COMMERCIALIZATION_SALES_FOUNDATION_VERSION,
  CUSTOMER_LIFECYCLE_STAGES,
  OFFER_KINDS,
  OPPORTUNITY_STATUSES,
  PIPELINE_STAGES,
  PRICING_MODELS,
  SALES_MANAGER_STATUSES,
  SALES_READINESS_VERDICTS,
} from "../lib/commercialization/p1/sales/sales.constants";
import {
  assertCommercializationP1ReleaseGatePass,
  checkCommercializationP1ReleaseGate,
} from "../lib/commercialization/p1/verify/commercialization.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/commercialization/p1/sales/sales.constants.ts",
    "lib/commercialization/p1/sales/sales.types.ts",
    "lib/commercialization/p1/sales/sales.registry.ts",
    "lib/commercialization/p1/sales/sales.pipeline.ts",
    "lib/commercialization/p1/sales/sales.metrics.ts",
    "lib/commercialization/p1/customer/customer.types.ts",
    "lib/commercialization/p1/customer/customer.registry.ts",
    "lib/commercialization/p1/customer/customer.lifecycle.ts",
    "lib/commercialization/p1/offer/offer.types.ts",
    "lib/commercialization/p1/offer/offer.catalog.ts",
    "lib/commercialization/p1/offer/offer.pricing.ts",
    "lib/commercialization/p1/sales.readiness.ts",
    "lib/commercialization/p1/sales.manager.ts",
    "lib/commercialization/p1/verify/commercialization.release.gate.ts",
    "lib/commercialization/p1/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    COMMERCIALIZATION_SALES_FOUNDATION_ID ===
      "enterprise-commercialization-p1-sales-foundation-v1",
    "sales foundation id",
  );
  check(
    COMMERCIALIZATION_SALES_FOUNDATION_VERSION === "commercialization-p1-1",
    "sales foundation version",
  );
  check(
    COMMERCIALIZATION_SALES_FOUNDATION_FREEZE_VERSION ===
      "commercialization-sales-foundation-freeze-1",
    "sales foundation freeze",
  );
  check(
    COMMERCIALIZATION_SALES_FOUNDATION_BASE ===
      ENTERPRISE_EVOLUTION_COMPLETE_ID,
    "sales base = evolution complete",
  );
  check(
    EVOLUTION_GOVERNANCE_COMPLETE_ID === "enterprise-evolution-complete-v1",
    "evolution complete freeze preserved",
  );
  check(
    ENTERPRISE_EVOLUTION_COMPLETE_ID === "enterprise-evolution-complete-v1",
    "evolution complete alias preserved",
  );
  check(
    OPERATIONS_GOVERNANCE_COMPLETE_ID ===
      "enterprise-post-launch-operations-complete-v1",
    "operations complete freeze preserved",
  );
  check(
    ENTERPRISE_OPERATIONS_COMPLETE_ID === "enterprise-operations-complete-v1",
    "operations complete alias preserved",
  );
  check(
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1",
    "launch complete alias preserved",
  );
  check(
    COMMERCIALIZATION_P1_SALES_FREEZE_VERSION ===
      "commercialization-p1-sales-foundation-freeze-1",
    "p1 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(PIPELINE_STAGES.length === 6, "pipeline stages");
  check(OPPORTUNITY_STATUSES.length === 4, "opportunity statuses");
  check(CUSTOMER_LIFECYCLE_STAGES.length === 5, "lifecycle stages");
  check(OFFER_KINDS.length === 4, "offer kinds");
  check(PRICING_MODELS.length === 4, "pricing models");
  check(SALES_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(SALES_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkCommercializationP1ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertCommercializationP1ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Commercialization P1 Sales Foundation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

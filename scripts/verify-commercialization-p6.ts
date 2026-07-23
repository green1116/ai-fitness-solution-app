/**
 * Commercialization P6 — Revenue Intelligence verification
 */
import fs from "node:fs";
import path from "node:path";

import { PLATFORM_V1_ID } from "../lib/platform/v1/platform.v1.constants";
import { buildPlatformV1Manifest } from "../lib/platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../lib/product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../lib/launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../lib/evolution/signoff/governance.freeze.lock";
import { COMMERCIALIZATION_SALES_FOUNDATION_ID } from "../lib/commercialization/p1/sales/sales.constants";
import { COMMERCIALIZATION_PRODUCT_PACKAGING_ID } from "../lib/commercialization/p2/tier/tier.constants";
import { COMMERCIALIZATION_PRICING_CONTRACT_ID } from "../lib/commercialization/p3/pricing/pricing.constants";
import { COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID } from "../lib/commercialization/p4/onboarding/onboarding.constants";
import {
  COMMERCIALIZATION_DELIVERY_OPERATIONS_ID,
  COMMERCIALIZATION_P5_DELIVERY_FREEZE_VERSION,
} from "../lib/commercialization/p5/delivery/delivery.constants";
import {
  COMMERCIALIZATION_P6_REVENUE_FREEZE_VERSION,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_FREEZE_VERSION,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_VERSION,
  HEALTH_BANDS,
  KPI_CATEGORIES,
  REPORT_KINDS,
  REVENUE_MANAGER_STATUSES,
  REVENUE_PERIODS,
  REVENUE_READINESS_VERDICTS,
  REVENUE_STREAM_KINDS,
} from "../lib/commercialization/p6/kpi/kpi.constants";
import {
  assertCommercializationP6ReleaseGatePass,
  checkCommercializationP6ReleaseGate,
} from "../lib/commercialization/p6/verify/commercialization.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/commercialization/p6/revenue/revenue.types.ts",
    "lib/commercialization/p6/revenue/revenue.registry.ts",
    "lib/commercialization/p6/revenue/revenue.metrics.ts",
    "lib/commercialization/p6/analytics/analytics.types.ts",
    "lib/commercialization/p6/analytics/analytics.engine.ts",
    "lib/commercialization/p6/analytics/analytics.calculator.ts",
    "lib/commercialization/p6/kpi/kpi.constants.ts",
    "lib/commercialization/p6/kpi/kpi.types.ts",
    "lib/commercialization/p6/kpi/kpi.registry.ts",
    "lib/commercialization/p6/customer/customer.types.ts",
    "lib/commercialization/p6/customer/customer.value.ts",
    "lib/commercialization/p6/customer/customer.health.ts",
    "lib/commercialization/p6/customer/customer.score.ts",
    "lib/commercialization/p6/report/report.types.ts",
    "lib/commercialization/p6/report/report.generator.ts",
    "lib/commercialization/p6/report/report.readiness.ts",
    "lib/commercialization/p6/revenue.manager.ts",
    "lib/commercialization/p6/verify/commercialization.release.gate.ts",
    "lib/commercialization/p6/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID ===
      "enterprise-commercialization-p6-revenue-intelligence-v1",
    "revenue intelligence id",
  );
  check(
    COMMERCIALIZATION_REVENUE_INTELLIGENCE_VERSION ===
      "commercialization-p6-1",
    "revenue intelligence version",
  );
  check(
    COMMERCIALIZATION_REVENUE_INTELLIGENCE_FREEZE_VERSION ===
      "commercialization-revenue-intelligence-freeze-1",
    "revenue intelligence freeze",
  );
  check(
    COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE ===
      COMMERCIALIZATION_DELIVERY_OPERATIONS_ID,
    "revenue base = p5 delivery-ops",
  );
  check(
    COMMERCIALIZATION_DELIVERY_OPERATIONS_ID ===
      "enterprise-commercialization-p5-delivery-operations-foundation-v1",
    "p5 freeze preserved",
  );
  check(
    COMMERCIALIZATION_P5_DELIVERY_FREEZE_VERSION ===
      "commercialization-p5-delivery-operations-foundation-freeze-1",
    "p5 freeze tag preserved",
  );
  check(
    COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID ===
      "enterprise-commercialization-p4-customer-onboarding-foundation-v1",
    "p4 freeze preserved",
  );
  check(
    COMMERCIALIZATION_PRICING_CONTRACT_ID ===
      "enterprise-commercialization-p3-pricing-contract-foundation-v1",
    "p3 freeze preserved",
  );
  check(
    COMMERCIALIZATION_PRODUCT_PACKAGING_ID ===
      "enterprise-commercialization-p2-product-packaging-foundation-v1",
    "p2 freeze preserved",
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
    COMMERCIALIZATION_P6_REVENUE_FREEZE_VERSION ===
      "commercialization-p6-revenue-intelligence-freeze-1",
    "p6 freeze",
  );
  check(
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1",
    "e12 complete freeze preserved",
  );
  check(REVENUE_STREAM_KINDS.length === 4, "revenue stream kinds");
  check(REVENUE_PERIODS.length === 3, "revenue periods");
  check(KPI_CATEGORIES.length === 4, "kpi categories");
  check(HEALTH_BANDS.length === 5, "health bands");
  check(REPORT_KINDS.length === 4, "report kinds");
  check(REVENUE_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(REVENUE_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkCommercializationP6ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertCommercializationP6ReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Commercialization P6 Revenue Intelligence ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

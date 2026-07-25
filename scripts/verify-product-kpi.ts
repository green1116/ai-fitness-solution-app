/**
 * Product KPI — KPI Management verification
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
import { ENTERPRISE_PRODUCT_BILLING_BASELINE_ID } from "../lib/product/billing-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID } from "../lib/product/customer-baseline/freeze/freeze.lock";
import { PRODUCT_ANALYTICS_FOUNDATION_ID } from "../lib/product/analytics/foundation/foundation.constants";
import {
  KPI_CATEGORIES,
  KPI_MANAGER_STATUSES,
  KPI_READINESS_VERDICTS,
  KPI_STATUSES,
  MEASUREMENT_RESULTS,
  PRODUCT_KPI_FREEZE_VERSION,
  PRODUCT_KPI_MANAGEMENT_BASE,
  PRODUCT_KPI_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_KPI_MANAGEMENT_ID,
  PRODUCT_KPI_MANAGEMENT_VERSION,
  TARGET_PERIODS,
} from "../lib/product/kpi/management/management.constants";
import {
  assertProductKpiReleaseGatePass,
  checkProductKpiReleaseGate,
} from "../lib/product/kpi/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/kpi/management/management.constants.ts",
    "lib/product/kpi/management/management.types.ts",
    "lib/product/kpi/management/management.readiness.ts",
    "lib/product/kpi/definition/definition.types.ts",
    "lib/product/kpi/definition/definition.registry.ts",
    "lib/product/kpi/target/target.types.ts",
    "lib/product/kpi/target/target.registry.ts",
    "lib/product/kpi/measurement/measurement.types.ts",
    "lib/product/kpi/measurement/measurement.registry.ts",
    "lib/product/kpi/scorecard/scorecard.types.ts",
    "lib/product/kpi/scorecard/scorecard.registry.ts",
    "lib/product/kpi/kpi.manager.ts",
    "lib/product/kpi/verify/product.release.gate.ts",
    "lib/product/kpi/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_KPI_MANAGEMENT_ID === "enterprise-product-kpi-management-v1",
    "kpi management id",
  );
  check(
    PRODUCT_KPI_MANAGEMENT_VERSION === "product-kpi-1",
    "kpi management version",
  );
  check(
    PRODUCT_KPI_MANAGEMENT_FREEZE_VERSION ===
      "product-kpi-management-freeze-1",
    "kpi management freeze",
  );
  check(
    PRODUCT_KPI_MANAGEMENT_BASE === PRODUCT_ANALYTICS_FOUNDATION_ID,
    "kpi base = analytics foundation",
  );
  check(
    PRODUCT_KPI_FREEZE_VERSION === "product-kpi-management-freeze-1",
    "kpi freeze tag",
  );
  check(
    PRODUCT_ANALYTICS_FOUNDATION_ID ===
      "enterprise-product-analytics-foundation-v1",
    "analytics foundation preserved",
  );
  check(
    ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID ===
      "enterprise-product-customer-baseline-v1",
    "customer baseline preserved",
  );
  check(
    ENTERPRISE_PRODUCT_BILLING_BASELINE_ID ===
      "enterprise-product-billing-baseline-v1",
    "billing baseline preserved",
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
  check(KPI_CATEGORIES.length === 4, "kpi categories");
  check(KPI_STATUSES.length === 3, "kpi statuses");
  check(TARGET_PERIODS.length === 3, "target periods");
  check(MEASUREMENT_RESULTS.length === 3, "measurement results");
  check(KPI_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(KPI_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductKpiReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductKpiReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product KPI Management ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

/**
 * Product Analytics — Analytics Foundation verification
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
import { PRODUCT_CRM_AUDIT_ID } from "../lib/product/crm-audit/traceability/traceability.constants";
import { PRODUCT_CUSTOMER_FOUNDATION_ID } from "../lib/product/customer/foundation/foundation.constants";
import {
  ANALYTICS_MANAGER_STATUSES,
  ANALYTICS_READINESS_VERDICTS,
  DATASET_STATUSES,
  METRIC_KINDS,
  PIPELINE_STATUSES,
  PRODUCT_ANALYTICS_FOUNDATION_BASE,
  PRODUCT_ANALYTICS_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ANALYTICS_FOUNDATION_ID,
  PRODUCT_ANALYTICS_FOUNDATION_VERSION,
  PRODUCT_ANALYTICS_FREEZE_VERSION,
  REPORT_KINDS,
} from "../lib/product/analytics/foundation/foundation.constants";
import {
  assertProductAnalyticsReleaseGatePass,
  checkProductAnalyticsReleaseGate,
} from "../lib/product/analytics/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/analytics/foundation/foundation.constants.ts",
    "lib/product/analytics/foundation/foundation.types.ts",
    "lib/product/analytics/foundation/foundation.readiness.ts",
    "lib/product/analytics/metric/metric.types.ts",
    "lib/product/analytics/metric/metric.registry.ts",
    "lib/product/analytics/dataset/dataset.types.ts",
    "lib/product/analytics/dataset/dataset.registry.ts",
    "lib/product/analytics/pipeline/pipeline.types.ts",
    "lib/product/analytics/pipeline/pipeline.registry.ts",
    "lib/product/analytics/report/report.types.ts",
    "lib/product/analytics/report/report.registry.ts",
    "lib/product/analytics/analytics.manager.ts",
    "lib/product/analytics/verify/product.release.gate.ts",
    "lib/product/analytics/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_ANALYTICS_FOUNDATION_ID ===
      "enterprise-product-analytics-foundation-v1",
    "analytics foundation id",
  );
  check(
    PRODUCT_ANALYTICS_FOUNDATION_VERSION === "product-analytics-1",
    "analytics foundation version",
  );
  check(
    PRODUCT_ANALYTICS_FOUNDATION_FREEZE_VERSION ===
      "product-analytics-foundation-freeze-1",
    "analytics foundation freeze",
  );
  check(
    PRODUCT_ANALYTICS_FOUNDATION_BASE ===
      ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID,
    "analytics base = customer baseline",
  );
  check(
    PRODUCT_ANALYTICS_FREEZE_VERSION ===
      "product-analytics-foundation-freeze-1",
    "analytics freeze tag",
  );
  check(
    ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID ===
      "enterprise-product-customer-baseline-v1",
    "customer baseline preserved",
  );
  check(
    PRODUCT_CRM_AUDIT_ID === "enterprise-product-crm-audit-v1",
    "crm audit preserved",
  );
  check(
    PRODUCT_CUSTOMER_FOUNDATION_ID ===
      "enterprise-product-customer-foundation-v1",
    "customer foundation preserved",
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
  check(METRIC_KINDS.length === 3, "metric kinds");
  check(DATASET_STATUSES.length === 3, "dataset statuses");
  check(PIPELINE_STATUSES.length === 4, "pipeline statuses");
  check(REPORT_KINDS.length === 3, "report kinds");
  check(ANALYTICS_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(ANALYTICS_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAnalyticsReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAnalyticsReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Analytics Foundation ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

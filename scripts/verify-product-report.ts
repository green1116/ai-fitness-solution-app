/**
 * Product Report — Report Engine verification
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
import { PRODUCT_DASHBOARD_FRAMEWORK_ID } from "../lib/product/dashboard/framework/framework.constants";
import { PRODUCT_KPI_MANAGEMENT_ID } from "../lib/product/kpi/management/management.constants";
import {
  DELIVERY_CHANNELS,
  PRODUCT_REPORT_ENGINE_BASE,
  PRODUCT_REPORT_ENGINE_FREEZE_VERSION,
  PRODUCT_REPORT_ENGINE_ID,
  PRODUCT_REPORT_ENGINE_VERSION,
  PRODUCT_REPORT_FREEZE_VERSION,
  REPORT_FORMATS,
  REPORT_JOB_STATUSES,
  REPORT_MANAGER_STATUSES,
  REPORT_READINESS_VERDICTS,
  REPORT_TEMPLATE_KINDS,
} from "../lib/product/report/engine/engine.constants";
import {
  assertProductReportReleaseGatePass,
  checkProductReportReleaseGate,
} from "../lib/product/report/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/report/engine/engine.constants.ts",
    "lib/product/report/engine/engine.types.ts",
    "lib/product/report/engine/engine.readiness.ts",
    "lib/product/report/template/template.types.ts",
    "lib/product/report/template/template.registry.ts",
    "lib/product/report/job/job.types.ts",
    "lib/product/report/job/job.registry.ts",
    "lib/product/report/render/render.types.ts",
    "lib/product/report/render/render.registry.ts",
    "lib/product/report/delivery/delivery.types.ts",
    "lib/product/report/delivery/delivery.registry.ts",
    "lib/product/report/report.manager.ts",
    "lib/product/report/verify/product.release.gate.ts",
    "lib/product/report/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_REPORT_ENGINE_ID === "enterprise-product-report-engine-v1",
    "report engine id",
  );
  check(
    PRODUCT_REPORT_ENGINE_VERSION === "product-report-1",
    "report engine version",
  );
  check(
    PRODUCT_REPORT_ENGINE_FREEZE_VERSION === "product-report-engine-freeze-1",
    "report engine freeze",
  );
  check(
    PRODUCT_REPORT_ENGINE_BASE === PRODUCT_DASHBOARD_FRAMEWORK_ID,
    "report base = dashboard framework",
  );
  check(
    PRODUCT_REPORT_FREEZE_VERSION === "product-report-engine-freeze-1",
    "report freeze tag",
  );
  check(
    PRODUCT_DASHBOARD_FRAMEWORK_ID ===
      "enterprise-product-dashboard-framework-v1",
    "dashboard framework preserved",
  );
  check(
    PRODUCT_KPI_MANAGEMENT_ID === "enterprise-product-kpi-management-v1",
    "kpi management preserved",
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
  check(REPORT_TEMPLATE_KINDS.length === 3, "template kinds");
  check(REPORT_JOB_STATUSES.length === 4, "job statuses");
  check(REPORT_FORMATS.length === 3, "report formats");
  check(DELIVERY_CHANNELS.length === 3, "delivery channels");
  check(REPORT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(REPORT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductReportReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductReportReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Report Engine ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

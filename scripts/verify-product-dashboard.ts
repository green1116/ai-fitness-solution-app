/**
 * Product Dashboard — Dashboard Framework verification
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
import { PRODUCT_KPI_MANAGEMENT_ID } from "../lib/product/kpi/management/management.constants";
import {
  DASHBOARD_KINDS,
  DASHBOARD_MANAGER_STATUSES,
  DASHBOARD_READINESS_VERDICTS,
  DASHBOARD_STATUSES,
  LAYOUT_REGIONS,
  PRODUCT_DASHBOARD_FRAMEWORK_BASE,
  PRODUCT_DASHBOARD_FRAMEWORK_FREEZE_VERSION,
  PRODUCT_DASHBOARD_FRAMEWORK_ID,
  PRODUCT_DASHBOARD_FRAMEWORK_VERSION,
  PRODUCT_DASHBOARD_FREEZE_VERSION,
  WIDGET_KINDS,
} from "../lib/product/dashboard/framework/framework.constants";
import {
  assertProductDashboardReleaseGatePass,
  checkProductDashboardReleaseGate,
} from "../lib/product/dashboard/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/dashboard/framework/framework.constants.ts",
    "lib/product/dashboard/framework/framework.types.ts",
    "lib/product/dashboard/framework/framework.readiness.ts",
    "lib/product/dashboard/board/board.types.ts",
    "lib/product/dashboard/board/board.registry.ts",
    "lib/product/dashboard/widget/widget.types.ts",
    "lib/product/dashboard/widget/widget.registry.ts",
    "lib/product/dashboard/layout/layout.types.ts",
    "lib/product/dashboard/layout/layout.registry.ts",
    "lib/product/dashboard/snapshot/snapshot.types.ts",
    "lib/product/dashboard/snapshot/snapshot.registry.ts",
    "lib/product/dashboard/dashboard.manager.ts",
    "lib/product/dashboard/verify/product.release.gate.ts",
    "lib/product/dashboard/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_DASHBOARD_FRAMEWORK_ID ===
      "enterprise-product-dashboard-framework-v1",
    "dashboard framework id",
  );
  check(
    PRODUCT_DASHBOARD_FRAMEWORK_VERSION === "product-dashboard-1",
    "dashboard framework version",
  );
  check(
    PRODUCT_DASHBOARD_FRAMEWORK_FREEZE_VERSION ===
      "product-dashboard-framework-freeze-1",
    "dashboard framework freeze",
  );
  check(
    PRODUCT_DASHBOARD_FRAMEWORK_BASE === PRODUCT_KPI_MANAGEMENT_ID,
    "dashboard base = kpi management",
  );
  check(
    PRODUCT_DASHBOARD_FREEZE_VERSION ===
      "product-dashboard-framework-freeze-1",
    "dashboard freeze tag",
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
  check(DASHBOARD_KINDS.length === 3, "dashboard kinds");
  check(DASHBOARD_STATUSES.length === 3, "dashboard statuses");
  check(WIDGET_KINDS.length === 4, "widget kinds");
  check(LAYOUT_REGIONS.length === 4, "layout regions");
  check(DASHBOARD_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(DASHBOARD_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductDashboardReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductDashboardReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Dashboard Framework ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

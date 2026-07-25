/**
 * Product BI — BI Integration verification
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
import { PRODUCT_FORECAST_TREND_ID } from "../lib/product/forecast/trend/trend.constants";
import { PRODUCT_KPI_MANAGEMENT_ID } from "../lib/product/kpi/management/management.constants";
import { PRODUCT_REPORT_ENGINE_ID } from "../lib/product/report/engine/engine.constants";
import {
  BI_CONNECTOR_KINDS,
  BI_CONNECTOR_STATUSES,
  BI_MANAGER_STATUSES,
  BI_QUERY_KINDS,
  BI_READINESS_VERDICTS,
  BI_SYNC_RESULTS,
  PRODUCT_BI_FREEZE_VERSION,
  PRODUCT_BI_INTEGRATION_BASE,
  PRODUCT_BI_INTEGRATION_FREEZE_VERSION,
  PRODUCT_BI_INTEGRATION_ID,
  PRODUCT_BI_INTEGRATION_VERSION,
} from "../lib/product/bi/integration/integration.constants";
import {
  assertProductBiReleaseGatePass,
  checkProductBiReleaseGate,
} from "../lib/product/bi/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/bi/integration/integration.constants.ts",
    "lib/product/bi/integration/integration.types.ts",
    "lib/product/bi/integration/integration.readiness.ts",
    "lib/product/bi/connector/connector.types.ts",
    "lib/product/bi/connector/connector.registry.ts",
    "lib/product/bi/catalog/catalog.types.ts",
    "lib/product/bi/catalog/catalog.registry.ts",
    "lib/product/bi/sync/sync.types.ts",
    "lib/product/bi/sync/sync.registry.ts",
    "lib/product/bi/query/query.types.ts",
    "lib/product/bi/query/query.registry.ts",
    "lib/product/bi/bi.manager.ts",
    "lib/product/bi/verify/product.release.gate.ts",
    "lib/product/bi/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_BI_INTEGRATION_ID === "enterprise-product-bi-integration-v1",
    "bi integration id",
  );
  check(
    PRODUCT_BI_INTEGRATION_VERSION === "product-bi-1",
    "bi integration version",
  );
  check(
    PRODUCT_BI_INTEGRATION_FREEZE_VERSION ===
      "product-bi-integration-freeze-1",
    "bi integration freeze",
  );
  check(
    PRODUCT_BI_INTEGRATION_BASE === PRODUCT_FORECAST_TREND_ID,
    "bi base = forecast trend",
  );
  check(
    PRODUCT_BI_FREEZE_VERSION === "product-bi-integration-freeze-1",
    "bi freeze tag",
  );
  check(
    PRODUCT_FORECAST_TREND_ID === "enterprise-product-forecast-trend-v1",
    "forecast trend preserved",
  );
  check(
    PRODUCT_REPORT_ENGINE_ID === "enterprise-product-report-engine-v1",
    "report engine preserved",
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
  check(BI_CONNECTOR_KINDS.length === 3, "connector kinds");
  check(BI_CONNECTOR_STATUSES.length === 3, "connector statuses");
  check(BI_SYNC_RESULTS.length === 3, "sync results");
  check(BI_QUERY_KINDS.length === 3, "query kinds");
  check(BI_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(BI_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductBiReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductBiReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product BI Integration ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

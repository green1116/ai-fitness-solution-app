/**
 * Product Analytics Audit — verification
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
import { PRODUCT_BI_INTEGRATION_ID } from "../lib/product/bi/integration/integration.constants";
import { PRODUCT_DASHBOARD_FRAMEWORK_ID } from "../lib/product/dashboard/framework/framework.constants";
import { PRODUCT_FORECAST_TREND_ID } from "../lib/product/forecast/trend/trend.constants";
import { PRODUCT_KPI_MANAGEMENT_ID } from "../lib/product/kpi/management/management.constants";
import { PRODUCT_REPORT_ENGINE_ID } from "../lib/product/report/engine/engine.constants";
import {
  ANALYTICS_AUDIT_CATEGORIES,
  ANALYTICS_AUDIT_MANAGER_STATUSES,
  ANALYTICS_AUDIT_READINESS_VERDICTS,
  ANALYTICS_AUDIT_SEVERITIES,
  ANALYTICS_INTEGRITY_RESULTS,
  ANALYTICS_TRAIL_STATUSES,
  PRODUCT_ANALYTICS_AUDIT_BASE,
  PRODUCT_ANALYTICS_AUDIT_FREEZE_TAG,
  PRODUCT_ANALYTICS_AUDIT_FREEZE_VERSION,
  PRODUCT_ANALYTICS_AUDIT_ID,
  PRODUCT_ANALYTICS_AUDIT_VERSION,
} from "../lib/product/analytics-audit/traceability/traceability.constants";
import {
  assertProductAnalyticsAuditReleaseGatePass,
  checkProductAnalyticsAuditReleaseGate,
} from "../lib/product/analytics-audit/verify/product.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/product/analytics-audit/traceability/traceability.constants.ts",
    "lib/product/analytics-audit/traceability/traceability.types.ts",
    "lib/product/analytics-audit/traceability/traceability.readiness.ts",
    "lib/product/analytics-audit/event/event.types.ts",
    "lib/product/analytics-audit/event/event.registry.ts",
    "lib/product/analytics-audit/trail/trail.types.ts",
    "lib/product/analytics-audit/trail/trail.registry.ts",
    "lib/product/analytics-audit/integrity/integrity.types.ts",
    "lib/product/analytics-audit/integrity/integrity.registry.ts",
    "lib/product/analytics-audit/query/query.types.ts",
    "lib/product/analytics-audit/query/query.registry.ts",
    "lib/product/analytics-audit/analytics-audit.manager.ts",
    "lib/product/analytics-audit/verify/product.release.gate.ts",
    "lib/product/analytics-audit/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    PRODUCT_ANALYTICS_AUDIT_ID ===
      "enterprise-product-analytics-audit-v1",
    "analytics audit id",
  );
  check(
    PRODUCT_ANALYTICS_AUDIT_VERSION === "product-analytics-audit-1",
    "analytics audit version",
  );
  check(
    PRODUCT_ANALYTICS_AUDIT_FREEZE_VERSION ===
      "product-analytics-audit-freeze-1",
    "analytics audit freeze",
  );
  check(
    PRODUCT_ANALYTICS_AUDIT_BASE === PRODUCT_BI_INTEGRATION_ID,
    "analytics audit base = bi integration",
  );
  check(
    PRODUCT_ANALYTICS_AUDIT_FREEZE_TAG ===
      "product-analytics-audit-freeze-1",
    "analytics audit freeze tag",
  );
  check(
    PRODUCT_BI_INTEGRATION_ID === "enterprise-product-bi-integration-v1",
    "bi integration preserved",
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
  check(ANALYTICS_AUDIT_CATEGORIES.length === 6, "analytics audit categories");
  check(ANALYTICS_AUDIT_SEVERITIES.length === 3, "analytics audit severities");
  check(ANALYTICS_TRAIL_STATUSES.length === 3, "analytics trail statuses");
  check(ANALYTICS_INTEGRITY_RESULTS.length === 2, "integrity results");
  check(ANALYTICS_AUDIT_READINESS_VERDICTS.length === 3, "readiness verdicts");
  check(ANALYTICS_AUDIT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform v1 intact");

  const platform = buildPlatformV1Manifest();
  check(platform.aligned === true, "platform aligned");
  console.log("✓ constants + freeze tags");
}

function checkGate() {
  const gate = checkProductAnalyticsAuditReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  assertProductAnalyticsAuditReleaseGatePass(gate);
  console.log("✓ release gate PASS");
  console.log(`  ${gate.summary}`);
}

function main() {
  console.log("=== Product Analytics Audit ===");
  checkModules();
  checkConstants();
  checkGate();
  console.log("ALL PASS");
}

main();

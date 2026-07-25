/**
 * Product Analytics Audit — Analytics Traceability Release Gate
 * MODULE: Analytics Audit
 * BASE: enterprise-product-bi-integration-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_BILLING_BASELINE_ID } from "../../billing-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID } from "../../customer-baseline/freeze/freeze.lock";
import { PRODUCT_ANALYTICS_FOUNDATION_ID } from "../../analytics/foundation/foundation.constants";
import { PRODUCT_BI_INTEGRATION_ID } from "../../bi/integration/integration.constants";
import { PRODUCT_DASHBOARD_FRAMEWORK_ID } from "../../dashboard/framework/framework.constants";
import { PRODUCT_FORECAST_TREND_ID } from "../../forecast/trend/trend.constants";
import { PRODUCT_KPI_MANAGEMENT_ID } from "../../kpi/management/management.constants";
import { PRODUCT_REPORT_ENGINE_ID } from "../../report/engine/engine.constants";
import {
  assertAnalyticsAuditReadinessReady,
  clearAnalyticsAuditLayer,
  createAnalyticsAuditManager,
  getAnalyticsAuditRegistryManifest,
} from "../analytics-audit.manager";
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
} from "../traceability/traceability.constants";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_ANALYTICS_AUDIT_SIGNOFF_VERSION =
  "product-analytics-audit-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearAnalyticsAuditLayer();
}

export function checkProductAnalyticsAuditReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "AAU-CONSTANTS",
      "traceability",
      "Product analytics audit version constants",
      PRODUCT_ANALYTICS_AUDIT_ID ===
        "enterprise-product-analytics-audit-v1" &&
        PRODUCT_ANALYTICS_AUDIT_VERSION === "product-analytics-audit-1" &&
        PRODUCT_ANALYTICS_AUDIT_BASE === PRODUCT_BI_INTEGRATION_ID &&
        PRODUCT_ANALYTICS_AUDIT_FREEZE_VERSION ===
          "product-analytics-audit-freeze-1" &&
        PRODUCT_ANALYTICS_AUDIT_FREEZE_TAG ===
          "product-analytics-audit-freeze-1" &&
        ANALYTICS_AUDIT_CATEGORIES.length === 6 &&
        ANALYTICS_AUDIT_SEVERITIES.length === 3 &&
        ANALYTICS_TRAIL_STATUSES.length === 3 &&
        ANALYTICS_INTEGRITY_RESULTS.length === 2 &&
        ANALYTICS_AUDIT_READINESS_VERDICTS.length === 3 &&
        ANALYTICS_AUDIT_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_ANALYTICS_AUDIT_ID} base=${PRODUCT_ANALYTICS_AUDIT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AAU-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AAU-BI-BASE",
      "product-bi-integration",
      "BI integration BASE preserved",
      PRODUCT_ANALYTICS_AUDIT_BASE ===
        "enterprise-product-bi-integration-v1" &&
        PRODUCT_BI_INTEGRATION_ID ===
          "enterprise-product-bi-integration-v1" &&
        PRODUCT_FORECAST_TREND_ID ===
          "enterprise-product-forecast-trend-v1" &&
        PRODUCT_REPORT_ENGINE_ID === "enterprise-product-report-engine-v1" &&
        PRODUCT_DASHBOARD_FRAMEWORK_ID ===
          "enterprise-product-dashboard-framework-v1" &&
        PRODUCT_KPI_MANAGEMENT_ID ===
          "enterprise-product-kpi-management-v1" &&
        PRODUCT_ANALYTICS_FOUNDATION_ID ===
          "enterprise-product-analytics-foundation-v1" &&
        ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID ===
          "enterprise-product-customer-baseline-v1" &&
        ENTERPRISE_PRODUCT_BILLING_BASELINE_ID ===
          "enterprise-product-billing-baseline-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_ANALYTICS_AUDIT_BASE}`,
    ),
  );

  checks.push(
    check(
      "AAU-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createAnalyticsAuditManager({
      managerId: "prod-aau-gate",
    });
    mgr.initialize();
    mgr.start();

    const event = mgr.recordAnalyticsAuditEvent({
      id: "aau.gate.evt",
      category: "BI",
      subjectId: "bi.gate.cn",
      action: "SYNC_DATASET",
      resource: "bi/catalog/NRR_FORECAST",
      severity: "INFO",
    });
    const trail = mgr.appendAnalyticsTrail({
      id: "aau.gate.trl",
      eventId: event.id,
    });
    const seal = mgr.sealAnalyticsTrail({
      id: "aau.gate.sel",
      trailId: trail.id,
    });
    const verified = mgr.verifyAnalyticsSeal({ sealId: seal.id });
    const query = mgr.queryAnalyticsAudit({
      id: "aau.gate.qry",
      category: "BI",
      subjectId: "bi.gate.cn",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getAnalyticsAuditRegistryManifest();

    const ok =
      verified.result === "INTACT" &&
      query.matchCount >= 1 &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_ANALYTICS_AUDIT_ID &&
      registry.base === PRODUCT_ANALYTICS_AUDIT_BASE &&
      registry.eventCount >= 1 &&
      registry.trailCount >= 1 &&
      registry.sealCount >= 1 &&
      registry.queryCount >= 1;

    try {
      assertAnalyticsAuditReadinessReady(readiness);
      checks.push(
        check(
          "AAU-STACK",
          "traceability",
          "Event / trail / integrity / query",
          ok,
          `readiness=${readiness.verdict} seal=${verified.result}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AAU-STACK",
          "traceability",
          "Event / trail / integrity / query",
          false,
          error instanceof Error
            ? error.message
            : "product analytics audit not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "AAU-STACK",
        "traceability",
        "Event / trail / integrity / query",
        false,
        error instanceof Error
          ? error.message
          : "product analytics audit probe failed",
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-analytics-audit-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAnalyticsAuditReleaseGatePass(
  gate: ReleaseGateResult = checkProductAnalyticsAuditReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product analytics audit release gate failed: ${gate.summary}`,
    );
  }
}

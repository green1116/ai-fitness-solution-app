/**
 * Product BI — BI Integration Release Gate
 * MODULE: BI
 * BASE: enterprise-product-forecast-trend-v1
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
import { PRODUCT_DASHBOARD_FRAMEWORK_ID } from "../../dashboard/framework/framework.constants";
import { PRODUCT_FORECAST_TREND_ID } from "../../forecast/trend/trend.constants";
import { PRODUCT_KPI_MANAGEMENT_ID } from "../../kpi/management/management.constants";
import { PRODUCT_REPORT_ENGINE_ID } from "../../report/engine/engine.constants";
import {
  assertBiIntegrationReadinessReady,
  clearBiIntegrationLayer,
  createBiManager,
  getBiRegistryManifest,
} from "../bi.manager";
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
} from "../integration/integration.constants";

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

export const PRODUCT_BI_SIGNOFF_VERSION =
  "product-bi-signoff-1" as const;

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
  clearBiIntegrationLayer();
}

export function checkProductBiReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "BI-CONSTANTS",
      "integration",
      "Product BI integration version constants",
      PRODUCT_BI_INTEGRATION_ID ===
        "enterprise-product-bi-integration-v1" &&
        PRODUCT_BI_INTEGRATION_VERSION === "product-bi-1" &&
        PRODUCT_BI_INTEGRATION_BASE === PRODUCT_FORECAST_TREND_ID &&
        PRODUCT_BI_INTEGRATION_FREEZE_VERSION ===
          "product-bi-integration-freeze-1" &&
        PRODUCT_BI_FREEZE_VERSION === "product-bi-integration-freeze-1" &&
        BI_CONNECTOR_KINDS.length === 3 &&
        BI_CONNECTOR_STATUSES.length === 3 &&
        BI_SYNC_RESULTS.length === 3 &&
        BI_QUERY_KINDS.length === 3 &&
        BI_READINESS_VERDICTS.length === 3 &&
        BI_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_BI_INTEGRATION_ID} base=${PRODUCT_BI_INTEGRATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "BI-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "BI-FST-BASE",
      "product-forecast-trend",
      "Forecast trend BASE preserved",
      PRODUCT_BI_INTEGRATION_BASE ===
        "enterprise-product-forecast-trend-v1" &&
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
      `base=${PRODUCT_BI_INTEGRATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "BI-UPSTREAM",
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
    const mgr = createBiManager({ managerId: "prod-bi-gate" });
    mgr.initialize();
    mgr.start();

    const connector = mgr.registerConnector({
      id: "bi.gate.cn",
      name: "Enterprise Warehouse",
      kind: "WAREHOUSE",
      endpoint: "warehouse://analytics/primary",
    });
    mgr.connectBi({ connectorId: connector.id });
    const catalog = mgr.registerCatalogEntry({
      id: "bi.gate.cat",
      connectorId: connector.id,
      datasetCode: "NRR_FORECAST",
      sourceRef: "fst.gate.pj",
    });
    mgr.runBiSync({
      id: "bi.gate.sync",
      catalogId: catalog.id,
      result: "SUCCESS",
      rowCount: 120,
    });
    mgr.executeBiQuery({
      id: "bi.gate.qry",
      connectorId: connector.id,
      kind: "FORECAST",
      expression: "SELECT nrr FROM forecast WHERE horizon='MEDIUM'",
      matchCount: 1,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getBiRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.integrationId === PRODUCT_BI_INTEGRATION_ID &&
      registry.base === PRODUCT_BI_INTEGRATION_BASE &&
      registry.connectorCount >= 1 &&
      registry.catalogCount >= 1 &&
      registry.syncCount >= 1 &&
      registry.queryCount >= 1;

    try {
      assertBiIntegrationReadinessReady(readiness);
      checks.push(
        check(
          "BI-STACK",
          "integration",
          "Connector / catalog / sync / query",
          ok,
          `readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "BI-STACK",
          "integration",
          "Connector / catalog / sync / query",
          false,
          error instanceof Error
            ? error.message
            : "product bi not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "BI-STACK",
        "integration",
        "Connector / catalog / sync / query",
        false,
        error instanceof Error
          ? error.message
          : "product bi probe failed",
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
      `product-bi-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductBiReleaseGatePass(
  gate: ReleaseGateResult = checkProductBiReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product BI release gate failed: ${gate.summary}`);
  }
}

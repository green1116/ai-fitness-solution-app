/**
 * Product Forecast — Forecast Trend Release Gate
 * MODULE: Forecast
 * BASE: enterprise-product-report-engine-v1
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
import { PRODUCT_KPI_MANAGEMENT_ID } from "../../kpi/management/management.constants";
import { PRODUCT_REPORT_ENGINE_ID } from "../../report/engine/engine.constants";
import {
  assertForecastTrendReadinessReady,
  clearForecastTrendLayer,
  createForecastManager,
  getForecastRegistryManifest,
} from "../forecast.manager";
import {
  FORECAST_MANAGER_STATUSES,
  FORECAST_MODEL_KINDS,
  FORECAST_READINESS_VERDICTS,
  PRODUCT_FORECAST_FREEZE_VERSION,
  PRODUCT_FORECAST_TREND_BASE,
  PRODUCT_FORECAST_TREND_FREEZE_VERSION,
  PRODUCT_FORECAST_TREND_ID,
  PRODUCT_FORECAST_TREND_VERSION,
  PROJECTION_HORIZONS,
  SERIES_GRANULARITIES,
  TREND_DIRECTIONS,
} from "../trend/trend.constants";

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

export const PRODUCT_FORECAST_SIGNOFF_VERSION =
  "product-forecast-signoff-1" as const;

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
  clearForecastTrendLayer();
}

export function checkProductForecastReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "FST-CONSTANTS",
      "trend",
      "Product forecast trend version constants",
      PRODUCT_FORECAST_TREND_ID ===
        "enterprise-product-forecast-trend-v1" &&
        PRODUCT_FORECAST_TREND_VERSION === "product-forecast-1" &&
        PRODUCT_FORECAST_TREND_BASE === PRODUCT_REPORT_ENGINE_ID &&
        PRODUCT_FORECAST_TREND_FREEZE_VERSION ===
          "product-forecast-trend-freeze-1" &&
        PRODUCT_FORECAST_FREEZE_VERSION ===
          "product-forecast-trend-freeze-1" &&
        FORECAST_MODEL_KINDS.length === 3 &&
        SERIES_GRANULARITIES.length === 3 &&
        PROJECTION_HORIZONS.length === 3 &&
        TREND_DIRECTIONS.length === 3 &&
        FORECAST_READINESS_VERDICTS.length === 3 &&
        FORECAST_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_FORECAST_TREND_ID} base=${PRODUCT_FORECAST_TREND_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "FST-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "FST-RPT-BASE",
      "product-report-engine",
      "Report engine BASE preserved",
      PRODUCT_FORECAST_TREND_BASE ===
        "enterprise-product-report-engine-v1" &&
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
      `base=${PRODUCT_FORECAST_TREND_BASE}`,
    ),
  );

  checks.push(
    check(
      "FST-UPSTREAM",
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
    const mgr = createForecastManager({ managerId: "prod-fst-gate" });
    mgr.initialize();
    mgr.start();

    const model = mgr.registerModel({
      id: "fst.gate.md",
      code: "NRR_LINEAR",
      kind: "LINEAR",
      metricId: "anl.gate.met",
    });
    const series = mgr.ingestSeries({
      id: "fst.gate.sr",
      modelId: model.id,
      granularity: "MONTH",
      pointCount: 12,
    });
    const projection = mgr.projectForecast({
      id: "fst.gate.pj",
      seriesId: series.id,
      horizon: "MEDIUM",
      predictedValue: 112,
      confidence: 0.84,
    });
    mgr.detectTrend({
      id: "fst.gate.tr",
      projectionId: projection.id,
      direction: "UP",
      slope: 0.12,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getForecastRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.trendId === PRODUCT_FORECAST_TREND_ID &&
      registry.base === PRODUCT_FORECAST_TREND_BASE &&
      registry.modelCount >= 1 &&
      registry.seriesCount >= 1 &&
      registry.projectionCount >= 1 &&
      registry.trendCount >= 1;

    try {
      assertForecastTrendReadinessReady(readiness);
      checks.push(
        check(
          "FST-STACK",
          "trend",
          "Model / series / projection / trend",
          ok,
          `readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "FST-STACK",
          "trend",
          "Model / series / projection / trend",
          false,
          error instanceof Error
            ? error.message
            : "product forecast not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "FST-STACK",
        "trend",
        "Model / series / projection / trend",
        false,
        error instanceof Error
          ? error.message
          : "product forecast probe failed",
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
      `product-forecast-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductForecastReleaseGatePass(
  gate: ReleaseGateResult = checkProductForecastReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product forecast release gate failed: ${gate.summary}`,
    );
  }
}

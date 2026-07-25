/**
 * Product Analytics — readiness
 */

import { ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID } from "../../customer-baseline/freeze/freeze.lock";
import { listDatasets } from "../dataset/dataset.registry";
import { listMetrics } from "../metric/metric.registry";
import { listPipelines } from "../pipeline/pipeline.registry";
import { listReports } from "../report/report.registry";
import { PRODUCT_ANALYTICS_FOUNDATION_BASE } from "./foundation.constants";
import type {
  AnalyticsReadinessCheck,
  AnalyticsReadinessResult,
} from "./foundation.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AnalyticsReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateAnalyticsFoundationReadiness(): AnalyticsReadinessResult {
  const checks: AnalyticsReadinessCheck[] = [];

  checks.push(
    check(
      "ANL-BASE",
      "foundation",
      "Customer baseline aligned",
      PRODUCT_ANALYTICS_FOUNDATION_BASE ===
        ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID,
      `base=${PRODUCT_ANALYTICS_FOUNDATION_BASE}`,
    ),
  );

  const metrics = listMetrics();
  checks.push(
    check(
      "ANL-MET",
      "metric",
      "Metrics present",
      metrics.length >= 1,
      `metrics=${metrics.length}`,
    ),
  );

  const datasets = listDatasets();
  checks.push(
    check(
      "ANL-DS",
      "dataset",
      "Active datasets present",
      datasets.some((d) => d.status === "ACTIVE"),
      `datasets=${datasets.length}`,
    ),
  );

  const pipelines = listPipelines();
  checks.push(
    check(
      "ANL-PIPE",
      "pipeline",
      "Succeeded pipelines present",
      pipelines.some((p) => p.status === "SUCCEEDED"),
      `pipelines=${pipelines.length}`,
    ),
  );

  const reports = listReports();
  checks.push(
    check(
      "ANL-RPT",
      "report",
      "Reports present",
      reports.length >= 1,
      `reports=${reports.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-analytics readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAnalyticsFoundationReadinessReady(
  result: AnalyticsReadinessResult,
): asserts result is AnalyticsReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product analytics foundation not ready: ${result.summary}`,
    );
  }
}

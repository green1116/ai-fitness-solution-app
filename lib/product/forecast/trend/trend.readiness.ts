/**
 * Product Forecast — readiness
 */

import { PRODUCT_REPORT_ENGINE_ID } from "../../report/engine/engine.constants";
import { listModels } from "../model/model.registry";
import { listProjections } from "../projection/projection.registry";
import { listSeries } from "../series/series.registry";
import { listTrendSignals } from "../signal/signal.registry";
import { PRODUCT_FORECAST_TREND_BASE } from "./trend.constants";
import type {
  ForecastReadinessCheck,
  ForecastReadinessResult,
} from "./trend.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): ForecastReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateForecastTrendReadiness(): ForecastReadinessResult {
  const checks: ForecastReadinessCheck[] = [];

  checks.push(
    check(
      "FST-BASE",
      "trend",
      "Report engine aligned",
      PRODUCT_FORECAST_TREND_BASE === PRODUCT_REPORT_ENGINE_ID,
      `base=${PRODUCT_FORECAST_TREND_BASE}`,
    ),
  );

  const models = listModels();
  checks.push(
    check(
      "FST-MD",
      "model",
      "Forecast models present",
      models.length >= 1,
      `models=${models.length}`,
    ),
  );

  const series = listSeries();
  checks.push(
    check(
      "FST-SR",
      "series",
      "Series present",
      series.some((s) => s.pointCount >= 1),
      `series=${series.length}`,
    ),
  );

  const projections = listProjections();
  checks.push(
    check(
      "FST-PJ",
      "projection",
      "Projections present",
      projections.length >= 1,
      `projections=${projections.length}`,
    ),
  );

  const trends = listTrendSignals();
  checks.push(
    check(
      "FST-TR",
      "signal",
      "Trend signals present",
      trends.length >= 1,
      `trends=${trends.length}`,
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
    summary: `product-forecast readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertForecastTrendReadinessReady(
  result: ForecastReadinessResult,
): asserts result is ForecastReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product forecast trend not ready: ${result.summary}`,
    );
  }
}

/**
 * E05-P4 — Forecasting Runtime verification
 * Prediction layer above KPI intelligence
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { buildIntelligenceFoundation } from "../lib/intelligence/e05/core/intelligence.lifecycle";
import {
  E05_INTELLIGENCE_PLATFORM_ID,
  E05_INTELLIGENCE_VERSION,
} from "../lib/intelligence/e05/core/intelligence.constants";
import { buildAnalyticsRegistryManifest } from "../lib/intelligence/e05/analytics/analytics.registry";
import {
  E05_ANALYTICS_RUNTIME_ID,
  E05_ANALYTICS_VERSION,
} from "../lib/intelligence/e05/analytics/analytics.constants";
import { buildKpiRegistryManifest } from "../lib/intelligence/e05/kpi/kpi.registry";
import {
  E05_KPI_ENGINE_ID,
  E05_KPI_VERSION,
} from "../lib/intelligence/e05/kpi/kpi.constants";
import {
  E05_FORECAST_BASE,
  E05_FORECAST_RUNTIME_ID,
  E05_FORECAST_VERSION,
  FORECAST_HORIZONS,
  FORECAST_MODEL_KINDS,
} from "../lib/intelligence/e05/forecast/forecast.constants";
import {
  FORECAST_CATALOG,
  buildForecastRegistryManifest,
  getForecastById,
  listRequiredForecasts,
} from "../lib/intelligence/e05/forecast/forecast.registry";
import { projectForecast } from "../lib/intelligence/e05/forecast/forecast.model";
import { executeForecastOrThrow } from "../lib/intelligence/e05/forecast/forecast.engine";
import {
  appendForecastTraceEvent,
  createForecastRuntimeTrace,
} from "../lib/intelligence/e05/forecast/forecast.trace";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E05_P1 = [
  "lib/intelligence/e05/core/intelligence.types.ts",
  "lib/intelligence/e05/core/intelligence.constants.ts",
  "lib/intelligence/e05/core/intelligence.lifecycle.ts",
  "lib/intelligence/e05/core/intelligence.registry.ts",
  "lib/intelligence/e05/runtime/intelligence.executor.ts",
  "lib/intelligence/e05/insight/insight.registry.ts",
  "lib/intelligence/e05/index.ts",
] as const;

const FROZEN_E05_P2 = [
  "lib/intelligence/e05/analytics/analytics.types.ts",
  "lib/intelligence/e05/analytics/analytics.constants.ts",
  "lib/intelligence/e05/analytics/analytics.registry.ts",
  "lib/intelligence/e05/analytics/analytics.engine.ts",
  "lib/intelligence/e05/analytics/analytics.metric.ts",
  "lib/intelligence/e05/analytics/analytics.trace.ts",
] as const;

const FROZEN_E05_P3 = [
  "lib/intelligence/e05/kpi/kpi.types.ts",
  "lib/intelligence/e05/kpi/kpi.constants.ts",
  "lib/intelligence/e05/kpi/kpi.registry.ts",
  "lib/intelligence/e05/kpi/kpi.engine.ts",
  "lib/intelligence/e05/kpi/kpi.evaluator.ts",
  "lib/intelligence/e05/kpi/kpi.trace.ts",
] as const;

const FROZEN_E04 = [
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/business-agent/e04/runtime/business-agent.executor.ts",
] as const;

const FROZEN_E03 = [
  "lib/agent-platform/e03/core/agent.registry.ts",
  "lib/agent-platform/e03/runtime/agent.executor.ts",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function sha1(rel: string): string {
  return createHash("sha1")
    .update(fs.readFileSync(path.join(ROOT, rel)))
    .digest("hex");
}

function checkModules() {
  const required = [
    "lib/intelligence/e05/forecast/forecast.types.ts",
    "lib/intelligence/e05/forecast/forecast.constants.ts",
    "lib/intelligence/e05/forecast/forecast.registry.ts",
    "lib/intelligence/e05/forecast/forecast.engine.ts",
    "lib/intelligence/e05/forecast/forecast.model.ts",
    "lib/intelligence/e05/forecast/forecast.trace.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkFrozen(
  label: string,
  files: readonly string[],
  baseline: Record<string, string>,
) {
  for (const rel of files) {
    check(sha1(rel) === baseline[rel], `${label} modified: ${rel}`);
  }
}

function checkBasesIntact() {
  const e05 = buildIntelligenceFoundation();
  check(e05.ready === true, "E05 P1 ready");
  check(e05.platformId === E05_INTELLIGENCE_PLATFORM_ID, "P1 id");
  check(e05.version === E05_INTELLIGENCE_VERSION, "P1 version");

  const analytics = buildAnalyticsRegistryManifest();
  check(analytics.catalogComplete === true, "P2 ready");
  check(analytics.runtimeId === E05_ANALYTICS_RUNTIME_ID, "P2 id");
  check(analytics.version === E05_ANALYTICS_VERSION, "P2 version");

  const kpi = buildKpiRegistryManifest();
  check(kpi.catalogComplete === true, "P3 ready");
  check(kpi.engineId === E05_KPI_ENGINE_ID, "P3 id");
  check(kpi.version === E05_KPI_VERSION, "P3 version");

  check(
    E05_FORECAST_BASE === "enterprise-e05-p3-kpi-intelligence-engine-v1",
    "forecast base",
  );
  console.log("✓ E03 + E04 + E05 P1-P3 unmodified / bases intact");
}

function testRegistryAndModel() {
  check(FORECAST_HORIZONS.length === 3, "horizons");
  check(FORECAST_MODEL_KINDS.length === 3, "model kinds");
  check(FORECAST_CATALOG.length === 6, "forecast catalog");
  check(listRequiredForecasts().length === 5, "required forecasts");

  const manifest = buildForecastRegistryManifest();
  check(manifest.catalogComplete === true, "catalog complete");
  check(manifest.runtimeId === E05_FORECAST_RUNTIME_ID, "runtime id");
  check(manifest.version === E05_FORECAST_VERSION, "version");
  check(manifest.base === E05_FORECAST_BASE, "base");

  const opportunity = getForecastById("e05.forecast.opportunity");
  check(Boolean(opportunity), "opportunity forecast");

  const projection = projectForecast(opportunity!, {
    kpiId: "e05.kpi.opportunity",
    metricId: "e05.metric.opportunity-score",
    value: 80,
    status: "green",
    target: 85,
    delta: -5,
    interpretation: "test",
    readOnly: true,
  });
  check(projection.points.length === 3, "projection points");
  check(projection.baseline === 80, "baseline");
  check(projection.projected === 85, "target-gap projected");
  check(projection.direction === "up", "direction up");

  console.log("✓ registry + model");
}

function testEngineAndTrace() {
  const trace = createForecastRuntimeTrace({
    instanceId: "inst_x",
    forecastId: "e05.forecast.opportunity",
    taskId: "task_x",
  });
  const withEvent = appendForecastTraceEvent(trace, "ready", "boot");
  check(withEvent.eventCount === 1, "trace event");

  const opportunity = getForecastById("e05.forecast.opportunity");
  check(Boolean(opportunity), "opportunity forecast present");

  const run = executeForecastOrThrow(opportunity!, {
    input: {
      goal: "星河科技园健身中心预测",
      opportunityScore: 82,
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "verify-e05-p4" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.projection.baseline === 82, "baseline from kpi");
  check(run.result.projection.points.length === 3, "points");
  check(run.result.kpiId === "e05.kpi.opportunity", "kpi bound");
  check(run.trace.eventCount >= 4, "trace events");
  check(run.result.traceId === run.trace.traceId, "trace linked");

  for (const forecast of listRequiredForecasts()) {
    const bundle = executeForecastOrThrow(forecast, {
      input: {
        goal: `probe:${forecast.id}`,
        opportunityScore: 82,
        riskIndex: 25,
        pricingBand: 3,
        complianceRatio: 0.92,
        milestoneCount: 6,
        synthesisIndex: 78,
      },
    });
    check(bundle.result.success === true, `${forecast.id} success`);
    check(bundle.result.projection.points.length >= 1, `${forecast.id} points`);
  }

  console.log("✓ forecast engine → kpi bridge");
}

function main() {
  console.log("E05-P4 — Forecasting Runtime Verification\n");

  const baseline: Record<string, string> = {};
  for (const rel of [
    ...FROZEN_E05_P1,
    ...FROZEN_E05_P2,
    ...FROZEN_E05_P3,
    ...FROZEN_E04,
    ...FROZEN_E03,
  ]) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E05 P1", FROZEN_E05_P1, baseline);
  checkFrozen("E05 P2", FROZEN_E05_P2, baseline);
  checkFrozen("E05 P3", FROZEN_E05_P3, baseline);
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();
  testRegistryAndModel();
  testEngineAndTrace();
  checkFrozen("E05 P1", FROZEN_E05_P1, baseline);
  checkFrozen("E05 P2", FROZEN_E05_P2, baseline);
  checkFrozen("E05 P3", FROZEN_E05_P3, baseline);
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();

  console.log("\nPASS — E05 P4 forecasting runtime");
}

main();

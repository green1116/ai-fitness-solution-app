/**
 * E05-P5 — Optimization Engine verification
 * Optimization layer above forecasting
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
import { buildForecastRegistryManifest } from "../lib/intelligence/e05/forecast/forecast.registry";
import {
  E05_FORECAST_RUNTIME_ID,
  E05_FORECAST_VERSION,
} from "../lib/intelligence/e05/forecast/forecast.constants";
import {
  E05_OPTIMIZATION_BASE,
  E05_OPTIMIZATION_ENGINE_ID,
  E05_OPTIMIZATION_VERSION,
  OPTIMIZATION_OBJECTIVE_KINDS,
  OPTIMIZATION_OPTION_ACTIONS,
} from "../lib/intelligence/e05/optimization/optimization.constants";
import {
  OPTIMIZATION_CATALOG,
  buildOptimizationRegistryManifest,
  getOptimizationById,
  listRequiredOptimizations,
} from "../lib/intelligence/e05/optimization/optimization.registry";
import { solveOptimization } from "../lib/intelligence/e05/optimization/optimization.solver";
import { executeOptimizationOrThrow } from "../lib/intelligence/e05/optimization/optimization.engine";
import {
  appendOptimizationTraceEvent,
  createOptimizationRuntimeTrace,
} from "../lib/intelligence/e05/optimization/optimization.trace";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E05_P1 = [
  "lib/intelligence/e05/core/intelligence.types.ts",
  "lib/intelligence/e05/core/intelligence.constants.ts",
  "lib/intelligence/e05/core/intelligence.lifecycle.ts",
  "lib/intelligence/e05/core/intelligence.registry.ts",
  "lib/intelligence/e05/runtime/intelligence.executor.ts",
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

const FROZEN_E05_P4 = [
  "lib/intelligence/e05/forecast/forecast.types.ts",
  "lib/intelligence/e05/forecast/forecast.constants.ts",
  "lib/intelligence/e05/forecast/forecast.registry.ts",
  "lib/intelligence/e05/forecast/forecast.engine.ts",
  "lib/intelligence/e05/forecast/forecast.model.ts",
  "lib/intelligence/e05/forecast/forecast.trace.ts",
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
    "lib/intelligence/e05/optimization/optimization.types.ts",
    "lib/intelligence/e05/optimization/optimization.constants.ts",
    "lib/intelligence/e05/optimization/optimization.registry.ts",
    "lib/intelligence/e05/optimization/optimization.engine.ts",
    "lib/intelligence/e05/optimization/optimization.solver.ts",
    "lib/intelligence/e05/optimization/optimization.trace.ts",
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

  const forecast = buildForecastRegistryManifest();
  check(forecast.catalogComplete === true, "P4 ready");
  check(forecast.runtimeId === E05_FORECAST_RUNTIME_ID, "P4 id");
  check(forecast.version === E05_FORECAST_VERSION, "P4 version");

  check(
    E05_OPTIMIZATION_BASE === "enterprise-e05-forecasting-runtime-v1",
    "optimization base",
  );
  console.log("✓ E03 + E04 + E05 P1-P4 unmodified / bases intact");
}

function testRegistryAndSolver() {
  check(OPTIMIZATION_OBJECTIVE_KINDS.length === 3, "objectives");
  check(OPTIMIZATION_OPTION_ACTIONS.length === 4, "actions");
  check(OPTIMIZATION_CATALOG.length === 6, "catalog");
  check(listRequiredOptimizations().length === 5, "required");

  const manifest = buildOptimizationRegistryManifest();
  check(manifest.catalogComplete === true, "catalog complete");
  check(manifest.engineId === E05_OPTIMIZATION_ENGINE_ID, "engine id");
  check(manifest.version === E05_OPTIMIZATION_VERSION, "version");
  check(manifest.base === E05_OPTIMIZATION_BASE, "base");

  const opportunity = getOptimizationById("e05.opt.opportunity");
  check(Boolean(opportunity), "opportunity opt");

  const recommendation = solveOptimization(opportunity!, {
    forecastId: "e05.forecast.opportunity",
    kpiId: "e05.kpi.opportunity",
    modelKind: "target-gap",
    horizon: "near",
    baseline: 80,
    projected: 85,
    direction: "up",
    confidence: 0.85,
    points: [],
    narrative: "test",
    readOnly: true,
  });
  check(recommendation.scores.length === 3, "scores");
  check(recommendation.selectedAction === "accelerate", "prefer accelerate");
  check(Boolean(recommendation.summary), "summary");

  console.log("✓ registry + solver");
}

function testEngineAndTrace() {
  const trace = createOptimizationRuntimeTrace({
    instanceId: "inst_x",
    optimizationId: "e05.opt.opportunity",
    taskId: "task_x",
  });
  const withEvent = appendOptimizationTraceEvent(trace, "ready", "boot");
  check(withEvent.eventCount === 1, "trace event");

  const opportunity = getOptimizationById("e05.opt.opportunity");
  check(Boolean(opportunity), "opportunity opt present");

  const run = executeOptimizationOrThrow(opportunity!, {
    input: {
      goal: "星河科技园健身中心优化建议",
      opportunityScore: 82,
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "verify-e05-p5" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.recommendation.scores.length >= 2, "option scores");
  check(Boolean(run.result.recommendation.selectedOptionId), "selected");
  check(run.result.forecastId === "e05.forecast.opportunity", "forecast bound");
  check(run.trace.eventCount >= 4, "trace events");
  check(run.result.traceId === run.trace.traceId, "trace linked");

  for (const optimization of listRequiredOptimizations()) {
    const bundle = executeOptimizationOrThrow(optimization, {
      input: {
        goal: `probe:${optimization.id}`,
        opportunityScore: 82,
        riskIndex: 25,
        pricingBand: 3,
        complianceRatio: 0.92,
        milestoneCount: 6,
        synthesisIndex: 78,
      },
    });
    check(bundle.result.success === true, `${optimization.id} success`);
    check(
      bundle.result.recommendation.scores.length >= 2,
      `${optimization.id} scores`,
    );
  }

  console.log("✓ optimization engine → forecast bridge");
}

function main() {
  console.log("E05-P5 — Optimization Engine Verification\n");

  const baseline: Record<string, string> = {};
  for (const rel of [
    ...FROZEN_E05_P1,
    ...FROZEN_E05_P2,
    ...FROZEN_E05_P3,
    ...FROZEN_E05_P4,
    ...FROZEN_E04,
    ...FROZEN_E03,
  ]) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E05 P1", FROZEN_E05_P1, baseline);
  checkFrozen("E05 P2", FROZEN_E05_P2, baseline);
  checkFrozen("E05 P3", FROZEN_E05_P3, baseline);
  checkFrozen("E05 P4", FROZEN_E05_P4, baseline);
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();
  testRegistryAndSolver();
  testEngineAndTrace();
  checkFrozen("E05 P1", FROZEN_E05_P1, baseline);
  checkFrozen("E05 P2", FROZEN_E05_P2, baseline);
  checkFrozen("E05 P3", FROZEN_E05_P3, baseline);
  checkFrozen("E05 P4", FROZEN_E05_P4, baseline);
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();

  console.log("\nPASS — E05 P5 optimization engine");
}

main();

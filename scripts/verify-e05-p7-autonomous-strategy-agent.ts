/**
 * E05-P7 — Autonomous Strategy Agent verification
 * Strategy agent layer above simulation
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
import { buildOptimizationRegistryManifest } from "../lib/intelligence/e05/optimization/optimization.registry";
import {
  E05_OPTIMIZATION_ENGINE_ID,
  E05_OPTIMIZATION_VERSION,
} from "../lib/intelligence/e05/optimization/optimization.constants";
import { buildSimulationRegistryManifest } from "../lib/intelligence/e05/simulation/simulation.registry";
import {
  E05_SIMULATION_RUNTIME_ID,
  E05_SIMULATION_VERSION,
} from "../lib/intelligence/e05/simulation/simulation.constants";
import {
  E05_STRATEGY_AGENT_ID,
  E05_STRATEGY_BASE,
  E05_STRATEGY_VERSION,
  STRATEGY_PLAN_STEP_KINDS,
  STRATEGY_STANCES,
} from "../lib/intelligence/e05/strategy/strategy.constants";
import {
  STRATEGY_CATALOG,
  buildStrategyRegistryManifest,
  getStrategyById,
  listRequiredStrategies,
} from "../lib/intelligence/e05/strategy/strategy.registry";
import { planStrategy } from "../lib/intelligence/e05/strategy/strategy.planner";
import { executeStrategyOrThrow } from "../lib/intelligence/e05/strategy/strategy.engine";
import {
  appendStrategyTraceEvent,
  createStrategyRuntimeTrace,
} from "../lib/intelligence/e05/strategy/strategy.trace";

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

const FROZEN_E05_P5 = [
  "lib/intelligence/e05/optimization/optimization.types.ts",
  "lib/intelligence/e05/optimization/optimization.constants.ts",
  "lib/intelligence/e05/optimization/optimization.registry.ts",
  "lib/intelligence/e05/optimization/optimization.engine.ts",
  "lib/intelligence/e05/optimization/optimization.solver.ts",
  "lib/intelligence/e05/optimization/optimization.trace.ts",
] as const;

const FROZEN_E05_P6 = [
  "lib/intelligence/e05/simulation/simulation.types.ts",
  "lib/intelligence/e05/simulation/simulation.constants.ts",
  "lib/intelligence/e05/simulation/simulation.registry.ts",
  "lib/intelligence/e05/simulation/simulation.engine.ts",
  "lib/intelligence/e05/simulation/simulation.scenario.ts",
  "lib/intelligence/e05/simulation/simulation.trace.ts",
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
    "lib/intelligence/e05/strategy/strategy.types.ts",
    "lib/intelligence/e05/strategy/strategy.constants.ts",
    "lib/intelligence/e05/strategy/strategy.registry.ts",
    "lib/intelligence/e05/strategy/strategy.engine.ts",
    "lib/intelligence/e05/strategy/strategy.planner.ts",
    "lib/intelligence/e05/strategy/strategy.trace.ts",
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

  const optimization = buildOptimizationRegistryManifest();
  check(optimization.catalogComplete === true, "P5 ready");
  check(optimization.engineId === E05_OPTIMIZATION_ENGINE_ID, "P5 id");
  check(optimization.version === E05_OPTIMIZATION_VERSION, "P5 version");

  const simulation = buildSimulationRegistryManifest();
  check(simulation.catalogComplete === true, "P6 ready");
  check(simulation.runtimeId === E05_SIMULATION_RUNTIME_ID, "P6 id");
  check(simulation.version === E05_SIMULATION_VERSION, "P6 version");

  check(
    E05_STRATEGY_BASE === "enterprise-e05-enterprise-simulation-runtime-v1",
    "strategy base",
  );
  console.log("✓ E03 + E04 + E05 P1-P6 unmodified / bases intact");
}

function testRegistryAndPlanner() {
  check(STRATEGY_STANCES.length === 4, "stances");
  check(STRATEGY_PLAN_STEP_KINDS.length === 4, "step kinds");
  check(STRATEGY_CATALOG.length === 6, "catalog");
  check(listRequiredStrategies().length === 5, "required");

  const manifest = buildStrategyRegistryManifest();
  check(manifest.catalogComplete === true, "catalog complete");
  check(manifest.agentId === E05_STRATEGY_AGENT_ID, "agent id");
  check(manifest.version === E05_STRATEGY_VERSION, "version");
  check(manifest.base === E05_STRATEGY_BASE, "base");

  const opportunity = getStrategyById("e05.strategy.opportunity");
  check(Boolean(opportunity), "opportunity strategy");

  const plan = planStrategy(opportunity!, {
    simulationId: "e05.sim.opportunity",
    bestScenarioId: "sc.opp.optimistic",
    worstScenarioId: "sc.opp.pessimistic",
    spread: 0.3,
    verdict: "prefer optimistic",
    results: [
      {
        scenarioId: "sc.opp.baseline",
        kind: "baseline",
        selectedAction: "hold",
        selectedOptionId: "opt.opp.hold",
        score: 0.6,
        optimizationSummary: "baseline",
        input: {},
        readOnly: true,
      },
      {
        scenarioId: "sc.opp.optimistic",
        kind: "optimistic",
        selectedAction: "accelerate",
        selectedOptionId: "opt.opp.accelerate",
        score: 0.85,
        optimizationSummary: "accelerate pursuit",
        input: {},
        readOnly: true,
      },
      {
        scenarioId: "sc.opp.pessimistic",
        kind: "pessimistic",
        selectedAction: "reprioritize",
        selectedOptionId: "opt.opp.reprioritize",
        score: 0.4,
        optimizationSummary: "reprioritize",
        input: {},
        readOnly: true,
      },
    ],
    readOnly: true,
  });

  check(plan.steps.length === 4, "plan steps");
  check(plan.preferredScenarioId === "sc.opp.optimistic", "preferred scenario");
  check(plan.preferredAction === "accelerate", "preferred action");
  check(plan.stance === "aggressive", "stance aggressive");
  check(plan.confidence > 0, "confidence");

  console.log("✓ registry + planner");
}

function testEngineAndTrace() {
  const trace = createStrategyRuntimeTrace({
    instanceId: "inst_x",
    strategyId: "e05.strategy.opportunity",
    taskId: "task_x",
  });
  const withEvent = appendStrategyTraceEvent(trace, "ready", "boot");
  check(withEvent.eventCount === 1, "trace event");

  const opportunity = getStrategyById("e05.strategy.opportunity");
  check(Boolean(opportunity), "opportunity strategy present");

  const run = executeStrategyOrThrow(opportunity!, {
    input: {
      goal: "星河科技园健身中心策略生成",
      opportunityScore: 82,
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "verify-e05-p7" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.plan.steps.length === 4, "steps");
  check(Boolean(run.result.plan.preferredScenarioId), "scenario chosen");
  check(Boolean(run.result.plan.preferredAction), "action chosen");
  check(run.result.simulationId === "e05.sim.opportunity", "simulation bound");
  check(run.trace.eventCount >= 4, "trace events");
  check(run.result.traceId === run.trace.traceId, "trace linked");

  for (const strategy of listRequiredStrategies()) {
    const bundle = executeStrategyOrThrow(strategy, {
      input: {
        goal: `probe:${strategy.id}`,
        opportunityScore: 82,
        riskIndex: 25,
        pricingBand: 3,
        complianceRatio: 0.92,
        milestoneCount: 6,
        synthesisIndex: 78,
      },
    });
    check(bundle.result.success === true, `${strategy.id} success`);
    check(bundle.result.plan.steps.length === 4, `${strategy.id} steps`);
  }

  console.log("✓ strategy engine → simulation bridge");
}

function main() {
  console.log("E05-P7 — Autonomous Strategy Agent Verification\n");

  const baseline: Record<string, string> = {};
  for (const rel of [
    ...FROZEN_E05_P1,
    ...FROZEN_E05_P2,
    ...FROZEN_E05_P3,
    ...FROZEN_E05_P4,
    ...FROZEN_E05_P5,
    ...FROZEN_E05_P6,
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
  checkFrozen("E05 P5", FROZEN_E05_P5, baseline);
  checkFrozen("E05 P6", FROZEN_E05_P6, baseline);
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();
  testRegistryAndPlanner();
  testEngineAndTrace();
  checkFrozen("E05 P1", FROZEN_E05_P1, baseline);
  checkFrozen("E05 P2", FROZEN_E05_P2, baseline);
  checkFrozen("E05 P3", FROZEN_E05_P3, baseline);
  checkFrozen("E05 P4", FROZEN_E05_P4, baseline);
  checkFrozen("E05 P5", FROZEN_E05_P5, baseline);
  checkFrozen("E05 P6", FROZEN_E05_P6, baseline);
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();

  console.log("\nPASS — E05 P7 autonomous strategy agent");
}

main();

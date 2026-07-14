/**
 * E05-P8 — Collect per-phase readiness via P1–P7 intelligence chain (read-only)
 */

import { buildIntelligenceFoundation } from "../core/intelligence.lifecycle";
import { buildAnalyticsRegistryManifest } from "../analytics/analytics.registry";
import { buildKpiRegistryManifest } from "../kpi/kpi.registry";
import { buildForecastRegistryManifest } from "../forecast/forecast.registry";
import { buildOptimizationRegistryManifest } from "../optimization/optimization.registry";
import { buildSimulationRegistryManifest } from "../simulation/simulation.registry";
import {
  buildStrategyRegistryManifest,
  getStrategyById,
} from "../strategy/strategy.registry";
import { executeStrategyOrThrow } from "../strategy/strategy.engine";

import type {
  ReadinessReport,
  StrategyBaselineSnapshot,
} from "./signoff.types";

function runStrategyBaseline(deploymentId: string) {
  const strategy = getStrategyById("e05.strategy.opportunity");
  if (!strategy) {
    throw new Error("missing strategy e05.strategy.opportunity");
  }

  return executeStrategyOrThrow(strategy, {
    taskId: `${deploymentId}-strategy`,
    input: {
      goal: "E05 P8 intelligence governance freeze baseline",
      opportunityScore: 82,
      riskIndex: 25,
      pricingBand: 3,
      complianceRatio: 0.92,
      milestoneCount: 6,
      synthesisIndex: 78,
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "e05-p8-signoff", deploymentId },
  });
}

export function collectStrategyBaseline(
  deploymentId: string,
): StrategyBaselineSnapshot {
  const run = runStrategyBaseline(`${deploymentId}-baseline`);

  return {
    ready: run.result.success && run.result.plan.steps.length === 4,
    strategyId: run.result.strategyId,
    simulationId: run.result.simulationId,
    stance: run.result.plan.stance,
    preferredAction: run.result.plan.preferredAction,
    stepCount: run.result.plan.steps.length,
    readinessScore: run.result.success ? 100 : 0,
  };
}

export function collectIntelligencePhaseReadiness(
  deploymentId: string,
): ReadinessReport {
  try {
    const foundation = buildIntelligenceFoundation();
    const analytics = buildAnalyticsRegistryManifest();
    const kpi = buildKpiRegistryManifest();
    const forecast = buildForecastRegistryManifest();
    const optimization = buildOptimizationRegistryManifest();
    const simulation = buildSimulationRegistryManifest();
    const strategy = buildStrategyRegistryManifest();
    const baseline = collectStrategyBaseline(deploymentId);

    const p1 = foundation.ready === true;
    const p2 = analytics.catalogComplete === true;
    const p3 = kpi.catalogComplete === true;
    const p4 = forecast.catalogComplete === true;
    const p5 = optimization.catalogComplete === true;
    const p6 = simulation.catalogComplete === true;
    const p7 = strategy.catalogComplete === true && baseline.ready;

    const ready = p1 && p2 && p3 && p4 && p5 && p6 && p7;
    const blocked = !ready;

    return {
      p1,
      p2,
      p3,
      p4,
      p5,
      p6,
      p7,
      ready,
      blocked,
      summary: [
        `readiness ready=${ready}`,
        `phases=${[p1, p2, p3, p4, p5, p6, p7].filter(Boolean).length}/7`,
        `blocked=${blocked}`,
      ].join(" "),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "readiness failed";
    return {
      p1: false,
      p2: false,
      p3: false,
      p4: false,
      p5: false,
      p6: false,
      p7: false,
      ready: false,
      blocked: true,
      summary: `readiness ready=false blocked=true error=${message}`,
    };
  }
}

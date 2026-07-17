/**
 * E06-P5 — Self Optimization Evaluator
 * Scores control plan results and measures optimization effect
 */

import type { ControlPlanResult } from "../control/control.types";
import type {
  OptimizationEvaluation,
  OptimizationMeasurement,
} from "./optimization.types";

export function evaluateControlPlan(
  plan: ControlPlanResult,
  targetScore: number,
): OptimizationEvaluation {
  const completedSteps = plan.runs.reduce(
    (sum, run) => sum + run.completedSteps,
    0,
  );
  const stepCount = plan.runs.reduce((sum, run) => sum + run.stepCount, 0);
  const score =
    stepCount === 0 ? 0 : Math.round((completedSteps / stepCount) * 100);

  const findings: string[] = [];
  for (const run of plan.runs) {
    if (!run.success) {
      findings.push(
        `${run.controlId} ${run.status}: ${run.errorMessage ?? "unknown"}`,
      );
    }
  }
  if (plan.health.status !== "green") {
    findings.push(`health=${plan.health.status}`);
  }

  return {
    planId: plan.planId,
    healthStatus: plan.health.status,
    score,
    completedSteps,
    stepCount,
    findings,
    needsOptimization: score < targetScore || plan.health.status !== "green",
    readOnly: true,
  };
}

export function measureOptimization(
  baseline: OptimizationEvaluation,
  optimized: OptimizationEvaluation,
  targetScore: number,
): OptimizationMeasurement {
  const delta = optimized.score - baseline.score;
  const improved = delta > 0 || (!baseline.needsOptimization && delta === 0);
  const reachedTarget =
    optimized.score >= targetScore && optimized.healthStatus === "green";

  return {
    baselineScore: baseline.score,
    optimizedScore: optimized.score,
    delta,
    improved,
    reachedTarget,
    verdict: [
      `baseline=${baseline.score}`,
      `optimized=${optimized.score}`,
      `delta=${delta >= 0 ? "+" : ""}${delta}`,
      `target${reachedTarget ? " reached" : " missed"}`,
    ].join(" "),
    readOnly: true,
  };
}

/**
 * E05-P5 — Optimization Solver
 * Evaluates options against forecast projection and ranks recommendations
 */

import type { ForecastProjection } from "../forecast/forecast.types";
import type {
  OptimizationDefinition,
  OptimizationOptionScore,
  OptimizationRecommendation,
} from "./optimization.types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function objectiveAligned(
  objective: OptimizationDefinition["objective"],
  direction: ForecastProjection["direction"],
): number {
  switch (objective) {
    case "maximize":
      return direction === "up" ? 1 : direction === "flat" ? 0.4 : 0;
    case "minimize":
      return direction === "down" ? 1 : direction === "flat" ? 0.4 : 0;
    case "stabilize":
      return direction === "flat" ? 1 : 0.35;
  }
}

function actionAffinity(
  action: OptimizationDefinition["options"][number]["action"],
  direction: ForecastProjection["direction"],
  objective: OptimizationDefinition["objective"],
): number {
  switch (action) {
    case "accelerate":
      return objective === "maximize" && direction !== "down" ? 1 : 0.4;
    case "hold":
      return direction === "flat" || objective === "stabilize" ? 1 : 0.5;
    case "hedge":
      return direction === "down" || objective === "minimize" ? 1 : 0.45;
    case "reprioritize":
      return direction === "down" ? 0.9 : 0.55;
  }
}

export function solveOptimization(
  optimization: OptimizationDefinition,
  projection: ForecastProjection,
): OptimizationRecommendation {
  const alignment = objectiveAligned(optimization.objective, projection.direction);
  const scores: OptimizationOptionScore[] = [];

  for (const option of optimization.options) {
    const affinity = actionAffinity(
      option.action,
      projection.direction,
      optimization.objective,
    );
    const confidenceBoost = projection.confidence;
    const costPenalty = clamp(option.cost / 10, 0, 0.4);
    const score = clamp(
      affinity * 0.45 +
        alignment * 0.25 +
        confidenceBoost * 0.2 +
        option.bias * 0.2 -
        costPenalty,
      0,
      1,
    );

    scores.push({
      optionId: option.id,
      action: option.action,
      score,
      rationale: [
        `${option.label}`,
        `affinity=${affinity.toFixed(2)}`,
        `bias=${option.bias.toFixed(2)}`,
        `cost=${option.cost.toFixed(2)}`,
      ].join("; "),
      readOnly: true,
    });
  }

  const ranked = [...scores].sort(
    (a, b) => b.score - a.score || a.optionId.localeCompare(b.optionId),
  );
  const selected = ranked[0]!;
  const selectedOption = optimization.options.find(
    (o) => o.id === selected.optionId,
  )!;

  return {
    optimizationId: optimization.id,
    forecastId: optimization.forecastId,
    selectedOptionId: selected.optionId,
    selectedAction: selected.action,
    scores: Object.freeze([...ranked]) as OptimizationOptionScore[],
    summary: [
      `${optimization.name} recommends ${selectedOption.label}`,
      `(action=${selected.action}, score=${selected.score.toFixed(2)})`,
      `given forecast ${projection.direction} toward ${projection.projected.toFixed(2)}`,
    ].join(" "),
    readOnly: true,
  };
}

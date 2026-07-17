/**
 * E06-P6 — Enterprise Digital Twin State Model
 * Builds state models and projections from twin signals
 */

import type {
  TwinDefinition,
  TwinProjection,
  TwinStateHealth,
  TwinStateModel,
  TwinStateSignal,
} from "./twin.types";

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function healthFromScore(
  score: number,
  stableThreshold: number,
): TwinStateHealth {
  if (score >= stableThreshold) return "stable";
  if (score >= stableThreshold / 2) return "strained";
  return "critical";
}

/** Merge live input over declared signals, weighting each into a 0-100 score. */
export function buildTwinStateModel(
  twin: TwinDefinition,
  input: Readonly<Record<string, unknown>> = {},
): TwinStateModel {
  const signals: TwinStateSignal[] = twin.signals.map((signal) => {
    const override = input[signal.field];
    const value =
      typeof override === "number" ? override : signal.value;
    return {
      field: signal.field,
      value: clamp01(value),
      weight: signal.weight,
      readOnly: true,
    };
  });

  const weightTotal = signals.reduce((sum, s) => sum + s.weight, 0) || 1;
  const weighted = signals.reduce((sum, s) => sum + s.value * s.weight, 0);
  const score = Math.round((weighted / weightTotal) * 100);
  const health = healthFromScore(score, twin.stableThreshold);

  return {
    twinId: twin.id,
    domain: twin.domain,
    health,
    score,
    signalCount: signals.length,
    signals: Object.freeze([...signals]) as TwinStateSignal[],
    narrative: [
      `${twin.name} state=${health}`,
      `score=${score}`,
      `signals=${signals.map((s) => `${s.field}:${s.value.toFixed(2)}`).join(",")}`,
    ].join(" "),
    readOnly: true,
  };
}

/**
 * Project the twin state forward given an optimization delta (0-100 scale)
 * measured by the self optimization loop.
 */
export function projectTwinState(
  twin: TwinDefinition,
  model: TwinStateModel,
  optimizationDelta: number,
): TwinProjection {
  const projectedScore = Math.max(
    0,
    Math.min(100, model.score + optimizationDelta),
  );
  const projectedHealth = healthFromScore(projectedScore, twin.stableThreshold);
  const delta = projectedScore - model.score;
  const converged = projectedScore >= twin.stableThreshold;

  return {
    twinId: twin.id,
    baselineScore: model.score,
    projectedScore,
    delta,
    projectedHealth,
    converged,
    verdict: [
      `baseline=${model.score}`,
      `projected=${projectedScore}`,
      `delta=${delta >= 0 ? "+" : ""}${delta}`,
      `state=${projectedHealth}`,
      converged ? "converged" : "unconverged",
    ].join(" "),
    readOnly: true,
  };
}

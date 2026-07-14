/**
 * E05-P4 — Forecast Model
 * Minimal projection models from KPI baseline values
 */

import type { KpiEvaluation } from "../kpi/kpi.types";
import type {
  ForecastDefinition,
  ForecastDirection,
  ForecastPoint,
  ForecastProjection,
} from "./forecast.types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function directionOf(delta: number): ForecastDirection {
  if (delta > 0.01) return "up";
  if (delta < -0.01) return "down";
  return "flat";
}

function horizonFactor(horizon: ForecastDefinition["horizon"]): number {
  switch (horizon) {
    case "near":
      return 0.05;
    case "mid":
      return 0.1;
    case "far":
      return 0.18;
  }
}

export function projectForecast(
  forecast: ForecastDefinition,
  evaluation: KpiEvaluation,
): ForecastProjection {
  const baseline = evaluation.value;
  const steps = Math.max(1, forecast.steps);
  const factor = horizonFactor(forecast.horizon);
  const points: ForecastPoint[] = [];

  let projected = baseline;

  switch (forecast.modelKind) {
    case "linear": {
      const slope =
        evaluation.delta !== undefined
          ? evaluation.delta * 0.15
          : baseline * factor * 0.25;
      for (let step = 1; step <= steps; step += 1) {
        const value = baseline + slope * step;
        points.push({ step, value, readOnly: true });
      }
      projected = points[points.length - 1]!.value;
      break;
    }
    case "momentum": {
      const momentum =
        evaluation.status === "green"
          ? factor
          : evaluation.status === "red"
            ? -factor
            : factor * 0.25;
      let current = baseline;
      for (let step = 1; step <= steps; step += 1) {
        current = current * (1 + momentum / steps);
        points.push({ step, value: current, readOnly: true });
      }
      projected = points[points.length - 1]!.value;
      break;
    }
    case "target-gap": {
      const target = evaluation.target ?? baseline;
      const gap = target - baseline;
      for (let step = 1; step <= steps; step += 1) {
        const value = baseline + (gap * step) / steps;
        points.push({ step, value, readOnly: true });
      }
      projected = points[points.length - 1]!.value;
      break;
    }
  }

  const direction = directionOf(projected - baseline);
  const confidence = clamp(
    evaluation.status === "green"
      ? 0.85
      : evaluation.status === "amber"
        ? 0.7
        : evaluation.status === "red"
          ? 0.55
          : 0.4,
    0,
    1,
  );

  const narrative = [
    `${forecast.name} projects ${direction}`,
    `from ${baseline.toFixed(2)} to ${projected.toFixed(2)}`,
    `over ${steps} ${forecast.horizon} step(s)`,
    `(model=${forecast.modelKind}, confidence=${confidence.toFixed(2)})`,
  ].join(" ");

  return {
    forecastId: forecast.id,
    kpiId: forecast.kpiId,
    modelKind: forecast.modelKind,
    horizon: forecast.horizon,
    baseline,
    projected,
    direction,
    confidence,
    points: Object.freeze([...points]) as ForecastPoint[],
    narrative,
    readOnly: true,
  };
}

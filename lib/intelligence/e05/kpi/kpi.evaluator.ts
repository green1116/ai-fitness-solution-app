/**
 * E05-P3 — KPI Evaluator
 * Interprets metric values into KPI status
 */

import type { MetricValue } from "../analytics/analytics.types";
import type { KpiDefinition, KpiEvaluation, KpiStatus } from "./kpi.types";

function statusFromThresholds(
  value: number,
  thresholds: KpiDefinition["thresholds"],
): KpiStatus {
  const { green, amber, lowerIsBetter } = thresholds;

  if (lowerIsBetter) {
    if (value <= green) return "green";
    if (value <= amber) return "amber";
    return "red";
  }

  if (value >= green) return "green";
  if (value >= amber) return "amber";
  return "red";
}

function buildInterpretation(
  kpi: KpiDefinition,
  value: number,
  status: KpiStatus,
): string {
  switch (status) {
    case "green":
      return `${kpi.name} meets target posture (value=${value})`;
    case "amber":
      return `${kpi.name} needs attention (value=${value})`;
    case "red":
      return `${kpi.name} below acceptable band (value=${value})`;
    default:
      return `${kpi.name} could not be interpreted`;
  }
}

export function evaluateKpi(
  kpi: KpiDefinition,
  metric: MetricValue,
): KpiEvaluation {
  if (metric.metricId !== kpi.metricId) {
    throw new Error(
      `metric mismatch: expected ${kpi.metricId} got ${metric.metricId}`,
    );
  }

  const status = statusFromThresholds(metric.value, kpi.thresholds);
  const delta =
    kpi.target !== undefined ? metric.value - kpi.target : undefined;

  return {
    kpiId: kpi.id,
    metricId: kpi.metricId,
    value: metric.value,
    status,
    target: kpi.target,
    delta,
    interpretation: buildInterpretation(kpi, metric.value, status),
    readOnly: true,
  };
}

export function evaluateKpiFromValue(
  kpi: KpiDefinition,
  value: number,
): KpiEvaluation {
  return evaluateKpi(kpi, {
    metricId: kpi.metricId,
    kind: "score",
    value,
    label: kpi.name,
    readOnly: true,
  });
}

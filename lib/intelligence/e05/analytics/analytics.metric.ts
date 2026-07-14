/**
 * E05-P2 — Business Analytics Metric calculation
 */

import type { MetricDefinition, MetricValue } from "./analytics.types";

export const METRIC_CATALOG: MetricDefinition[] = [
  {
    id: "e05.metric.opportunity-score",
    kind: "score",
    name: "Opportunity Score",
    description: "Composite opportunity readiness score",
    field: "opportunityScore",
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.metric.risk-index",
    kind: "index",
    name: "Risk Index",
    description: "Normalized risk exposure index",
    field: "riskIndex",
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.metric.pricing-band",
    kind: "band",
    name: "Pricing Band",
    description: "Commercial pricing band position",
    field: "pricingBand",
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.metric.compliance-ratio",
    kind: "ratio",
    name: "Compliance Ratio",
    description: "Compliance checklist completion ratio",
    field: "complianceRatio",
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.metric.delivery-count",
    kind: "count",
    name: "Delivery Milestone Count",
    description: "Count of delivery milestones tracked",
    field: "milestoneCount",
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.metric.synthesis-index",
    kind: "index",
    name: "Synthesis Index",
    description: "Cross-domain synthesis rollup index",
    field: "synthesisIndex",
    optional: false,
    readOnly: true,
  },
];

export function getMetricById(id: string): MetricDefinition | undefined {
  return METRIC_CATALOG.find((m) => m.id === id);
}

function readNumeric(input: Readonly<Record<string, unknown>>, field: string): number {
  const value = input[field];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

export function calculateMetric(
  metric: MetricDefinition,
  input: Readonly<Record<string, unknown>>,
): MetricValue {
  const raw = readNumeric(input, metric.field);

  let value = raw;
  switch (metric.kind) {
    case "score":
      value = Math.min(100, Math.max(0, raw || 72));
      break;
    case "ratio":
      value = Math.min(1, Math.max(0, raw || 0.85));
      break;
    case "band":
      value = Math.min(5, Math.max(1, raw || 3));
      break;
    case "index":
      value = Math.min(100, Math.max(0, raw || 55));
      break;
    case "count":
      value = Math.max(0, Math.round(raw || 4));
      break;
  }

  return {
    metricId: metric.id,
    kind: metric.kind,
    value,
    label: metric.name,
    readOnly: true,
  };
}

export function calculateMetrics(
  metricIds: string[],
  input: Readonly<Record<string, unknown>>,
): MetricValue[] {
  const values: MetricValue[] = [];
  for (const metricId of metricIds) {
    const metric = getMetricById(metricId);
    if (!metric) {
      throw new Error(`unknown metric: ${metricId}`);
    }
    values.push(calculateMetric(metric, input));
  }
  return values;
}

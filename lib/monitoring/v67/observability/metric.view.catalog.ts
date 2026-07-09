/**
 * V67 P6 — Metric view catalog (declarative)
 */
import { SLI_TYPE_CATALOG } from "../slo/sli.types.catalog";
import { SLO_TYPE_CATALOG } from "../slo/slo.types.catalog";

import type { MetricViewDefinition, MetricViewManifest } from "./governance.types";
import { V67_OBSERVABILITY_DASHBOARD_VERSION } from "./governance.types";

export const METRIC_VIEW_CATALOG: MetricViewDefinition[] = [
  {
    id: "MV-001",
    name: "api_availability_gauge",
    kind: "gauge",
    sliRef: "SLIT-001",
    sloRef: "SLOT-001",
    unit: "percent",
    window: "30d",
    queryTemplate: "sum(good_events) / sum(valid_events) * 100",
    required: true,
    description: "API availability percentage gauge",
  },
  {
    id: "MV-002",
    name: "api_latency_histogram",
    kind: "histogram",
    sliRef: "SLIT-002",
    sloRef: "SLOT-002",
    unit: "ms",
    window: "1h",
    queryTemplate: "histogram_quantile(0.95, response_time_ms)",
    required: true,
    description: "P95 API latency histogram",
  },
  {
    id: "MV-003",
    name: "error_rate_counter",
    kind: "counter",
    sliRef: "SLIT-003",
    sloRef: "SLOT-003",
    unit: "percent",
    window: "5m",
    queryTemplate: "sum(5xx) / sum(total) * 100",
    required: true,
    description: "5xx error rate counter",
  },
  {
    id: "MV-004",
    name: "health_probe_gauge",
    kind: "gauge",
    sliRef: "SLIT-004",
    sloRef: "SLOT-004",
    unit: "percent",
    window: "24h",
    queryTemplate: "sum(probe_pass) / sum(probe_total) * 100",
    required: true,
    description: "Health probe pass rate gauge",
  },
  {
    id: "MV-005",
    name: "verify_chain_table",
    kind: "table",
    sliRef: "SLIT-005",
    sloRef: "SLOT-005",
    unit: "count",
    window: "24h",
    queryTemplate: "verify_chain_results{status}",
    required: true,
    description: "Deployment verify chain results table",
  },
  {
    id: "MV-006",
    name: "incident_timeline",
    kind: "timeline",
    sliRef: "SLIT-006",
    sloRef: "SLOT-006",
    unit: "minutes",
    window: "30d",
    queryTemplate: "incident_lifecycle_events{state}",
    required: true,
    description: "Incident lifecycle event timeline",
  },
  {
    id: "MV-007",
    name: "mttr_gauge",
    kind: "gauge",
    sliRef: "SLIT-006",
    sloRef: "SLOT-006",
    unit: "minutes",
    window: "30d",
    queryTemplate: "avg(resolve_time - trigger_time)",
    required: true,
    description: "Mean time to resolve gauge",
  },
  {
    id: "MV-008",
    name: "alert_volume_counter",
    kind: "counter",
    sliRef: "SLIT-007",
    unit: "count",
    window: "1h",
    queryTemplate: "sum(alerts_firing) by (severity)",
    required: true,
    description: "Alert volume by severity counter",
  },
];

export function buildMetricViewManifest(): MetricViewManifest {
  const views = METRIC_VIEW_CATALOG;
  const kinds = new Set(views.map((v) => v.kind));
  const catalogComplete = views.length >= 6 && kinds.size >= 4;

  return {
    version: V67_OBSERVABILITY_DASHBOARD_VERSION,
    viewCount: views.length,
    kindCount: kinds.size,
    catalogComplete,
    views,
    summary: [
      `metric-views count=${views.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getMetricViewById(id: string): MetricViewDefinition | undefined {
  return METRIC_VIEW_CATALOG.find((v) => v.id === id);
}

export function getMetricViewsBySliRef(sliRef: string): MetricViewDefinition[] {
  return METRIC_VIEW_CATALOG.filter((v) => v.sliRef === sliRef);
}

export function isSloRefsAligned(): boolean {
  const sloIds = new Set(SLO_TYPE_CATALOG.map((s) => s.id));
  const sliIds = new Set(SLI_TYPE_CATALOG.map((s) => s.id));

  const sloRefsValid = METRIC_VIEW_CATALOG.every(
    (v) => !v.sloRef || sloIds.has(v.sloRef),
  );
  const sliRefsValid = METRIC_VIEW_CATALOG.every((v) => sliIds.has(v.sliRef));

  return sloRefsValid && sliRefsValid;
}

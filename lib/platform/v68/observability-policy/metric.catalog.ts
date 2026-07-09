/**
 * V68 P7 — Metric catalog (declarative, aligned with P1 services & V67 refs)
 */
import type { MetricCatalogEntry, MetricCatalogManifest } from "./governance.types";
import { V68_OBSERVABILITY_POLICY_VERSION } from "./governance.types";

export const METRIC_CATALOG: MetricCatalogEntry[] = [
  {
    id: "OBS-MET-001",
    serviceDefRef: "SVC-DEF-001",
    monitoringRef: "SH-001",
    sloRef: "SLOT-001",
    metricViewRef: "MV-001",
    kind: "histogram",
    name: "http_request_duration_seconds",
    unit: "seconds",
    required: true,
    description: "Production API request latency histogram",
  },
  {
    id: "OBS-MET-002",
    serviceDefRef: "SVC-DEF-001",
    monitoringRef: "SH-001",
    sloRef: "SLOT-001",
    metricViewRef: "MV-002",
    kind: "counter",
    name: "http_requests_total",
    unit: "requests",
    required: true,
    description: "Production API request count",
  },
  {
    id: "OBS-MET-003",
    serviceDefRef: "SVC-DEF-002",
    monitoringRef: "SH-002",
    sloRef: "SLOT-002",
    metricViewRef: "MV-003",
    kind: "gauge",
    name: "health_probe_status",
    unit: "boolean",
    required: true,
    description: "Health probe up/down gauge",
  },
  {
    id: "OBS-MET-004",
    serviceDefRef: "SVC-DEF-003",
    monitoringRef: "SH-003",
    sloRef: "SLOT-003",
    metricViewRef: "MV-004",
    kind: "counter",
    name: "incident_state_transitions_total",
    unit: "transitions",
    required: true,
    description: "Incident lifecycle state transitions",
  },
  {
    id: "OBS-MET-005",
    serviceDefRef: "SVC-DEF-004",
    monitoringRef: "SH-004",
    sloRef: "SLOT-004",
    metricViewRef: "MV-005",
    kind: "counter",
    name: "alerts_routed_total",
    unit: "alerts",
    required: true,
    description: "Alert routing throughput",
  },
  {
    id: "OBS-MET-006",
    serviceDefRef: "SVC-DEF-006",
    monitoringRef: "SH-006",
    sloRef: "SLOT-006",
    metricViewRef: "MV-006",
    kind: "gauge",
    name: "verify_chain_pass_rate",
    unit: "percent",
    required: true,
    description: "Deployment verify chain pass rate",
  },
  {
    id: "OBS-MET-007",
    serviceDefRef: "SVC-DEF-007",
    monitoringRef: "SH-007",
    sloRef: "SLOT-007",
    metricViewRef: "MV-007",
    kind: "histogram",
    name: "readiness_probe_duration_seconds",
    unit: "seconds",
    required: true,
    description: "Readiness probe latency",
  },
  {
    id: "OBS-MET-008",
    serviceDefRef: "SVC-DEF-008",
    monitoringRef: "SH-008",
    sloRef: "SLOT-008",
    metricViewRef: "MV-008",
    kind: "gauge",
    name: "slo_error_budget_remaining",
    unit: "percent",
    required: true,
    description: "SLO error budget remaining",
  },
];

export function buildMetricCatalogManifest(): MetricCatalogManifest {
  const metrics = METRIC_CATALOG;
  const kinds = new Set(metrics.map((m) => m.kind));
  const catalogComplete = metrics.length >= 6 && kinds.size >= 3;

  return {
    version: V68_OBSERVABILITY_POLICY_VERSION,
    entryCount: metrics.length,
    kindCount: kinds.size,
    catalogComplete,
    metrics,
    summary: [
      `metric-catalog count=${metrics.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getMetricsByServiceRef(serviceDefRef: string): MetricCatalogEntry[] {
  return METRIC_CATALOG.filter((m) => m.serviceDefRef === serviceDefRef);
}

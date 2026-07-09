/**
 * V67 P6 — Dashboard catalog (declarative)
 */
import { SLO_TYPE_CATALOG } from "../slo/slo.types.catalog";

import type { DashboardCatalogManifest, DashboardDefinition } from "./governance.types";
import { V67_OBSERVABILITY_DASHBOARD_VERSION } from "./governance.types";
import { METRIC_VIEW_CATALOG } from "./metric.view.catalog";
import { SERVICE_HEALTH_CATALOG } from "./service.health.catalog";

export const DASHBOARD_CATALOG: DashboardDefinition[] = [
  {
    id: "DBD-001",
    kind: "overview",
    name: "production_overview",
    metricViewRefs: ["MV-001", "MV-002", "MV-003"],
    serviceHealthRefs: ["SH-001", "SH-002"],
    sloRefs: ["SLOT-001", "SLOT-003"],
    required: true,
    description: "Production health overview — availability, latency, error rate",
  },
  {
    id: "DBD-002",
    kind: "slo",
    name: "slo_governance_dashboard",
    metricViewRefs: ["MV-001", "MV-004", "MV-005"],
    serviceHealthRefs: ["SH-001"],
    sloRefs: ["SLOT-001", "SLOT-002", "SLOT-003"],
    required: true,
    description: "SLO objectives, error budgets, burn-rate views",
  },
  {
    id: "DBD-003",
    kind: "incident",
    name: "incident_ops_dashboard",
    metricViewRefs: ["MV-006", "MV-007"],
    serviceHealthRefs: ["SH-003", "SH-004"],
    sloRefs: ["SLOT-006"],
    required: true,
    description: "Active incidents, lifecycle state, MTTR tracking",
  },
  {
    id: "DBD-004",
    kind: "oncall",
    name: "oncall_response_dashboard",
    metricViewRefs: ["MV-007", "MV-008"],
    serviceHealthRefs: ["SH-005"],
    sloRefs: [],
    required: true,
    description: "On-call roster, escalation paths, response SLA",
  },
  {
    id: "DBD-005",
    kind: "service",
    name: "api_service_dashboard",
    metricViewRefs: ["MV-001", "MV-002", "MV-003"],
    serviceHealthRefs: ["SH-001"],
    sloRefs: ["SLOT-001", "SLOT-002"],
    required: true,
    description: "API service deep-dive health and performance",
  },
  {
    id: "DBD-006",
    kind: "deployment",
    name: "deployment_verify_dashboard",
    metricViewRefs: ["MV-005", "MV-008"],
    serviceHealthRefs: ["SH-006"],
    sloRefs: ["SLOT-005"],
    required: true,
    description: "Deployment verify chain and rollout health",
  },
  {
    id: "DBD-007",
    kind: "service",
    name: "health_probe_dashboard",
    metricViewRefs: ["MV-004"],
    serviceHealthRefs: ["SH-002", "SH-007"],
    sloRefs: ["SLOT-004"],
    required: true,
    description: "Health probe pass rate and readiness status",
  },
  {
    id: "DBD-008",
    kind: "overview",
    name: "alert_taxonomy_dashboard",
    metricViewRefs: ["MV-006", "MV-008"],
    serviceHealthRefs: ["SH-008"],
    sloRefs: [],
    required: true,
    description: "Alert volume, severity distribution, suppression state",
  },
];

export function buildDashboardCatalogManifest(): DashboardCatalogManifest {
  const dashboards = DASHBOARD_CATALOG;
  const kinds = new Set(dashboards.map((d) => d.kind));
  const catalogComplete = dashboards.length >= 6 && kinds.size >= 4;

  return {
    version: V67_OBSERVABILITY_DASHBOARD_VERSION,
    dashboardCount: dashboards.length,
    kindCount: kinds.size,
    catalogComplete,
    dashboards,
    summary: [
      `dashboards count=${dashboards.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getDashboardById(id: string): DashboardDefinition | undefined {
  return DASHBOARD_CATALOG.find((d) => d.id === id);
}

export function getDashboardsByKind(kind: DashboardDefinition["kind"]): DashboardDefinition[] {
  return DASHBOARD_CATALOG.filter((d) => d.kind === kind);
}

export function isDashboardRefsAligned(): boolean {
  const mvIds = new Set(METRIC_VIEW_CATALOG.map((m) => m.id));
  const shIds = new Set(SERVICE_HEALTH_CATALOG.map((s) => s.id));
  const sloIds = new Set(SLO_TYPE_CATALOG.map((s) => s.id));

  return DASHBOARD_CATALOG.every(
    (d) =>
      d.metricViewRefs.every((r) => mvIds.has(r)) &&
      d.serviceHealthRefs.every((r) => shIds.has(r)) &&
      d.sloRefs.every((r) => sloIds.has(r)),
  );
}

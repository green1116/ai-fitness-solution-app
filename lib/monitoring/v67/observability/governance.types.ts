/**
 * V67 P6 — Observability dashboard contract types (read-only)
 */
import type { AlertTypeCategory } from "../alerting/taxonomy.types";

export const V67_OBSERVABILITY_DASHBOARD_VERSION = "v67-observability-dashboard-1" as const;

export type DashboardKind =
  | "overview"
  | "service"
  | "slo"
  | "incident"
  | "oncall"
  | "deployment";

export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export type MetricViewKind = "gauge" | "counter" | "histogram" | "table" | "timeline";

export type SummaryScope = "global" | "service" | "slo" | "incident" | "oncall";

export type ObservabilityDashboardSignals = {
  oncallGovernanceReady?: boolean;
  dashboardCatalogComplete?: boolean;
  serviceHealthComplete?: boolean;
  metricViewComplete?: boolean;
  statusSummaryComplete?: boolean;
  sloRefsAligned?: boolean;
};

export type DashboardDefinition = {
  id: string;
  kind: DashboardKind;
  name: string;
  metricViewRefs: string[];
  serviceHealthRefs: string[];
  sloRefs: string[];
  required: boolean;
  description: string;
};

export type DashboardCatalogManifest = {
  version: typeof V67_OBSERVABILITY_DASHBOARD_VERSION;
  dashboardCount: number;
  kindCount: number;
  catalogComplete: boolean;
  dashboards: DashboardDefinition[];
  summary: string;
};

export type ServiceHealthDefinition = {
  id: string;
  serviceName: string;
  category: AlertTypeCategory;
  healthProbeRef: string;
  sloRef?: string;
  sliRef?: string;
  alertTypeRef?: string;
  defaultStatus: HealthStatus;
  required: boolean;
  description: string;
};

export type ServiceHealthManifest = {
  version: typeof V67_OBSERVABILITY_DASHBOARD_VERSION;
  serviceCount: number;
  statusCount: number;
  catalogComplete: boolean;
  services: ServiceHealthDefinition[];
  summary: string;
};

export type MetricViewDefinition = {
  id: string;
  name: string;
  kind: MetricViewKind;
  sliRef: string;
  sloRef?: string;
  unit: string;
  window: string;
  queryTemplate: string;
  required: boolean;
  description: string;
};

export type MetricViewManifest = {
  version: typeof V67_OBSERVABILITY_DASHBOARD_VERSION;
  viewCount: number;
  kindCount: number;
  catalogComplete: boolean;
  views: MetricViewDefinition[];
  summary: string;
};

export type StatusSummaryEntry = {
  id: string;
  scope: SummaryScope;
  name: string;
  sourceRefs: string[];
  rollupRule: string;
  healthMapping: string;
  required: boolean;
  description: string;
};

export type StatusSummaryManifest = {
  version: typeof V67_OBSERVABILITY_DASHBOARD_VERSION;
  entryCount: number;
  scopeCount: number;
  contractComplete: boolean;
  entries: StatusSummaryEntry[];
  summary: string;
};

export type ObservabilityDashboardReport = {
  version: typeof V67_OBSERVABILITY_DASHBOARD_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  oncallGovernanceVersion: string;
  oncallGovernanceReady: boolean;
  dashboardCatalog: DashboardCatalogManifest;
  serviceHealth: ServiceHealthManifest;
  metricViews: MetricViewManifest;
  statusSummary: StatusSummaryManifest;
  contractsReady: boolean;
  readinessScore: number;
  summary: string;
};

export type DeclarativeHealthInput = {
  availabilityPercent: number;
  errorRatePercent: number;
  sloObjectivePercent: number;
};

export type DeclarativeHealthResult = {
  status: HealthStatus;
  score: number;
};

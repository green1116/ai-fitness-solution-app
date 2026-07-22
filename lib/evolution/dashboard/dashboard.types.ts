/**
 * Evolution P4 — Enterprise Intelligence Dashboard types
 */

import type {
  BI_VIEW_MODES,
  CROSS_PLATFORM_DOMAINS,
  DASHBOARD_MANAGER_STATUSES,
  DASHBOARD_READINESS_VERDICTS,
  DASHBOARD_SCOPES,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_BASE,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_FREEZE_VERSION,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_VERSION,
  EXECUTIVE_TRENDS,
  OPERATIONAL_INSIGHT_KINDS,
} from "./dashboard.constants";

export type DashboardScope = (typeof DASHBOARD_SCOPES)[number];
export type ExecutiveTrend = (typeof EXECUTIVE_TRENDS)[number];
export type CrossPlatformDomain = (typeof CROSS_PLATFORM_DOMAINS)[number];
export type OperationalInsightKind = (typeof OPERATIONAL_INSIGHT_KINDS)[number];
export type BiViewMode = (typeof BI_VIEW_MODES)[number];
export type DashboardReadinessVerdict =
  (typeof DASHBOARD_READINESS_VERDICTS)[number];
export type DashboardManagerStatus =
  (typeof DASHBOARD_MANAGER_STATUSES)[number];

export type DashboardMetadata = Record<string, unknown>;

/** Intelligence dashboard model. */
export type IntelligenceDashboard = {
  id: string;
  name: string;
  productId: string;
  scope: DashboardScope;
  orchestrationId: string;
  growthDashboardId?: string;
  predictionModelId?: string;
  customerIntelligenceId?: string;
  executiveOpsDashboardId?: string;
  compositeScore: number;
  detail: string;
  metadata: DashboardMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateIntelligenceDashboardInput = {
  id?: string;
  name: string;
  productId: string;
  orchestrationId: string;
  growthDashboardId?: string;
  predictionModelId?: string;
  customerIntelligenceId?: string;
  executiveOpsDashboardId?: string;
  scope?: DashboardScope;
  metadata?: DashboardMetadata;
};

/** Executive analytics. */
export type ExecutiveAnalytics = {
  id: string;
  intelligenceDashboardId: string;
  trend: ExecutiveTrend;
  executiveScore: number;
  predictiveScore: number;
  customerScore: number;
  growthScore: number;
  operationsScore: number;
  highlights: string[];
  detail: string;
  analyzedAt: string;
};

export type ComputeExecutiveAnalyticsInput = {
  id?: string;
  intelligenceDashboardId: string;
};

/** Cross-platform metrics. */
export type CrossPlatformMetric = {
  domain: CrossPlatformDomain;
  score: number;
  label: string;
  present: boolean;
};

export type CrossPlatformMetrics = {
  id: string;
  intelligenceDashboardId: string;
  metrics: CrossPlatformMetric[];
  coverage: number;
  detail: string;
  computedAt: string;
};

export type ComputeCrossPlatformMetricsInput = {
  id?: string;
  intelligenceDashboardId: string;
};

/** Operational insights. */
export type OperationalInsight = {
  id: string;
  intelligenceDashboardId: string;
  kind: OperationalInsightKind;
  title: string;
  severity: number;
  detail: string;
  createdAt: string;
};

export type GenerateOperationalInsightsInput = {
  idPrefix?: string;
  intelligenceDashboardId: string;
};

/** Business intelligence view. */
export type BusinessIntelligenceView = {
  id: string;
  intelligenceDashboardId: string;
  mode: BiViewMode;
  headline: string;
  kpiCount: number;
  insightCount: number;
  biScore: number;
  narrative: string;
  detail: string;
  renderedAt: string;
};

export type RenderBusinessIntelligenceViewInput = {
  id?: string;
  intelligenceDashboardId: string;
  mode?: BiViewMode;
  executiveAnalyticsId?: string;
  crossPlatformMetricsId?: string;
};

/** Readiness. */
export type DashboardReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type DashboardReadinessResult = {
  intelligenceDashboardId: string;
  verdict: DashboardReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: DashboardReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type DashboardRegistryManifest = {
  dashboardId: typeof EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID;
  version: typeof EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_VERSION;
  freezeVersion: typeof EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_FREEZE_VERSION;
  base: typeof EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_BASE;
  intelligenceDashboardCount: number;
  executiveAnalyticsCount: number;
  crossPlatformMetricsCount: number;
  operationalInsightCount: number;
  businessIntelligenceViewCount: number;
};

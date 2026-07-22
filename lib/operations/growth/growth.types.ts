/**
 * Post-Launch P5 — Growth Analytics Operations types
 */

import type {
  EXPANSION_SIGNAL_KINDS,
  GROWTH_MANAGER_STATUSES,
  GROWTH_READINESS_VERDICTS,
  GROWTH_SIGNAL_STRENGTHS,
  GROWTH_TRENDS,
  OPERATIONS_GROWTH_ANALYTICS_BASE,
  OPERATIONS_GROWTH_ANALYTICS_FREEZE_VERSION,
  OPERATIONS_GROWTH_ANALYTICS_ID,
  OPERATIONS_GROWTH_ANALYTICS_VERSION,
} from "./growth.constants";

export type GrowthSignalStrength = (typeof GROWTH_SIGNAL_STRENGTHS)[number];
export type ExpansionSignalKind = (typeof EXPANSION_SIGNAL_KINDS)[number];
export type GrowthTrend = (typeof GROWTH_TRENDS)[number];
export type GrowthReadinessVerdict =
  (typeof GROWTH_READINESS_VERDICTS)[number];
export type GrowthManagerStatus = (typeof GROWTH_MANAGER_STATUSES)[number];

export type GrowthMetadata = Record<string, unknown>;

/** Usage analytics. */
export type UsageAnalyticsSnapshot = {
  id: string;
  productId: string;
  productTenantId?: string;
  customerHealthProfileId?: string;
  billingUsageQuantity: number;
  apiCallCount: number;
  activeMeters: number;
  trend: GrowthTrend;
  detail: string;
  computedAt: string;
};

export type ComputeUsageAnalyticsInput = {
  id?: string;
  productId: string;
  productTenantId?: string;
  customerHealthProfileId?: string;
};

/** Adoption metrics (ops growth view). */
export type GrowthAdoptionMetrics = {
  id: string;
  productId: string;
  customerHealthProfileId?: string;
  adoptionStage?: string;
  activeUsers: number;
  featureCount: number;
  engagementScore: number;
  healthScore: number;
  trend: GrowthTrend;
  detail: string;
  computedAt: string;
};

export type ComputeGrowthAdoptionInput = {
  id?: string;
  productId: string;
  customerHealthProfileId?: string;
};

/** Expansion signals. */
export type ExpansionSignal = {
  id: string;
  productId: string;
  productTenantId?: string;
  customerHealthProfileId?: string;
  kind: ExpansionSignalKind;
  strength: GrowthSignalStrength;
  score: number;
  detail: string;
  detectedAt: string;
};

export type DetectExpansionSignalsInput = {
  idPrefix?: string;
  productId: string;
  productTenantId?: string;
  customerHealthProfileId?: string;
};

/** Revenue insights. */
export type RevenueInsights = {
  id: string;
  productId?: string;
  productTenantId?: string;
  mrr: number;
  arr: number;
  totalPaid: number;
  totalInvoiced: number;
  activeSubscriptions: number;
  apiUsageCount: number;
  revenuePerApiCall?: number;
  trend: GrowthTrend;
  detail: string;
  computedAt: string;
};

export type ComputeRevenueInsightsInput = {
  id?: string;
  productId?: string;
  productTenantId?: string;
};

/** Growth dashboard. */
export type GrowthDashboard = {
  id: string;
  productId: string;
  productTenantId?: string;
  customerHealthProfileId?: string;
  usage: UsageAnalyticsSnapshot;
  adoption: GrowthAdoptionMetrics;
  expansionSignals: ExpansionSignal[];
  revenue: RevenueInsights;
  growthScore: number;
  trend: GrowthTrend;
  summary: string;
  builtAt: string;
};

export type BuildGrowthDashboardInput = {
  id?: string;
  productId: string;
  productTenantId?: string;
  customerHealthProfileId?: string;
};

/** Readiness. */
export type GrowthReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type GrowthReadinessResult = {
  dashboardId: string;
  verdict: GrowthReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: GrowthReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type GrowthRegistryManifest = {
  growthAnalyticsId: typeof OPERATIONS_GROWTH_ANALYTICS_ID;
  version: typeof OPERATIONS_GROWTH_ANALYTICS_VERSION;
  freezeVersion: typeof OPERATIONS_GROWTH_ANALYTICS_FREEZE_VERSION;
  base: typeof OPERATIONS_GROWTH_ANALYTICS_BASE;
  usageSnapshotCount: number;
  adoptionMetricCount: number;
  expansionSignalCount: number;
  revenueInsightCount: number;
  dashboardCount: number;
};

/**
 * Product Analytics — readiness / manifest types
 */

import type {
  ANALYTICS_MANAGER_STATUSES,
  ANALYTICS_READINESS_VERDICTS,
  PRODUCT_ANALYTICS_FOUNDATION_BASE,
  PRODUCT_ANALYTICS_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ANALYTICS_FOUNDATION_ID,
  PRODUCT_ANALYTICS_FOUNDATION_VERSION,
} from "./foundation.constants";

export type AnalyticsReadinessVerdict =
  (typeof ANALYTICS_READINESS_VERDICTS)[number];
export type AnalyticsManagerStatus =
  (typeof ANALYTICS_MANAGER_STATUSES)[number];

export type AnalyticsReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AnalyticsReadinessResult = {
  verdict: AnalyticsReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AnalyticsReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AnalyticsRegistryManifest = {
  foundationId: typeof PRODUCT_ANALYTICS_FOUNDATION_ID;
  version: typeof PRODUCT_ANALYTICS_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_ANALYTICS_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_ANALYTICS_FOUNDATION_BASE;
  metricCount: number;
  datasetCount: number;
  pipelineCount: number;
  reportCount: number;
};

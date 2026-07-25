/**
 * Product Customer Insight — readiness / manifest types
 */

import type {
  CUSTOMER_INSIGHT_MANAGER_STATUSES,
  CUSTOMER_INSIGHT_READINESS_VERDICTS,
  PRODUCT_CUSTOMER_INSIGHT_BASE,
  PRODUCT_CUSTOMER_INSIGHT_FREEZE_VERSION,
  PRODUCT_CUSTOMER_INSIGHT_ID,
  PRODUCT_CUSTOMER_INSIGHT_VERSION,
} from "./insight.constants";

export type CustomerInsightReadinessVerdict =
  (typeof CUSTOMER_INSIGHT_READINESS_VERDICTS)[number];
export type CustomerInsightManagerStatus =
  (typeof CUSTOMER_INSIGHT_MANAGER_STATUSES)[number];

export type CustomerInsightReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type CustomerInsightReadinessResult = {
  verdict: CustomerInsightReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: CustomerInsightReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type CustomerInsightRegistryManifest = {
  insightId: typeof PRODUCT_CUSTOMER_INSIGHT_ID;
  version: typeof PRODUCT_CUSTOMER_INSIGHT_VERSION;
  freezeVersion: typeof PRODUCT_CUSTOMER_INSIGHT_FREEZE_VERSION;
  base: typeof PRODUCT_CUSTOMER_INSIGHT_BASE;
  signalCount: number;
  scoreCount: number;
  segmentCount: number;
  recommendationCount: number;
};
